# Adversarial first-read review 1 — API Profile Guard

**Reviewed:** 2026-08-28 UTC  
**Target:** <https://api-profile-guard.sociobot.in>  
**Revision:** `e5d186bf349a6baa5bb22882e76f9c3253a4ff97`  
**Verdict: FAIL** — 3 blocking findings and 3 minor findings.

## First 30 seconds

Fresh Chromium contexts were opened at 390×844 and 1440×900. No scroll was made
before this assessment.

- **What it does:** I can infer that it checks an API request before it runs.
- **For whom:** I cannot determine this from the first screen. It never names the
  developer who switches development, staging, and production environments.
- **What to click first:** “Try the preflight” is the likely action, but it does
  not say that it opens a realistic sample or what result will appear.

This fails the required first-read test. The headline, **“Know where the request is
going.”**, is a metaphor rather than the job. The supporting copy, **“Resolve the
profile. Inspect the policy. Release the request—only when host, operation, body,
and credential class agree.”**, uses unexplained implementation terms and does not
name the user or their situation.

## Findings

### BLOCKING — the first screen does not state the user, job, and first useful action

- **Quote:** “Know where the request is going.” and “Try the preflight”.
- **Check:** At 390 px, the first screen names neither API developers switching
  environments nor the consequence it prevents. “Preflight”, “profile”, and
  “credential class” require prior context. The primary action does not promise
  sample data or name the result.
- **Why this loses a first-time visitor:** A visitor has to decode the product
  vocabulary before knowing whether it applies to a staging/production mistake.
  They also cannot know whether clicking will install software, run a real request,
  or merely show documentation.
- **Concrete fix:** Replace the hero with: **“Block API requests to the wrong
  environment”**; **“For developers switching dev, staging, and production before
  they run a request.”**; and **“Try it with sample data — see a blocked production
  request now.”** Keep three short facts beside it: “Runs on your machine”, “No
  account”, and “Free, MIT licensed”.

### BLOCKING — no required CLI demo or isolated sample path exists

- **Quote:** “Try the preflight”; `apg --demo`; `apg demo`.
- **Check:** The landing action is only `#simulator`; it exposes empty/default
  fields and a `READY` result, not a labelled sample run. `/demo` returns HTTP 404.
  `/?demo=1` returns the ordinary landing page with no demo mode. There is no
  “Demo — sample data, nothing is saved” banner, Reset demo, Start for real, or
  `.factory/demo.md`. In a fresh temp directory, the shipped binary returned exit
  2 for both `apg --demo` (unexpected argument) and `apg demo` (unrecognized
  subcommand).
- **Why this loses or misleads a first-time visitor:** The product is a CLI, but a
  visitor cannot run its main job safely without reading and creating configuration.
  The browser simulator is not identified as sample data and cannot demonstrate the
  actual binary. There is no verifiable boundary between a trial and real data.
- **Concrete fix:** Ship `apg demo` (or `apg --demo`) with a bundled, realistic
  production-policy fixture. It must run in a temp directory, print the fixture and
  receipt locations, show both a blocked wrong-host request and an allowed request,
  and leave the caller’s directory untouched. Add a first-screen “Try it with sample
  data” action to a self-hosted terminal recording of that command. Provide `/demo`
  or `?demo=1` for the browser simulator with the persistent required banner, Reset
  demo, Start for real, and a separate `demo:` storage namespace. Document all of
  this in `.factory/demo.md`; add a clean-temp-dir test tagged `@claim:demo`.

### BLOCKING — there is no claims manifest, so all material promises are unlisted and unverified

- **Quote:** `.factory/claims.json` is absent in both the checkout and a fresh
  remote clone. Examples of unlisted copy: “It makes no request and stores
  nothing.”, “No early connection”, “No child process started. No network
  connection opened.”, and “There is no telemetry, account, hosted secret store, or
  runtime network dependency beyond the request made by the command you explicitly
  run.”
- **Check:** There were no listed claim tests to run because the required file does
  not exist. `npm test` passed in the fresh clone, but its tests are not mapped to
  claims with `@claim:<id>` and do not use a demo entry point.
- **Why this loses or misleads a first-time visitor:** These are promises a user
  may rely on before running a production request. Passing general tests does not
  tell the visitor which promise was exercised or whether the page and README match
  the implementation.
