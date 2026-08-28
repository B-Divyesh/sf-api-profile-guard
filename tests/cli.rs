#![cfg(unix)]

use std::fs;
use std::net::TcpListener;
use std::path::{Path, PathBuf};
use std::process::Command;
use std::time::{SystemTime, UNIX_EPOCH};

fn sandbox(label: &str) -> PathBuf {
    let nonce = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_nanos();
    let path = std::env::temp_dir().join(format!("apg-{label}-{}-{nonce}", std::process::id()));
    fs::create_dir_all(&path).unwrap();
    path
}

fn write_fixture(root: &Path, base_url: &str, with_token: bool, allowed_host: &str) {
    fs::write(
        root.join("apg.toml"),
        format!(
            r#"version = 1
receipt_log = ".apg/receipts.jsonl"

[profiles.production]
env_file = ".env.prod"
base_url_var = "API_BASE_URL"
required = ["API_BASE_URL", "API_TOKEN"]
credential_class = "live"
production = true
acknowledgement = "production"
allowed_hosts = ["{allowed_host}"]
allow = ["GET /v1/*"]
"#
        ),
    )
    .unwrap();
    let token = if with_token {
        "\nAPI_TOKEN=never-write-me"
    } else {
        ""
    };
    fs::write(
        root.join(".env.prod"),
        format!("API_BASE_URL={base_url}{token}\n"),
    )
    .unwrap();
}

fn binary() -> &'static str {
    env!("CARGO_BIN_EXE_apg")
}

#[test]
fn forbidden_production_host_never_starts_child_or_connects() {
    let root = sandbox("forbidden-host");
    let listener = TcpListener::bind("127.0.0.1:0").unwrap();
    listener.set_nonblocking(true).unwrap();
    let base = format!("http://{}", listener.local_addr().unwrap());
    write_fixture(&root, &base, true, "api.example.com");
    let marker = root.join("child-started");

    let output = Command::new(binary())
        .current_dir(&root)
        .args([
            "--json",
            "run",
            "--profile",
            "production",
            "--method",
            "GET",
            "--url",
            "/v1/health?secret=query",
            "--ack-production",
            "production",
            "--",
            "sh",
            "-c",
            &format!("touch {}; curl -s '{{url}}'", marker.display()),
        ])
        .output()
        .unwrap();

    assert_eq!(output.status.code(), Some(10));
    assert!(!marker.exists(), "blocked child was started");
    assert!(
        matches!(listener.accept(), Err(error) if error.kind() == std::io::ErrorKind::WouldBlock)
    );
    let stdout = String::from_utf8(output.stdout).unwrap();
    assert!(stdout.contains("host_not_allowed"));
    assert!(!stdout.contains("never-write-me"));
    assert!(!stdout.contains("secret=query"));

    let receipt = fs::read_to_string(root.join(".apg/receipts.jsonl")).unwrap();
    assert!(receipt.contains("host_not_allowed"));
    assert!(!receipt.contains("never-write-me"));
    assert!(!receipt.contains("secret=query"));
    fs::remove_dir_all(root).unwrap();
}

#[test]
fn missing_required_variable_never_starts_child() {
    let root = sandbox("missing-required");
    write_fixture(&root, "https://api.example.com", false, "api.example.com");
    let marker = root.join("child-started");
    let output = Command::new(binary())
        .current_dir(&root)
        .args([
            "run",
            "--profile",
            "production",
            "--method",
            "GET",
            "--url",
            "/v1/health",
            "--ack-production",
            "production",
            "--",
            "touch",
            marker.to_str().unwrap(),
        ])
        .output()
        .unwrap();
    assert_eq!(output.status.code(), Some(10));
    assert!(!marker.exists(), "blocked child was started");
    assert!(String::from_utf8(output.stdout)
        .unwrap()
        .contains("missing_required:API_TOKEN"));
    fs::remove_dir_all(root).unwrap();
}

