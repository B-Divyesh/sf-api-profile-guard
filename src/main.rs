use api_profile_guard::{
    evaluate, load_config, load_profile, write_receipt, AppError, Decision, DecisionKind,
    RequestInput, BLOCKED_EXIT,
};
use clap::{Args, Parser, Subcommand};
use std::fs;
use std::io::{self, Write};
use std::path::{Path, PathBuf};
use std::process::{Command, ExitCode};
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Debug, Parser)]
#[command(
    name = "apg",
    version,
    about = "Block API requests that do not match the resolved environment policy",
    long_about = "APG reads an environment file as text. It checks required values, host, method, path, body, and the production confirmation phrase. It writes a value-free receipt before starting your client. APG never makes a network request.",
    after_help = "QUICK START:\n  apg check --profile staging --method GET --url /v1/health\n  apg run --profile production --method POST --url /v1/orders --body-file body.json --ack-production production -- curl -X POST --data-binary @body.json '{url}'\n\nExit 10 means blocked before command execution. See https://api-profile-guard.sociobot.in for the config reference."
)]
struct Cli {
    /// Path to the policy file. Relative env and receipt paths resolve from its directory.
    #[arg(long, global = true, default_value = "apg.toml", value_name = "FILE")]
    config: PathBuf,

    /// Emit decision JSON. Allowed run decisions use stderr so child stdout stays clean.
    #[arg(long, global = true)]
    json: bool,

    #[command(subcommand)]
    command: Commands,
}

#[derive(Debug, Subcommand)]
enum Commands {
    /// Run a blocked and an allowed sample in an isolated temporary directory.
    Demo,

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

    /// Exact production confirmation phrase configured by the selected profile.
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
        Commands::Demo => run_demo(cli.json),
        Commands::Check(request) => {
            let (_, decision) = preflight(&cli.config, &request)?;
            print_decision(&decision, cli.json, &mut io::stdout())?;
            Ok(if decision.decision == DecisionKind::Allowed {
                0
            } else {
                BLOCKED_EXIT
            })
        }
        Commands::Run(run) => {
            let (loaded, decision) = preflight(&cli.config, &run.request)?;
            if decision.decision == DecisionKind::Blocked {
                print_decision(&decision, cli.json, &mut io::stdout())?;
                return Ok(BLOCKED_EXIT);
            }
            // An allowed run is a transparent wrapper around the child. Keep stdout
            // exclusively for the child so response bodies remain pipeable and send
            // the guard's preflight record to the diagnostic stream instead.
            print_decision(&decision, cli.json, &mut io::stderr())?;
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

fn run_demo(json: bool) -> Result<i32, AppError> {
    let nonce = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|e| AppError(format!("could not create demo workspace name: {e}")))?
        .as_nanos();
    let workspace = std::env::temp_dir().join(format!("apg-demo-{}-{nonce}", std::process::id()));
    fs::create_dir(&workspace).map_err(|e| {
        AppError(format!(
            "could not create demo workspace {}: {e}",
            workspace.display()
        ))
    })?;
    let config = workspace.join("apg.toml");
    let environment = workspace.join("production.env");
    let body = workspace.join("order.json");
    fs::write(&config, DEMO_CONFIG)?;
    fs::write(&environment, DEMO_ENVIRONMENT)?;
    fs::write(&body, DEMO_BODY)?;

    writeln!(io::stdout(), "API Profile Guard sample")?;
    writeln!(io::stdout(), "  workspace: {}", workspace.display())?;
    writeln!(io::stdout(), "  policy: {}", config.display())?;
    writeln!(io::stdout(), "  environment: {}", environment.display())?;
    writeln!(io::stdout(), "  request body: {}", body.display())?;

    let blocked = RequestArgs {
        profile: "production".into(),
        method: "POST".into(),
        url: "https://wrong.example/v1/orders".into(),
        body_file: Some(body.clone()),
        ack_production: Some("production".into()),
    };
    writeln!(io::stdout(), "\nSample 1 of 2 — wrong production host")?;
    let (_, blocked_decision) = preflight(&config, &blocked)?;
    print_decision(&blocked_decision, json, &mut io::stdout())?;

    let allowed = RequestArgs {
        profile: "production".into(),
        method: "POST".into(),
        url: "/v1/orders".into(),
        body_file: Some(body),
        ack_production: Some("production".into()),
    };
    writeln!(
        io::stdout(),
        "\nSample 2 of 2 — approved production request"
    )?;
    let (_, allowed_decision) = preflight(&config, &allowed)?;
    print_decision(&allowed_decision, json, &mut io::stdout())?;
    writeln!(
        io::stdout(),
        "\n  receipts: {}",
        workspace.join("receipts.jsonl").display()
    )?;
    writeln!(
        io::stdout(),
        "Demo complete. Your current directory was not changed."
    )?;
    Ok(0)
}

const DEMO_CONFIG: &str = r#"version = 1
receipt_log = "receipts.jsonl"

[profiles.production]
env_file = "production.env"
base_url_var = "API_BASE_URL"
required = ["API_BASE_URL", "API_TOKEN"]
credential_class = "live-sample"
production = true
acknowledgement = "production"
allowed_hosts = ["api.example.com"]
allow = ["POST /v1/orders"]
deny = ["* /v1/admin/*"]
required_json_fields = ["customer.id"]
forbidden_json_fields = ["debug"]
"#;

const DEMO_ENVIRONMENT: &str =
    "API_BASE_URL=https://api.example.com\nAPI_TOKEN=sample-only-token\n";
const DEMO_BODY: &str = "{\"customer\":{\"id\":\"cus_sample_1042\"},\"amount\":4900}\n";

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

fn print_decision(
    decision: &Decision,
    json: bool,
    output: &mut impl Write,
) -> Result<(), AppError> {
    if json {
        writeln!(
            output,
            "{}",
            serde_json::to_string(decision)
                .map_err(|e| AppError(format!("could not encode JSON output: {e}")))?
        )
        .map_err(|e| AppError(format!("could not write decision output: {e}")))?;
        return Ok(());
    }
    let mark = match decision.decision {
        DecisionKind::Allowed => "✓ ALLOWED",
        DecisionKind::Blocked => "✕ BLOCKED",
    };
    writeln!(
        output,
        "{mark}  {} · {}",
        decision.profile, decision.fingerprint
    )
    .map_err(|e| AppError(format!("could not write decision output: {e}")))?;
    writeln!(
        output,
        "  {} {}{}",
        decision.method,
        decision.host.as_deref().unwrap_or("unresolved"),
        decision.path
    )
    .map_err(|e| AppError(format!("could not write decision output: {e}")))?;
    if !decision.credential_class.is_empty() {
        writeln!(output, "  credential class: {}", decision.credential_class)
            .map_err(|e| AppError(format!("could not write decision output: {e}")))?;
    }
    for reason in &decision.reasons {
        writeln!(output, "  - {}: {}", reason.code, reason.message)
            .map_err(|e| AppError(format!("could not write decision output: {e}")))?;
    }
    if let Some(receipt) = &decision.receipt {
        writeln!(output, "  receipt: {receipt}")
            .map_err(|e| AppError(format!("could not write decision output: {e}")))?;
    }
    Ok(())
}