- **Concrete fix:** Add `.factory/claims.json` and exactly one tagged clean-sandbox
  test per claim. At minimum cover: blocked host starts no child and opens no socket;
  missing required variable starts no child; values/headers/body are absent from a
  receipt; CLI demo writes only its temp directory; browser demo does not touch real
  storage; and offline browser demo reloads after first visit. Either add each
  landing/README promise to the manifest or remove it. The `C` markers in the audit
  below are the unlisted material claims.

### MINOR — copy is technically dense, contains two overlong README sentences, and mixes terms

- **Quote:** “It resolves a named dotenv profile without executing it, checks the
  resolved host, operation, and body policy, requires an exact production
  acknowledgement, and only then starts your HTTP client or script.” (31 words)
  and “For an allowed `run`, child stdout is preserved byte-for-byte so response
  pipelines stay valid; the guard decision is written to stderr (as JSON when
  `--json` is set).” (27 words).
- **Check:** Both exceed the 22-word cap. The landing page also uses “preflight”,
  “profile”, “credential class”, “deny-first”, “JSONL”, “CI”, “stdout”, and
  “response pipelines” without first-read explanations. The same confirmation is
  called a “Production phrase” in the form and a “typed acknowledgement” in copy.
- **Why this loses a first-time visitor:** The important safety boundary is hidden
  in CLI implementation vocabulary, and one confirmation has two names.
- **Concrete fix:** Use “environment file” before “profile”; use “production
  confirmation phrase” everywhere; define any remaining CLI term next to its first
  use. Split the first quote into: “APG reads a named environment file as text. It
  checks the host, operation, and request body. It starts your client only after a
  production confirmation.” Replace the second with: “For an allowed run, your
  client response stays on standard output. APG writes its decision to standard
  error.”

### MINOR — metadata and site skeleton are incomplete outside the landing page

- **Quote:** `/demo` returned “Page not found — API Profile Guard”; the 404 has no
  canonical, Open Graph, Twitter, Apple-touch icon, primary nav, or footer. Privacy
  and Terms have no Open Graph, Twitter, or Apple-touch metadata and replace the
  landing header with only “Back home”.
- **Check:** `/`, `/privacy/`, and `/terms/` return 200; the designed 404 returns
  404. Titles, one H1, descriptions, favicon, language, and canonical on the three
  non-404 routes were present. The landing title follows the required pattern.
  Legal-page footers omit “Built by Param Factory” and a version/build id; the 404
  omits a footer entirely.
- **Why this matters:** A shared site identity disappears on legal/error routes,
  and link previews/bookmarks lack complete route metadata. More importantly,
  `/demo` is a required product destination but is currently the 404.
- **Concrete fix:** Implement `/demo`; give every route canonical, OG/Twitter
  title/description/image, favicon plus 180px Apple-touch icon, and a complete
  common header/footer. Retain the current distinctive pressroom art direction.

### MINOR — several headings and actions are slogans rather than standalone instructions

- **Quote:** “Production is not a color.”, “A receipt you can keep. Nothing you
  need to hide.”, “Put a gate in front of production.”, “Copy”, and “Get API Profile
  Guard”.
- **Check:** These headings do not identify their content when read out of context.
  “Copy” does not name what will be copied, and “Get API Profile Guard” does not
  name the resulting action.
- **Why this matters:** Screen-reader heading lists and a hurried mobile scan lose
  the concrete task.
- **Concrete fix:** Use “Require a confirmation for production requests”, “Save a
  receipt without request values”, and “Install the production request guard”. Rename
  the buttons “Copy install command” and “Install from source”.

## Demo and sandbox evidence

- Fresh mobile browser context: `/?demo=1` was HTTP 200 but visually/functionally
  identical to `/`; `/demo` was HTTP 404.
- Clicking the visible action produced `#simulator`, not a demo banner or sample
  receipt. Inspecting the default browser fields produced an allowed development
  result (`GET api.localhost/v1/orders`), which is a UI simulation rather than a
  demonstrated CLI run.
- During ordinary landing/simulator use, intercepted requests were same-origin only
  (`https://api-profile-guard.sociobot.in`) and local/session storage remained
  empty. After service-worker control, an offline reload and default simulator check
  worked. These are useful observations, **not** claim verification because no demo
  boundary or tagged claim test exists.
