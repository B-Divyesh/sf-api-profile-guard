use api_profile_guard::{
    evaluate, load_config, load_profile, write_receipt, AppError, Decision, DecisionKind,
    RequestInput, BLOCKED_EXIT,
};
use clap::{Args, Parser, Subcommand};
use std::fs;
use std::path::{Path, PathBuf};
use std::process::{Command, ExitCode};

#[derive(Debug, Parser)]
#[command(
    name = "apg",
    version,
    about = "Block API requests that do not match the resolved environment policy",
    long_about = "API Profile Guard resolves a literal dotenv profile, checks required variables, host, method/path, body, and production acknowledgement, writes a value-free receipt, and only then starts your client. It never performs a network request itself.",
    after_help = "QUICK START:\n  apg check --profile staging --method GET --url /v1/health\n  apg run --profile production --method POST --url /v1/orders --body-file body.json --ack-production production -- curl -X POST --data-binary @body.json '{url}'\n\nExit 10 means blocked before command execution. See https://api-profile-guard.sociobot.in for the config reference."
)]
struct Cli {
    /// Path to the policy file. Relative env and receipt paths resolve from its directory.
    #[arg(long, global = true, default_value = "apg.toml", value_name = "FILE")]
    config: PathBuf,

    /// Emit one JSON object for scripting. Diagnostics still use stderr.
    #[arg(long, global = true)]
    json: bool,

    #[command(subcommand)]
    command: Commands,
}

#[derive(Debug, Subcommand)]
enum Commands {
    /// Evaluate and receipt a request without opening a network connection.
    Check(RequestArgs),

    /// Evaluate a request, then start a command only when allowed.
    Run(RunArgs),
}

#[derive(Debug, Args)]
struct RequestArgs {
    /// Profile key from [profiles.NAME] in apg.toml.
    #[arg(long, value_name = "NAME")]
    profile: String,

    /// HTTP method to evaluate (for example GET, POST, or DELETE).
    #[arg(long, value_name = "METHOD")]
    method: String,

    /// Absolute request URL or path resolved against the profile base URL.
    #[arg(long, value_name = "URL_OR_PATH")]
    url: String,

    /// Request body to inspect locally. Content is never written to receipts.
    #[arg(long, value_name = "FILE")]
    body_file: Option<PathBuf>,

    /// Exact production phrase configured by the selected profile.
    #[arg(long, value_name = "PHRASE")]
    ack_production: Option<String>,
}

#[derive(Debug, Args)]
struct RunArgs {
    #[command(flatten)]
    request: RequestArgs,

    /// Command and arguments. Use -- before the command; exact {url} args are replaced.
    #[arg(last = true, required = true, num_args = 1.., allow_hyphen_values = true)]
    command: Vec<String>,
}

fn main() -> ExitCode {
    match execute(Cli::parse()) {
        Ok(code) => ExitCode::from(normalize_exit(code)),
        Err(error) => {
            eprintln!("apg: {error}");
            ExitCode::from(2)
        }
    }
}

fn normalize_exit(code: i32) -> u8 {
    if (0..=255).contains(&code) {
        code as u8
    } else {
        1
    }
}

fn execute(cli: Cli) -> Result<i32, AppError> {
    match cli.command {
        Commands::Check(request) => {
            let (_, decision) = preflight(&cli.config, &request)?;
            print_decision(&decision, cli.json)?;
            Ok(if decision.decision == DecisionKind::Allowed {
                0
            } else {
                BLOCKED_EXIT
            })
        }
        Commands::Run(run) => {
            let (loaded, decision) = preflight(&cli.config, &run.request)?;
            print_decision(&decision, cli.json)?;
            if decision.decision == DecisionKind::Blocked {
                return Ok(BLOCKED_EXIT);
            }
            let resolved_url = decision
                .resolved_url
                .as_deref()
                .ok_or_else(|| AppError("allowed decision has no resolved URL".into()))?;
            let program = run
                .command
                .first()
                .ok_or_else(|| AppError("run requires a command after --".into()))?;
            let arguments = run.command[1..]
                .iter()
                .map(|argument| {
                    if argument == "{url}" {
                        resolved_url.to_owned()
                    } else {
                        argument.to_owned()
                    }
                })
                .collect::<Vec<_>>();
            let mut child = Command::new(program);
            child.args(arguments);
            child.envs(&loaded.values);
            child.env("APG_PROFILE", &decision.profile);
            child.env("APG_PROFILE_FINGERPRINT", &decision.fingerprint);
            child.env("APG_RESOLVED_URL", resolved_url);
            let status = child
                .status()
                .map_err(|e| AppError(format!("could not start command {program:?}: {e}")))?;
            Ok(status.code().unwrap_or(1))
        }
    }
}

fn preflight(
    config_path: &Path,
    request: &RequestArgs,
) -> Result<(api_profile_guard::LoadedProfile, Decision), AppError> {
    let config = load_config(config_path)?;
    let loaded = load_profile(&config, config_path, &request.profile)?;
    let body = request
        .body_file
        .as_ref()
        .map(|path| {
            fs::read(path)
                .map_err(|e| AppError(format!("could not read body {}: {e}", path.display())))
        })
        .transpose()?;
    let mut decision = evaluate(
        &loaded,
        &RequestInput {
            method: &request.method,
            request_url: &request.url,
            body: body.as_deref(),
            acknowledgement: request.ack_production.as_deref(),
        },
    )?;
    write_receipt(&config, config_path, &mut decision)?;
    Ok((loaded, decision))
}

fn print_decision(decision: &Decision, json: bool) -> Result<(), AppError> {
    if json {
        println!(
            "{}",
            serde_json::to_string(decision)
                .map_err(|e| AppError(format!("could not encode JSON output: {e}")))?
        );
        return Ok(());
    }
    let mark = match decision.decision {
        DecisionKind::Allowed => "✓ ALLOWED",
        DecisionKind::Blocked => "✕ BLOCKED",
    };
    println!("{mark}  {} · {}", decision.profile, decision.fingerprint);
    println!(
        "  {} {}{}",
        decision.method,
        decision.host.as_deref().unwrap_or("unresolved"),
        decision.path
    );
    if !decision.credential_class.is_empty() {
        println!("  credential class: {}", decision.credential_class);
    }
    for reason in &decision.reasons {
        println!("  - {}: {}", reason.code, reason.message);
    }
    if let Some(receipt) = &decision.receipt {
        println!("  receipt: {receipt}");
    }
    Ok(())
}
