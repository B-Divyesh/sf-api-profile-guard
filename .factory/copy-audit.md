# Plain-words copy audit

Audited August 28, 2026. Counts treat hyphenated terms, commands, and version
strings as one word. Code blocks, form option values, and metadata are excluded.
No sentence exceeds 22 words. No sentence uses a banned marketing word.

## Landing page

| Words | Text | Flags |
| ---: | --- | --- |
| 3 | Local request guard | None |
| 7 | Block API requests to the wrong environment | None |
| 11 | For developers switching dev, staging, and production before they run a request. | None |
| 6 | Try it with sample data | None |
| 6 | See a blocked production request now. | None |
| 4 | Runs on your machine | None |
| 2 | No account | None |
| 3 | Free, MIT licensed | None |
| 3 | Copy install command | None |
| 11 | The guard checks local policy before your API client starts. | None |
| 6 | Check a request in three steps | None |
| 7 | Open the named environment file as text. | None |
| 9 | Match the host, operation, body, and production phrase. | None |
| 9 | Start the API client only when every check passes. | None |
| 6 | Check a request in your browser | None |
| 9 | Change the sample request and check its policy result. | None |
| 9 | The browser sends no input and starts no client. | None |
| 8 | Use an absolute URL to check its host. | None |
| 3 | Type “production” exactly. | None |
| 4 | No request checked yet | None |
| 8 | Choose an environment and operation. Then check the request. | None |
| 7 | Require a confirmation for production requests | None |
| 13 | Production requests need an exact host, an allowed operation, and the configured production confirmation phrase. | None |
| 6 | Read environment files as text | None |
| 7 | APG rejects shell expansion and command substitution. | None |
| 5 | Save receipts without request values | None |
| 9 | Receipts exclude environment values, headers, query strings, and request bodies. | None |
| 6 | Block before the client starts | None |
| 11 | A blocked run does not start curl, Bruno, or your script. | None |
| 6 | Run the bundled CLI sample | None |
| 6 | `apg demo` creates a temporary workspace. | None |
| 9 | It shows one blocked request and one allowed request. | None |
| 5 | Install the production request guard | None |
| 9 | Build the MIT-licensed Rust binary from the public source. | None |
| 3 | Install from source | None |
| 6 | Block wrong-environment API requests. | None |
| 6 | Demo — sample data, nothing is saved | None |
| 2 | Reset demo | None |
| 3 | Start for real | None |

## README

| Words | Text | Flags |
| ---: | --- | --- |
| 7 | Block API requests to the wrong environment. | None |
| 14 | API Profile Guard (`apg`) is for developers who switch between development, staging, and production. | None |
| 9 | It checks local policy before starting an API client. | None |
| 4 | Try the isolated sample | None |
| 8 | Run the bundled CLI sample with no setup. | None |
| 8 | The command creates a new OS temporary directory. | None |
| 9 | It checks one blocked request and one allowed request. | None |
| 8 | It prints every sample file and receipt location. | None |
| 6 | It does not change the caller directory. | None |
| 9 | Open the browser sample to inspect the sample policy. | None |
| 5 | Its banner identifies sample mode. | None |
| 5 | Reset restores the wrong-host request. | None |
| 7 | Start for real removes demo session state. | None |
| 9 | See `.factory/demo.md` for the sample data and isolation model. | None |
| 3 | Install from source | None |
| 9 | Install the single Rust binary from the public repository. | None |
| 6 | Or build from a reviewed checkout. | None |
| 4 | Configure an environment policy | None |
| 6 | Create `apg.toml` in the project root. | None |
| 6 | APG reads environment files as text. | None |
| 7 | It rejects shell expansion and command substitution. | None |
| 5 | Run a checked API request | None |
| 7 | Check a request without starting a client. | None |
| 7 | Use `--json` to print one decision object. | None |
| 8 | Run a client only after the policy passes. | None |
| 10 | APG replaces an exact `{url}` argument with the checked URL. | None |
| 10 | It passes environment values to the client without printing them. | None |
| 11 | For an allowed run, the client response stays on standard output. | None |
| 7 | APG writes its decision to standard error. | None |
| 4 | API request policy rules | None |
| 8 | Every checked URL must use HTTP or HTTPS. | None |
| 7 | The URL host must exactly match `allowed_hosts`. | None |
| 9 | A matching `deny` rule wins over an `allow` rule. | None |
| 11 | Production requires an allowed operation and the exact production confirmation phrase. | None |
| 8 | A missing required environment value blocks the client. | None |
| 8 | JSON field rules use paths such as `customer.id`. | None |
| 10 | Receipts exclude environment values, headers, query strings, and request bodies. | None |
| 6 | Exit `0` means the check passed. | None |
| 11 | Exit `10` means policy blocked the request before the client started. | None |
| 10 | Exit `2` means the input or local configuration is invalid. | None |
| 8 | An allowed `run` returns the client exit code. | None |
| 3 | Verified product claims | None |
| 11 | Every material product promise maps to one clean-sandbox test in `.factory/claims.json`. | None |
| 16 | The suite covers the CLI demo, policy blocking, receipt redaction, browser isolation, privacy, and offline reload. | None |
| 5 | Run any listed command directly. | None |
| 2 | For example. | None |
| 3 | Develop and verify | None |
| 11 | Requirements are Rust 1.85 or newer and Node.js 20 or newer. | None |
| 9 | `npm run build` creates the static site in `dist/site/`. | None |
| 9 | The browser sample reloads offline after its first visit. | None |
| 5 | It works without an account. | None |
| 4 | Deploy the static guide | None |
| 6 | Deploy `dist/site/` to a static host. | None |
| 9 | The factory deploys the public site at the product URL. | None |
| 2 | Safety limit | None |
| 9 | APG is a safety checkpoint, not an authorization system. | None |
| 9 | A client can ignore the metadata supplied to APG. | None |
| 8 | Review client commands and keep production allowlists narrow. | None |
| 7 | Read the public privacy policy and terms. | None |
| 10 | API Profile Guard is free software under the MIT License. | None |

## Terminology

| Concept | Term used |
| --- | --- |
| Named dotenv input | environment file |
| User confirmation for production | production confirmation phrase |
| Program started after a passing check | client |
| Browser try-out | browser sample or demo |
| Saved non-secret decision line | receipt |
| Host, operation, and body decision | policy check |