- The temp-dir CLI checks above proved that no required demo command exists.

## Structure and link checks

All linked destinations from the landing page were crawled. Internal root, Privacy,
Terms, robots, sitemap, and favicon returned 200; the intentional unknown route
returned 404; GitHub source and license returned 200. No initial console errors were
observed at mobile or desktop. The page is visually distinct: the warm paper,
halftone gate, registration rules, and safety-card typography match
`.factory/design.md` and do not resemble a generic SaaS template.

## Copy audit

Counts use whitespace-delimited words (commands, TOML, tables, and isolated UI
labels such as select values are excluded because they are not sentences). `C` means
a material claim with no manifest entry; `F` identifies a plain-words flag. This is
the complete sentence-level prose audit of the landing page and README.

### Landing page

| ID | Words | Flags | Sentence or standalone heading |
| --- | ---: | --- | --- |
| L1 | 3 | F | Local safety checkpoint |
| L2 | 6 | C,F | Know where the request is going. |
| L3 | 3 |  | Resolve the profile. |
| L4 | 3 |  | Inspect the policy. |
| L5 | 12 | C,F | Release the request—only when host, operation, body, and credential class agree. |
| L6 | 10 | C | The guard opens only after the resolved profile matches policy. |
| L7 | 6 | F | Literal dotenv, required keys, credential class |
| L8 | 7 | F | Exact host, method + path, JSON body fields |
| L9 | 6 | F | Explicit production phrase, then spawn client |
| L10 | 4 | F | Run a local preflight |
| L11 | 8 | C,F | This simulator mirrors the CLI’s deny-first decision order. |
| L12 | 7 | C | It makes no request and stores nothing. |
| L13 | 9 | F | Try a forbidden host: https://wrong.example/v1/orders |
| L14 | 3 | F | Type production exactly. |
| L15 | 3 |  | No confirmation dialog. |
| L16 | 4 |  | No request inspected yet. |
| L17 | 10 | F | Choose a profile and operation, then run the policy check. |
| L18 | 5 | F | Production is not a color. |
| L19 | 5 | F | A theme can be missed. |
| L20 | 4 | F | A failing policy cannot. |
| L21 | 13 | C,F | Production requires an exact host, an explicit operation allowlist, and a typed acknowledgement. |
| L22 | 3 | F | No shell evaluation |
| L23 | 6 | C,F | Dotenv values are parsed as literals. |
| L24 | 5 | C,F | Expansion and substitution are rejected. |
| L25 | 3 |  | No secret receipts |
| L26 | 13 | C,F | Receipts record the decision and non-secret fingerprint—not headers, values, queries, or bodies. |
| L27 | 3 |  | No early connection |
| L28 | 14 | C,F | apg run does not spawn curl, Bruno, or your script until every check passes. |
| L29 | 5 | F | A receipt you can keep. |
| L30 | 5 | F | Nothing you need to hide. |
| L31 | 13 | C,F | JSON decisions and JSONL receipts fit CI without sending your request history anywhere. |
| L32 | 9 | C,F | Allowed runs keep child stdout clean for response pipelines. |
| L33 | 4 | C | No child process started. |
| L34 | 4 | C | No network connection opened. |
| L35 | 7 | F | Put a gate in front of production. |
| L36 | 13 | C | Open source, MIT licensed, and designed to wrap the clients you already use. |

### README

