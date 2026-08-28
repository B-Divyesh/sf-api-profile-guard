use chrono::{SecondsFormat, Utc};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::collections::{BTreeMap, BTreeSet};
use std::fs::{self, OpenOptions};
use std::io::Write;
use std::path::{Path, PathBuf};
use url::Url;

pub const BLOCKED_EXIT: i32 = 10;

#[derive(Debug)]
pub struct AppError(pub String);

impl std::fmt::Display for AppError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str(&self.0)
    }
}

impl std::error::Error for AppError {}

impl From<std::io::Error> for AppError {
    fn from(value: std::io::Error) -> Self {
        Self(value.to_string())
    }
}

#[derive(Debug, Clone, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Config {
    pub version: u32,
    #[serde(default = "default_receipt_log")]
    pub receipt_log: PathBuf,
    pub profiles: BTreeMap<String, Profile>,
}

fn default_receipt_log() -> PathBuf {
    PathBuf::from(".apg/receipts.jsonl")
}

#[derive(Debug, Clone, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Profile {
    pub env_file: PathBuf,
    #[serde(default = "default_base_url_var")]
    pub base_url_var: String,
    #[serde(default)]
    pub required: Vec<String>,
    #[serde(default)]
    pub credential_class: String,
    #[serde(default)]
    pub production: bool,
    pub acknowledgement: Option<String>,
    #[serde(default)]
    pub allowed_hosts: Vec<String>,
    #[serde(default)]
    pub allow: Vec<String>,
    #[serde(default)]
    pub deny: Vec<String>,
    pub max_body_bytes: Option<u64>,
    #[serde(default)]
    pub required_json_fields: Vec<String>,
    #[serde(default)]
    pub forbidden_json_fields: Vec<String>,
}

fn default_base_url_var() -> String {
    "API_BASE_URL".to_owned()
}

#[derive(Debug)]
pub struct LoadedProfile {
    pub name: String,
    pub profile: Profile,
    pub values: BTreeMap<String, String>,
    pub env_path: PathBuf,
}

#[derive(Debug)]
pub struct RequestInput<'a> {
    pub method: &'a str,
    pub request_url: &'a str,
    pub body: Option<&'a [u8]>,
    pub acknowledgement: Option<&'a str>,
}

#[derive(Debug, Clone, Serialize)]
pub struct Decision {
    pub decision: DecisionKind,
    pub profile: String,
    pub fingerprint: String,
    pub method: String,
    pub host: Option<String>,
    pub path: String,
    pub credential_class: String,
    pub reasons: Vec<Reason>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub receipt: Option<String>,
    #[serde(skip)]
    pub resolved_url: Option<String>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum DecisionKind {
    Allowed,
    Blocked,
}

#[derive(Debug, Clone, Serialize)]
pub struct Reason {
    pub code: String,
    pub message: String,
}

#[derive(Serialize)]
struct Receipt<'a> {
    schema: u8,
    time: String,
    decision: DecisionKind,
    profile: &'a str,
    fingerprint: &'a str,
    method: &'a str,
    host: Option<&'a str>,
    path: &'a str,
    credential_class: &'a str,
    reason_codes: Vec<&'a str>,
}

pub fn load_config(path: &Path) -> Result<Config, AppError> {
    let text = fs::read_to_string(path)
        .map_err(|e| AppError(format!("could not read config {}: {e}", path.display())))?;
    let config: Config = toml::from_str(&text)
        .map_err(|e| AppError(format!("invalid config {}: {e}", path.display())))?;
    if config.version != 1 {
        return Err(AppError(format!(
            "unsupported config version {}; expected 1",
            config.version
        )));
    }
    if config.profiles.is_empty() {
        return Err(AppError("config contains no profiles".into()));
    }
    for (name, profile) in &config.profiles {
        validate_profile(name, profile)?;
    }
    Ok(config)
}

