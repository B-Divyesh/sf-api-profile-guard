# API Profile Guard

Block API requests to the wrong environment.

API Profile Guard (`apg`) is for developers who switch between development,
staging, and production. It checks local policy before starting an API client.

## Try the isolated sample

Run the bundled CLI sample with no setup:

```sh
apg demo
```

The command creates a new OS temporary directory. It checks one blocked request
and one allowed request. It prints every sample file and receipt location. It does
not change the caller directory.

Open the [browser sample](https://api-profile-guard.sociobot.in/?demo=1) to inspect
the sample policy. Its banner identifies sample mode. Reset restores the wrong-host
request. Start for real removes demo session state.

See [`.factory/demo.md`](.factory/demo.md) for the sample data and isolation model.

## Install from source

Install the single Rust binary from the public repository:

```sh
cargo install --git https://github.com/B-Divyesh/sf-api-profile-guard.git --locked api-profile-guard
apg --help
```

Or build from a reviewed checkout:

```sh
git clone https://github.com/B-Divyesh/sf-api-profile-guard.git
cd sf-api-profile-guard
cargo install --path .
apg --help
```

## Configure an environment policy

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

APG reads environment files as text. It rejects shell expansion and command
substitution.

## Run a checked API request

Check a request without starting a client:

```sh
apg check \
  --profile production \
  --method POST \
  --url /v1/orders \
  --body-file request.json \
  --ack-production production
```

Use `--json` to print one decision object:

```sh
apg --json check --profile development --method GET --url /v1/health
```

Run a client only after the policy passes:

```sh
apg run \
  --profile production \
  --method POST \
  --url /v1/orders \
  --body-file request.json \
  --ack-production production \
  -- curl --fail-with-body -X POST --data-binary @request.json '{url}'
```

APG replaces an exact `{url}` argument with the checked URL. It passes environment
values to the client without printing them.

For an allowed run, the client response stays on standard output. APG writes its
decision to standard error.

## API request policy rules

- Every checked URL must use HTTP or HTTPS.
- The URL host must exactly match `allowed_hosts`.
- A matching `deny` rule wins over an `allow` rule.
- Production requires an allowed operation and the exact production confirmation phrase.
- A missing required environment value blocks the client.
- JSON field rules use paths such as `customer.id`.
- Receipts exclude environment values, headers, query strings, and request bodies.

Exit `0` means the check passed. Exit `10` means policy blocked the request before
the client started. Exit `2` means the input or local configuration is invalid.
An allowed `run` returns the client exit code.

## Verified product claims

Every material product promise maps to one clean-sandbox test in
[`.factory/claims.json`](.factory/claims.json). The suite covers the CLI demo,
policy blocking, receipt redaction, browser isolation, privacy, and offline reload.

Run any listed command directly. For example:

```sh
npm run test:claim -- --grep '@claim:cli-demo-sandbox'
npm run test:claim -- --grep '@claim:offline-demo-reload'
```

## Develop and verify

Requirements are Rust 1.85 or newer and Node.js 20 or newer.

```sh
npm ci
npm test
npm run lint
npm run build
npm run test:e2e
cargo build --release
cargo package
```

`npm run build` creates the static site in `dist/site/`. The browser sample reloads
offline after its first visit. It works without an account.

## Deploy the static guide

Deploy `dist/site/` to a static host. The factory deploys the public site at
<https://api-profile-guard.sociobot.in>.

## Safety limit

APG is a safety checkpoint, not an authorization system. A client can ignore the
metadata supplied to APG. Review client commands and keep production allowlists narrow.

Read the public [privacy policy](https://api-profile-guard.sociobot.in/privacy/)
and [terms](https://api-profile-guard.sociobot.in/terms/).

## License

API Profile Guard is free software under the [MIT License](LICENSE).