| ID | Words | Flags | Sentence |
| --- | ---: | --- | --- |
| R1 | 20 | C,F | API Profile Guard (`apg`) is a local, client-agnostic preflight for developers who switch API requests between development, staging, and production. |
| R2 | 31 | C,F,>22 | It resolves a named dotenv profile without executing it, checks the resolved host, operation, and body policy, requires an exact production acknowledgement, and only then starts your HTTP client or script. |
| R3 | 10 | C | No secrets, headers, or request bodies are written to receipts. |
| R4 | 22 | C,F | There is no telemetry, account, hosted secret store, or runtime network dependency beyond the request made by the command you explicitly run. |
| R5 | 11 |  | Install the single Rust binary directly from the public source repository. |
| R6 | 9 |  | Or clone it and build from a reviewed checkout. |
| R7 | 9 | C | The factory publishes registry packages and release binaries separately. |
| R8 | 22 | C,F | Version `0.1.0` is ready for `cargo install api-profile-guard` after registry publication; the Git install above works before that publication occurs. |
| R9 | 7 |  | Create `apg.toml` in the project root. |
| R10 | 7 | C,F | Dotenv files use literal `KEY=value` lines. |
| R11 | 18 | C,F | Single and double quotes are supported; shell expansion, command substitution, and multiline values are rejected rather than executed. |
| R12 | 3 |  | Preview a request. |
| R13 | 6 | C | `check` never opens a network connection. |
| R14 | 15 | C,F | Use `--json` for one stable, script-friendly decision object from `check` (and from a blocked `run`). |
| R15 | 9 | C | Run an existing client only after the check passes. |
| R16 | 22 | C,F | The exact `{url}` argument is replaced with the resolved URL, and profile variables are passed to the child process without printing them. |
| R17 | 7 | C,F | `run` is intentionally non-interactive, including in CI. |
| R18 | 10 | C | It never starts the child when the preflight is blocked. |
| R19 | 22 | C,F | If body rules apply, pass `--body-file` so the exact bytes can be inspected locally; bodies and headers are never copied into receipts. |
| R20 | 27 | C,F,>22 | For an allowed `run`, child stdout is preserved byte-for-byte so response pipelines stay valid; the guard decision is written to stderr (as JSON when `--json` is set). |
| R21 | 16 | C,F | Every request must resolve to an `http` or `https` URL whose hostname exactly matches `allowed_hosts`. |
| R22 | 6 | C,F | `deny` rules win over `allow` rules. |
| R23 | 7 | C,F | Rules are `METHOD /path/*` patterns with `*` wildcards. |
| R24 | 7 | C,F | Query strings are not matched or logged. |
| R25 | 18 | C,F | Production is default-deny: at least one `allow` rule must match and `--ack-production` must exactly match the profile acknowledgement. |
| R26 | 19 | C,F | Non-production profiles allow operations by default when `allow` is empty, while still enforcing host, required-variable, deny, and body rules. |
| R27 | 14 | C,F | `required_json_fields` and `forbidden_json_fields` use dot paths such as `customer.id`. |
| R28 | 10 | C,F | A required-field policy blocks when no body file is supplied. |
| R29 | 21 | C,F | Receipts include time, decision, reason codes, profile fingerprint, method, host, and path—never environment values, headers, query strings, or body content. |
| R30 | 8 |  | Requirements: Rust 1.85+ and Node.js 20+. |
| R31 | 12 | C | `npm test` runs the Rust unit/integration suite and site behavior tests. |
| R32 | 23 | C,F,>22 | The static landing/docs site is built with Vite and contains a browser-only policy simulator; it does not send or persist entered data. |
| R33 | 10 |  | Deploy the contents of `dist/site/` to any static host. |
| R34 | 19 | C | The factory owns deployment for https://api-profile-guard.sociobot.in; this repository contains no DNS, billing, analytics, or infrastructure mutation. |
| R35 | 9 | C,F | This is a safety checkpoint, not a security boundary. |
| R36 | 18 | C,F | A child command can ignore the metadata you supplied to `apg`; review scripts and keep production allowlists narrow. |
| R37 | 12 |  | Protect dotenv files with normal filesystem permissions and do not commit them. |
| R38 | 10 |  | See the privacy page and terms for the public site. |
| R39 | 1 |  | MIT. |
| R40 | 2 |  | See LICENSE. |

The README headings **“Usage”** and **“Policy behavior”** also fail the
out-of-context heading check. Rewrite them as **“Run a checked API request”** and
**“API request policy rules”**.

## Claim-test and quality-gate evidence

A fresh remote clone was created in `/tmp/apg-clean-clone.mLVQjs` at the stated
revision. It confirmed `.factory/claims.json` is absent. Therefore the required
per-claim commands could not be run. General quality checks did pass:

```text
npm test       PASS — 11 Rust tests and 7 Node tests
npm run build  PASS — dist/site/ produced
```

This does not change the verdict: no claim entry points at a demo sandbox or a
tagged observable claim test.