fn validate_profile(name: &str, profile: &Profile) -> Result<(), AppError> {
    if name.trim().is_empty() {
        return Err(AppError("profile names cannot be empty".into()));
    }
    validate_env_key(&profile.base_url_var)?;
    for key in &profile.required {
        validate_env_key(key)?;
    }
    for host in &profile.allowed_hosts {
        if host.is_empty() || host.contains('/') || host.contains(':') {
            return Err(AppError(format!(
                "profile {name}: allowed host {host:?} must be a hostname without scheme, path, or port"
            )));
        }
    }
    for rule in profile.allow.iter().chain(profile.deny.iter()) {
        parse_rule(rule).map_err(|e| AppError(format!("profile {name}: {e}")))?;
    }
    if profile.production && profile.allow.is_empty() {
        return Err(AppError(format!(
            "profile {name}: production profiles require at least one explicit allow rule"
        )));
    }
    if profile
        .acknowledgement
        .as_deref()
        .is_some_and(|value| value.is_empty())
    {
        return Err(AppError(format!(
            "profile {name}: acknowledgement cannot be empty"
        )));
    }
    Ok(())
}

pub fn load_profile(
    config: &Config,
    config_path: &Path,
    name: &str,
) -> Result<LoadedProfile, AppError> {
    let profile = config
        .profiles
        .get(name)
        .ok_or_else(|| AppError(format!("unknown profile {name:?}")))?;
    let root = config_path.parent().unwrap_or_else(|| Path::new("."));
    let env_path = root.join(&profile.env_file);
    let text = fs::read_to_string(&env_path).map_err(|e| {
        AppError(format!(
            "could not read profile {}: {e}",
            env_path.display()
        ))
    })?;
    let values = parse_dotenv(&text)
        .map_err(|e| AppError(format!("invalid profile {}: {e}", env_path.display())))?;
    Ok(LoadedProfile {
        name: name.to_owned(),
        profile: profile.clone(),
        values,
        env_path,
    })
}

pub fn parse_dotenv(input: &str) -> Result<BTreeMap<String, String>, AppError> {
    let mut values = BTreeMap::new();
    for (index, raw) in input.lines().enumerate() {
        let line_number = index + 1;
        let line = raw.trim();
        if line.is_empty() || line.starts_with('#') {
            continue;
        }
        let line = line.strip_prefix("export ").unwrap_or(line).trim_start();
        let (key, raw_value) = line.split_once('=').ok_or_else(|| {
            AppError(format!(
                "line {line_number}: expected a literal KEY=value assignment"
            ))
        })?;
        let key = key.trim();
        validate_env_key(key)
            .map_err(|_| AppError(format!("line {line_number}: invalid variable name {key:?}")))?;
        if values.contains_key(key) {
            return Err(AppError(format!(
                "line {line_number}: duplicate variable {key}"
            )));
        }
        let value = parse_env_value(raw_value.trim(), line_number)?;
        values.insert(key.to_owned(), value);
    }
    Ok(values)
}

fn validate_env_key(key: &str) -> Result<(), AppError> {
    let mut chars = key.chars();
    match chars.next() {
        Some('A'..='Z' | 'a'..='z' | '_') => {}
        _ => {
            return Err(AppError(format!(
                "invalid environment variable name {key:?}"
            )))
        }
    }
    if chars.any(|c| !matches!(c, 'A'..='Z' | 'a'..='z' | '0'..='9' | '_')) {
        return Err(AppError(format!(
            "invalid environment variable name {key:?}"
        )));
    }
    Ok(())
}

