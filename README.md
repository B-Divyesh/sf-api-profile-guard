# API Profile Guard

API Profile Guard (`apg`) is a local, client-agnostic preflight for developers who
switch API requests between development, staging, and production. It resolves a
named dotenv profile without executing it, checks the resolved host, operation, and
body policy, requires an exact production acknowledgement, and only then starts
your HTTP client or script.

No secrets, headers, or request bodies are written to receipts. There is no
telemetry, account, hosted secret store, or runtime network dependency beyond the
request made by the command you explicitly run.

## Install

Build the single Rust binary from source:

```sh
git clone https://github.com/B-Divyesh/sf-api-profile-guard.git
cd sf-api-profile-guard
cargo install --path .
apg --help
```

The factory publishes release binaries separately. The package starts at version
`0.1.0` and is also ready for `cargo install api-profile-guard` once published.

## Usage

Create `apg.toml` in the project root:

```toml
version = 1
receipt_log = ".apg/receipts.jsonl"

[profiles.development]
env_file = ".env.dev"
base_url_var = "API_BASE_URL"
required = ["API_BASE_URL", "API_TOKEN"]
credential_class = "test"
allowed_hosts = ["localhost", "127.0.0.1"]

[profiles.production]
env_file = ".env.prod"
base_url_var = "API_BASE_URL"
required = ["API_BASE_URL", "API_TOKEN"]
credential_class = "live"
production = true
acknowledgement = "production"
allowed_hosts = ["api.example.com"]
allow = ["GET /v1/*", "POST /v1/orders"]
deny = ["* /v1/admin/*"]
max_body_bytes = 65536
forbidden_json_fields = ["debug", "skip_confirmation"]
```

Dotenv files use literal `KEY=value` lines. Single and double quotes are supported;
shell expansion, command substitution, and multiline values are rejected rather
than executed.

Preview a request. `check` never opens a network connection:

```sh
apg check \
  --profile production \
  --method POST \
  --url /v1/orders \
  --body-file request.json \
  --ack-production production
```

Use `--json` for stable, script-friendly output:

```sh
apg --json check --profile development --method GET --url /v1/health
```

Run an existing client only after the check passes. The exact `{url}` argument is
replaced with the resolved URL, and profile variables are passed to the child
process without printing them:

```sh
apg run \
  --profile production \
  --method POST \
  --url /v1/orders \
  --body-file request.json \
  --ack-production production \
  -- curl --fail-with-body -X POST --data-binary @request.json '{url}'
```

`run` is intentionally non-interactive, including in CI. It never starts the child
when the preflight is blocked. If body rules apply, pass `--body-file` so the exact
bytes can be inspected locally; bodies and headers are never copied into receipts.

### Policy behavior

- Every request must resolve to an `http` or `https` URL whose hostname exactly
  matches `allowed_hosts`.
- `deny` rules win over `allow` rules. Rules are `METHOD /path/*` patterns with `*`
  wildcards. Query strings are not matched or logged.
- Production is default-deny: at least one `allow` rule must match and
  `--ack-production` must exactly match the profile acknowledgement.
- Non-production profiles allow operations by default when `allow` is empty, while
  still enforcing host, required-variable, deny, and body rules.
- `required_json_fields` and `forbidden_json_fields` use dot paths such as
  `customer.id`. A required-field policy blocks when no body file is supplied.
- Receipts include time, decision, reason codes, profile fingerprint, method, host,
  and path—never environment values, headers, query strings, or body content.

### Exit codes

| Code | Meaning |
| ---: | --- |
| `0` | preflight allowed; child also exited successfully when using `run` |
| `2` | invalid CLI usage, config, dotenv, URL, or body input |
| `10` | policy blocked the request; no child process was started |
| other | the child process exit code from `run` |

## Develop and verify

Requirements: Rust 1.85+ and Node.js 20+.

```sh
npm install
npm test
npm run build       # static site -> dist/site
cargo build --release
cargo package
```

`npm test` runs the Rust unit/integration suite and site behavior tests. The static
landing/docs site is built with Vite and contains a browser-only policy simulator;
it does not send or persist entered data.

## Deploy the docs site

Deploy the contents of `dist/site/` to any static host. The factory owns deployment
for <https://api-profile-guard.sociobot.in>; this repository contains no DNS,
billing, analytics, or infrastructure mutation.

## Privacy and security scope

This is a safety checkpoint, not a security boundary. A child command can ignore
the metadata you supplied to `apg`; review scripts and keep production allowlists
narrow. Protect dotenv files with normal filesystem permissions and do not commit
them. See the [privacy page](https://api-profile-guard.sociobot.in/privacy/) and
[terms](https://api-profile-guard.sociobot.in/terms/) for the public site.

## License

MIT. See [LICENSE](LICENSE).