#[test]
fn allowed_request_passes_profile_env_and_replaces_url() {
    let root = sandbox("allowed");
    write_fixture(&root, "https://api.example.com", true, "api.example.com");
    let marker = root.join("child-output");
    let script = format!(
        "test \"$API_TOKEN\" = never-write-me && printf '%s|%s' \"$APG_PROFILE\" \"$1\" > {}",
        marker.display()
    );
    let output = Command::new(binary())
        .current_dir(&root)
        .args([
            "run",
            "--profile",
            "production",
            "--method",
            "GET",
            "--url",
            "/v1/health",
            "--ack-production",
            "production",
            "--",
            "sh",
            "-c",
            &script,
            "apg-test",
            "{url}",
        ])
        .output()
        .unwrap();
    assert_eq!(
        output.status.code(),
        Some(0),
        "{}",
        String::from_utf8_lossy(&output.stderr)
    );
    assert_eq!(
        fs::read_to_string(&marker).unwrap(),
        "production|https://api.example.com/v1/health"
    );
    fs::remove_dir_all(root).unwrap();
}

#[test]
fn allowed_json_run_keeps_child_stdout_parseable_and_separate() {
    let root = sandbox("json-run-streams");
    write_fixture(&root, "https://api.example.com", true, "api.example.com");
    let output = Command::new(binary())
        .current_dir(&root)
        .args([
            "--json",
            "run",
            "--profile",
            "production",
            "--method",
            "GET",
            "--url",
            "/v1/health",
            "--ack-production",
            "production",
            "--",
            "sh",
            "-c",
            "printf '%s' '{\"from_child\":true}'",
        ])
        .output()
        .unwrap();

    assert_eq!(output.status.code(), Some(0));
    let child_value: serde_json::Value = serde_json::from_slice(&output.stdout).unwrap();
    assert_eq!(child_value["from_child"], true);

    let decision: serde_json::Value = serde_json::from_slice(&output.stderr).unwrap();
    assert_eq!(decision["decision"], "allowed");
    assert_eq!(decision["profile"], "production");
    fs::remove_dir_all(root).unwrap();
}

#[test]
fn demo_uses_only_a_new_temporary_workspace() {
    let caller = sandbox("demo-caller");
    fs::write(caller.join("keep.txt"), "unchanged").unwrap();
    let before = fs::read_dir(&caller)
        .unwrap()
        .map(|entry| entry.unwrap().file_name())
        .collect::<Vec<_>>();

    let output = Command::new(binary())
        .current_dir(&caller)
        .arg("demo")
        .output()
        .unwrap();
    assert_eq!(output.status.code(), Some(0));
    let stdout = String::from_utf8(output.stdout).unwrap();
    assert!(stdout.contains("Sample 1 of 2 — wrong production host"));
    assert!(stdout.contains("✕ BLOCKED"));
    assert!(stdout.contains("Sample 2 of 2 — approved production request"));
    assert!(stdout.contains("✓ ALLOWED"));

    let workspace = stdout
        .lines()
        .find_map(|line| line.trim().strip_prefix("workspace: "))
        .map(PathBuf::from)
        .expect("demo workspace path");
    assert!(workspace.starts_with(std::env::temp_dir()));
    assert!(workspace.join("apg.toml").is_file());
    assert!(workspace.join("production.env").is_file());
    assert!(workspace.join("order.json").is_file());
    assert_eq!(
        fs::read_to_string(workspace.join("receipts.jsonl"))
            .unwrap()
            .lines()
            .count(),
        2
    );
    let after = fs::read_dir(&caller)
        .unwrap()
        .map(|entry| entry.unwrap().file_name())
        .collect::<Vec<_>>();
    assert_eq!(before, after, "demo wrote into the caller directory");

    fs::remove_dir_all(workspace).unwrap();
    fs::remove_dir_all(caller).unwrap();
}