fn parse_env_value(raw: &str, line: usize) -> Result<String, AppError> {
    let reject_shell = |value: &str| {
        value.contains('$') || value.contains('`') || value.contains("<(") || value.contains(">(")
    };
    if reject_shell(raw) {
        return Err(AppError(format!(
            "line {line}: shell expansion and command substitution are not allowed"
        )));
    }
    if let Some(inner) = raw.strip_prefix('\'') {
        let end = inner
            .strip_suffix('\'')
            .ok_or_else(|| AppError(format!("line {line}: unterminated single-quoted value")))?;
        if end.contains('\'') {
            return Err(AppError(format!(
                "line {line}: single-quoted values cannot contain a single quote"
            )));
        }
        return Ok(end.to_owned());
    }
    if let Some(inner) = raw.strip_prefix('"') {
        let end = inner
            .strip_suffix('"')
            .ok_or_else(|| AppError(format!("line {line}: unterminated double-quoted value")))?;
        let mut output = String::new();
        let mut escaped = false;
        for character in end.chars() {
            if escaped {
                match character {
                    'n' => output.push('\n'),
                    'r' => output.push('\r'),
                    't' => output.push('\t'),
                    '\\' => output.push('\\'),
                    '"' => output.push('"'),
                    other => {
                        return Err(AppError(format!(
                            "line {line}: unsupported escape \\{other}"
                        )))
                    }
                }
                escaped = false;
            } else if character == '\\' {
                escaped = true;
            } else {
                output.push(character);
            }
        }
        if escaped {
            return Err(AppError(format!("line {line}: trailing escape")));
        }
        return Ok(output);
    }
    let value = match raw.find(" #") {
        Some(index) => raw[..index].trim_end(),
        None => raw,
    };
    if value.chars().any(char::is_whitespace) {
        return Err(AppError(format!(
            "line {line}: quote values containing whitespace"
        )));
    }
    Ok(value.to_owned())
}

pub fn evaluate(loaded: &LoadedProfile, input: &RequestInput<'_>) -> Result<Decision, AppError> {
    let method = input.method.trim().to_ascii_uppercase();
    if method.is_empty()
        || method
            .chars()
            .any(|c| !c.is_ascii_uppercase() && !c.is_ascii_digit() && c != '-')
    {
        return Err(AppError(format!("invalid HTTP method {:?}", input.method)));
    }

    let profile = &loaded.profile;
    let mut reasons = Vec::new();
    let mut required = BTreeSet::from([profile.base_url_var.as_str()]);
    required.extend(profile.required.iter().map(String::as_str));
    for key in required {
        if loaded.values.get(key).is_none_or(|value| value.is_empty()) {
            reasons.push(reason(
                &format!("missing_required:{key}"),
                &format!("Required profile variable {key} is missing or empty."),
            ));
        }
    }

    let mut resolved_url = None;
    let mut host = None;
    let mut path = request_path_without_query(input.request_url);
    if let Some(base) = loaded.values.get(&profile.base_url_var) {
        if !base.is_empty() {
            let url = resolve_url(base, input.request_url)?;
            path = url.path().to_owned();
            let resolved_host = url.host_str().map(str::to_ascii_lowercase);
            if let Some(value) = &resolved_host {
                if !profile
                    .allowed_hosts
                    .iter()
                    .any(|allowed| allowed.eq_ignore_ascii_case(value))
                {
                    reasons.push(reason(
                        "host_not_allowed",
                        &format!("Host {value} is not in this profile's allowed_hosts."),
                    ));
                }
            } else {
                reasons.push(reason("host_missing", "The resolved URL has no hostname."));
            }
            host = resolved_host;
            resolved_url = Some(url.to_string());
        }
    }

    if profile
        .deny
        .iter()
        .any(|rule| rule_matches(rule, &method, &path))
    {
        reasons.push(reason(
            "operation_denied",
            "The operation matches an explicit deny rule.",
        ));
    } else if !profile.allow.is_empty()
        && !profile
            .allow
            .iter()
            .any(|rule| rule_matches(rule, &method, &path))
    {
        reasons.push(reason(
            "operation_not_allowed",
            "The operation does not match an allow rule.",
        ));
    }

    if profile.production {
        let expected = profile.acknowledgement.as_deref().unwrap_or(&loaded.name);
        if input.acknowledgement != Some(expected) {
            reasons.push(reason(
                "production_ack_required",
                &format!("Production requires --ack-production {expected}."),
            ));
        }
    }

    evaluate_body(profile, input.body, &mut reasons);

    let fingerprint = fingerprint(loaded, host.as_deref());
    Ok(Decision {
        decision: if reasons.is_empty() {
            DecisionKind::Allowed
        } else {
            DecisionKind::Blocked
        },
        profile: loaded.name.clone(),
        fingerprint,
        method,
        host,
        path,
        credential_class: profile.credential_class.clone(),
        reasons,
        receipt: None,
        resolved_url,
    })
}

fn resolve_url(base: &str, request: &str) -> Result<Url, AppError> {
    let base = Url::parse(base).map_err(|e| AppError(format!("invalid base URL: {e}")))?;
    if !matches!(base.scheme(), "http" | "https") {
        return Err(AppError("base URL scheme must be http or https".into()));
    }
    let resolved = match Url::parse(request) {
        Ok(url) => url,
        Err(url::ParseError::RelativeUrlWithoutBase) => base
            .join(request)
            .map_err(|e| AppError(format!("invalid request URL: {e}")))?,
        Err(error) => return Err(AppError(format!("invalid request URL: {error}"))),
    };
    if !matches!(resolved.scheme(), "http" | "https") {
        return Err(AppError("request URL scheme must be http or https".into()));
    }
    Ok(resolved)
}

fn request_path_without_query(request: &str) -> String {
    let no_fragment = request.split('#').next().unwrap_or(request);
    let no_query = no_fragment.split('?').next().unwrap_or(no_fragment);
    if no_query.is_empty() {
        "/".to_owned()
    } else {
        no_query.to_owned()
    }
}

fn evaluate_body(profile: &Profile, body: Option<&[u8]>, reasons: &mut Vec<Reason>) {
    if let (Some(limit), Some(content)) = (profile.max_body_bytes, body) {
        if content.len() as u64 > limit {
            reasons.push(reason(
                "body_too_large",
                &format!(
                    "Body is {} bytes; this profile allows at most {limit}.",
                    content.len()
                ),
            ));
        }
    }
    if body.is_none() && !profile.required_json_fields.is_empty() {
        reasons.push(reason(
            "body_required",
            "This policy requires a JSON body file for field checks.",
        ));
        return;
    }
    if (profile.required_json_fields.is_empty() && profile.forbidden_json_fields.is_empty())
        || body.is_none()
    {
        return;
    }
    let parsed: serde_json::Value = match serde_json::from_slice(body.unwrap_or_default()) {
        Ok(value) => value,
        Err(_) => {
            reasons.push(reason(
                "body_invalid_json",
                "The body must be valid JSON for this profile's field policy.",
            ));
            return;
        }
    };
    for field in &profile.required_json_fields {
        if json_path(&parsed, field).is_none() {
            reasons.push(reason(
                &format!("required_json_field_missing:{field}"),
                &format!("Required JSON field {field} is missing."),
            ));
        }
    }
    for field in &profile.forbidden_json_fields {
        if json_path(&parsed, field).is_some() {
            reasons.push(reason(
                &format!("forbidden_json_field_present:{field}"),
                &format!("Forbidden JSON field {field} is present."),
            ));
        }
    }
}

fn json_path<'a>(value: &'a serde_json::Value, path: &str) -> Option<&'a serde_json::Value> {
    if path.is_empty() {
        return None;
    }
    path.split('.')
        .try_fold(value, |current, part| current.get(part))
}

fn fingerprint(loaded: &LoadedProfile, host: Option<&str>) -> String {
    let mut hasher = Sha256::new();
    hasher.update(b"apg-profile-v1\0");
    hasher.update(loaded.name.as_bytes());
    hasher.update(b"\0");
    hasher.update(loaded.env_path.to_string_lossy().as_bytes());
    hasher.update(b"\0");
    hasher.update(loaded.profile.credential_class.as_bytes());
    hasher.update(b"\0");
    hasher.update(host.unwrap_or("-").as_bytes());
    for key in loaded.values.keys() {
        hasher.update(b"\0");
        hasher.update(key.as_bytes());
    }
    let digest = hasher.finalize();
    digest[..6]
        .iter()
        .map(|byte| format!("{byte:02X}"))
        .collect()
}

fn reason(code: &str, message: &str) -> Reason {
    Reason {
        code: code.to_owned(),
        message: message.to_owned(),
    }
}

fn parse_rule(rule: &str) -> Result<(&str, &str), AppError> {
    let mut parts = rule.split_whitespace();
    let method = parts.next().unwrap_or_default();
    let path = parts.next().unwrap_or_default();
    if method.is_empty() || path.is_empty() || parts.next().is_some() {
        return Err(AppError(format!(
            "invalid rule {rule:?}; expected METHOD /path/*"
        )));
    }
    if method != "*"
        && method
            .chars()
            .any(|c| !c.is_ascii_uppercase() && !c.is_ascii_digit() && c != '-')
    {
        return Err(AppError(format!(
            "invalid rule {rule:?}; method must be uppercase or *"
        )));
    }
    if !path.starts_with('/') && path != "*" {
        return Err(AppError(format!(
            "invalid rule {rule:?}; path must begin with / or be *"
        )));
    }
    Ok((method, path))
}

fn rule_matches(rule: &str, method: &str, path: &str) -> bool {
    parse_rule(rule)
        .map(|(rule_method, rule_path)| {
            (rule_method == "*" || rule_method == method) && glob_match(rule_path, path)
        })
        .unwrap_or(false)
}

pub fn glob_match(pattern: &str, value: &str) -> bool {
    let (mut p, mut v, mut star, mut checkpoint) = (0, 0, None, 0);
    let pattern = pattern.as_bytes();
    let value = value.as_bytes();
    while v < value.len() {
        if p < pattern.len() && pattern[p] == value[v] {
            p += 1;
            v += 1;
        } else if p < pattern.len() && pattern[p] == b'*' {
            star = Some(p);
            p += 1;
            checkpoint = v;
        } else if let Some(star_index) = star {
            p = star_index + 1;
            checkpoint += 1;
            v = checkpoint;
        } else {
            return false;
        }
    }
    while p < pattern.len() && pattern[p] == b'*' {
        p += 1;
    }
    p == pattern.len()
}

pub fn write_receipt(
    config: &Config,
    config_path: &Path,
    decision: &mut Decision,
) -> Result<(), AppError> {
    let root = config_path.parent().unwrap_or_else(|| Path::new("."));
    let path = root.join(&config.receipt_log);
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| {
            AppError(format!(
                "could not create receipt directory {}: {e}",
                parent.display()
            ))
        })?;
    }
    let receipt = Receipt {
        schema: 1,
        time: Utc::now().to_rfc3339_opts(SecondsFormat::Secs, true),
        decision: decision.decision,
        profile: &decision.profile,
        fingerprint: &decision.fingerprint,
        method: &decision.method,
        host: decision.host.as_deref(),
        path: &decision.path,
        credential_class: &decision.credential_class,
        reason_codes: decision
            .reasons
            .iter()
            .map(|reason| reason.code.as_str())
            .collect(),
    };
    let mut line = serde_json::to_vec(&receipt)
        .map_err(|e| AppError(format!("could not encode receipt: {e}")))?;
    line.push(b'\n');
    let mut file = OpenOptions::new()
        .create(true)
        .append(true)
        .open(&path)
        .map_err(|e| {
            AppError(format!(
                "could not open receipt log {}: {e}",
                path.display()
            ))
        })?;
    file.write_all(&line).map_err(|e| {
        AppError(format!(
            "could not write receipt log {}: {e}",
            path.display()
        ))
    })?;
    decision.receipt = Some(path.display().to_string());
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    fn profile(production: bool) -> Profile {
        Profile {
            env_file: ".env.prod".into(),
            base_url_var: "API_BASE_URL".into(),
            required: vec!["API_TOKEN".into()],
            credential_class: "live".into(),
            production,
            acknowledgement: Some("production".into()),
            allowed_hosts: vec!["api.example.com".into()],
            allow: vec!["GET /v1/*".into()],
            deny: vec!["* /v1/admin/*".into()],
            max_body_bytes: Some(1024),
            required_json_fields: vec![],
            forbidden_json_fields: vec![],
        }
    }

    fn loaded(profile: &Profile, values: &[(&str, &str)]) -> LoadedProfile {
        LoadedProfile {
            name: "production".into(),
            profile: profile.clone(),
            values: values
                .iter()
                .map(|(key, value)| ((*key).into(), (*value).into()))
                .collect(),
            env_path: ".env.prod".into(),
        }
    }

    #[test]
    fn dotenv_is_literal_and_supports_quotes() {
        let parsed = parse_dotenv(
            "PLAIN=value\nSINGLE='two words'\nDOUBLE=\"line\\nnext\"\nexport PORT=443 # note\n",
        )
        .unwrap();
        assert_eq!(parsed["PLAIN"], "value");
        assert_eq!(parsed["SINGLE"], "two words");
        assert_eq!(parsed["DOUBLE"], "line\nnext");
        assert_eq!(parsed["PORT"], "443");
    }

    #[test]
    fn dotenv_rejects_every_shell_expression_shape() {
        for value in [
            "$(touch /tmp/no)",
            "${HOME}",
            "$HOME",
            "`id`",
            "<(id)",
            ">(id)",
        ] {
            let error = parse_dotenv(&format!("TOKEN={value}\n")).unwrap_err();
            assert!(error.0.contains("not allowed"), "{value}: {error}");
        }
    }

    #[test]
    fn glob_matches_operation_paths() {
        assert!(glob_match("/v1/*", "/v1/orders/42"));
        assert!(glob_match("*", "/anything"));
        assert!(!glob_match("/v1/orders", "/v1/orders/42"));
    }

    #[test]
    fn seeded_forbidden_production_hosts_all_block() {
        let profile = profile(true);
        for host in ["evil.example", "api.example.com.evil.test", "127.0.0.1"] {
            let base = format!("https://{host}");
            let loaded = loaded(
                &profile,
                &[
                    ("API_BASE_URL", base.as_str()),
                    ("API_TOKEN", "never-logged"),
                ],
            );
            let decision = evaluate(
                &loaded,
                &RequestInput {
                    method: "GET",
                    request_url: "/v1/health",
                    body: None,
                    acknowledgement: Some("production"),
                },
            )
            .unwrap();
            assert_eq!(decision.decision, DecisionKind::Blocked, "{host}");
            assert!(decision
                .reasons
                .iter()
                .any(|r| r.code == "host_not_allowed"));
        }
    }

    #[test]
    fn seeded_missing_required_variables_all_block() {
        let profile = profile(true);
        for values in [
            vec![("API_BASE_URL", "https://api.example.com")],
            vec![("API_TOKEN", "secret")],
            vec![("API_BASE_URL", ""), ("API_TOKEN", "secret")],
        ] {
            let loaded = loaded(&profile, &values);
            let decision = evaluate(
                &loaded,
                &RequestInput {
                    method: "GET",
                    request_url: "/v1/health",
                    body: None,
                    acknowledgement: Some("production"),
                },
            )
            .unwrap();
            assert_eq!(decision.decision, DecisionKind::Blocked);
            assert!(decision
                .reasons
                .iter()
                .any(|r| r.code.starts_with("missing_required:")));
        }
    }

    #[test]
    fn explicit_deny_beats_allow_and_ack_is_required() {
        let profile = profile(true);
        let loaded = loaded(
            &profile,
            &[
                ("API_BASE_URL", "https://api.example.com"),
                ("API_TOKEN", "secret"),
            ],
        );
        let decision = evaluate(
            &loaded,
            &RequestInput {
                method: "GET",
                request_url: "/v1/admin/users",
                body: None,
                acknowledgement: None,
            },
        )
        .unwrap();
        assert_eq!(decision.decision, DecisionKind::Blocked);
        assert!(decision
            .reasons
            .iter()
            .any(|r| r.code == "operation_denied"));
        assert!(decision
            .reasons
            .iter()
            .any(|r| r.code == "production_ack_required"));
    }

    #[test]
    fn body_policy_checks_fields_without_returning_values() {
        let mut profile = profile(false);
        profile.required_json_fields = vec!["customer.id".into()];
        profile.forbidden_json_fields = vec!["debug".into()];
        let loaded = loaded(
            &profile,
            &[
                ("API_BASE_URL", "https://api.example.com"),
                ("API_TOKEN", "secret"),
            ],
        );
        let decision = evaluate(
            &loaded,
            &RequestInput {
                method: "GET",
                request_url: "/v1/orders",
                body: Some(br#"{"customer":{},"debug":"secret-body"}"#),
                acknowledgement: None,
            },
        )
        .unwrap();
        let output = serde_json::to_string(&decision).unwrap();
        assert!(output.contains("required_json_field_missing:customer.id"));
        assert!(output.contains("forbidden_json_field_present:debug"));
        assert!(!output.contains("secret-body"));
    }
}
