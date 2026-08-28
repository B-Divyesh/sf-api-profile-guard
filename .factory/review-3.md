# Adversarial first-read review 3 — API Profile Guard

**Reviewed:** 2026-08-28 UTC  
**Target:** <https://api-profile-guard.sociobot.in>  
**Revision:** `da21ebef297f19bba28ae8bafb5893996b37a35e`  
**Verdict: PASS** — zero blocking findings, zero minor findings, and zero
untested claims.

## First 30 seconds

Fresh Chromium contexts opened the deployed home page at 390×844 and 1440×900.
No scrolling occurred before this assessment.

- **What it does:** It blocks an API request when its destination does not match
  the selected environment policy.
- **For whom:** Developers switching requests among development, staging, and
  production.
- **What to click first:** **“Try it with sample data”** to see a blocked
  production request.

The first screen answers all three questions. The exact supporting text is
**“Block API requests to the wrong environment”**, **“For developers switching
dev, staging, and production before they run a request”**, and **“See a blocked
production request now.”** The action and three facts are visible before scrolling
at both viewport sizes.

## Findings

None.

## Copy audit

Counts use whitespace boundaries but do not count standalone punctuation marks.
Hyphenated terms, commands, and version strings count as one word. Code/config
blocks, form option values, and metadata are not
sentences and are excluded. Headings, actions, facts, terminal prose, empty/error
states, and transient control text are included. No sentence exceeds 22 words, no
banned marketing adjective appears, terminology is consistent, headings make sense
out of context, and every action names its result or destination.

### Landing page

| ID | Words | Flags | Sentence, heading, fact, or action |
| --- | ---: | --- | --- |
| L1 | 3 | — | Local request guard |
| L2 | 7 | — | Block API requests to the wrong environment |
| L3 | 12 | — | For developers switching dev, staging, and production before they run a request. |
| L4 | 5 | — | Try it with sample data |
| L5 | 6 | — | See a blocked production request now. |
| L6 | 4 | — | Runs on your machine |
| L7 | 2 | — | No account |
| L8 | 3 | — | Free, MIT licensed |
| L9 | 3 | — | Copy install command |
| L10 | 10 | — | The guard checks local policy before your API client starts. |
| L11 | 6 | — | Check a request in three steps |
| L12 | 1 | — | Read |
| L13 | 7 | — | Open the named environment file as text. |
| L14 | 1 | — | Check |
| L15 | 9 | — | Match the host, operation, body, and production confirmation phrase. |
| L16 | 1 | — | Run |
| L17 | 9 | — | Start the API client only when every check passes. |
| L18 | 6 | — | Check a request in your browser |
| L19 | 9 | — | Change the sample request and check its policy result. |
| L20 | 9 | — | The browser sends no input and starts no client. |
| L21 | 8 | — | Use an absolute URL to check its host. |
| L22 | 3 | — | Type “production” exactly. |
| L23 | 2 | — | Check request |
| L24 | 4 | — | No request checked yet |
| L25 | 5 | — | Choose an environment and operation. |
| L26 | 4 | — | Then check the request. |
| L27 | 6 | — | Require a confirmation for production requests |
| L28 | 15 | — | Production requests need an exact host, an allowed operation, and the configured production confirmation phrase. |
| L29 | 5 | — | Read environment files as text |
| L30 | 7 | — | APG rejects shell expansion and command substitution. |
| L31 | 5 | — | Save receipts without request values |
| L32 | 10 | — | Receipts exclude environment values, headers, query strings, and request bodies. |
| L33 | 5 | — | Block before the client starts |
| L34 | 11 | — | A blocked run does not start curl, Bruno, or your script. |
| L35 | 5 | — | Run the bundled CLI sample |
| L36 | 6 | — | `apg demo` creates a temporary workspace. |
| L37 | 9 | — | It shows one blocked request and one allowed request. |
| L38 | 4 | — | Captured from `apg demo` |
| L39 | 3 | — | Temporary paths shortened |
| L40 | 4 | — | API Profile Guard sample |
| L41 | 7 | — | Sample 1 of 2 — wrong production host |
| L42 | 8 | — | Host wrong.example is not in this profile's allowed_hosts. |
| L43 | 7 | — | Sample 2 of 2 — approved production request |
| L44 | 2 | — | Demo complete. |
| L45 | 6 | — | Your current directory was not changed. |
| L46 | 4 | — | One binary / no account |
| L47 | 5 | — | Install the production request guard |
| L48 | 9 | — | Build the MIT-licensed Rust binary from the public source. |
| L49 | 3 | — | Install from source |
| L50 | 4 | — | Block wrong-environment API requests. |
| L51 | 6 | — | Demo — sample data, nothing is saved |
| L52 | 2 | — | Reset demo |
| L53 | 2 | — | Demo reset |
| L54 | 3 | — | Start for real |
| L55 | 3 | — | Install command copied |
| L56 | 4 | — | Select the install command |
| L57 | 1 | — | Checking… |
| L58 | 2 | — | Policy passed. |
| L59 | 4 | — | The client may start. |
| L60 | 6 | — | The request could not be checked. |
| L61 | 5 | — | Blocked before the client starts. |
| L62 | 3 | — | Correct the input. |
| L63 | 5 | — | Then check the request again. |
| L64 | 5 | — | Reading the environment and policy… |
| L65 | 9 | — | The browser sample does not open a network connection. |
| L66 | 6 | — | Enter the configured production confirmation phrase. |
| L67 | 8 | — | Offline — this guide and its sample still work. |

Navigation destinations and form labels are short nouns, not sentences. The
actions are **Try it with sample data**, **Copy install command**, **Check
request**, **Reset demo**, **Start for real**, and **Install from source**. Each is
a verb-led action with a stated or adjacent result. Technical terms occur only in
developer-facing policy, terminal, or installation context.

### README

| ID | Words | Flags | Sentence or standalone heading |
| --- | ---: | --- | --- |
| R1 | 7 | — | Block API requests to the wrong environment. |
| R2 | 14 | — | API Profile Guard (`apg`) is for developers who switch between development, staging, and production. |
| R3 | 9 | — | It checks local policy before starting an API client. |
| R4 | 4 | — | Try the isolated sample |
| R5 | 8 | — | Run the bundled CLI sample with no setup. |
| R6 | 8 | — | The command creates a new OS temporary directory. |
| R7 | 9 | — | It checks one blocked request and one allowed request. |
| R8 | 8 | — | It prints every sample file and receipt location. |
| R9 | 7 | — | It does not change the caller directory. |
| R10 | 9 | — | Open the browser sample to inspect the sample policy. |
| R11 | 5 | — | Its banner identifies sample mode. |
| R12 | 5 | — | Reset restores the wrong-host request. |
| R13 | 7 | — | Start for real removes demo session state. |
| R14 | 9 | — | See `.factory/demo.md` for the sample data and isolation model. |
| R15 | 3 | — | Install from source |
| R16 | 9 | — | Install the single Rust binary from the public repository. |
| R17 | 6 | — | Or build from a reviewed checkout. |
| R18 | 4 | — | Configure an environment policy |
| R19 | 6 | — | Create `apg.toml` in the project root. |
| R20 | 6 | — | APG reads environment files as text. |
| R21 | 7 | — | It rejects shell expansion and command substitution. |
| R22 | 5 | — | Run a checked API request |
| R23 | 7 | — | Check a request without starting a client. |
| R24 | 7 | — | Use `--json` to print one decision object. |
| R25 | 8 | — | Run a client only after the policy passes. |
| R26 | 10 | — | APG replaces an exact `{url}` argument with the checked URL. |
| R27 | 10 | — | It passes environment values to the client without printing them. |
| R28 | 11 | — | For an allowed run, the client response stays on standard output. |
| R29 | 7 | — | APG writes its decision to standard error. |
| R30 | 4 | — | API request policy rules |
| R31 | 8 | — | Every checked URL must use HTTP or HTTPS. |
| R32 | 7 | — | The URL host must exactly match `allowed_hosts`. |
| R33 | 9 | — | A matching `deny` rule wins over an `allow` rule. |
| R34 | 11 | — | Production requires an allowed operation and the exact production confirmation phrase. |
| R35 | 8 | — | A missing required environment value blocks the client. |
| R36 | 8 | — | JSON field rules use paths such as `customer.id`. |
| R37 | 10 | — | Receipts exclude environment values, headers, query strings, and request bodies. |
| R38 | 6 | — | Exit `0` means the check passed. |
| R39 | 11 | — | Exit `10` means policy blocked the request before the client started. |
| R40 | 10 | — | Exit `2` means the input or local configuration is invalid. |
| R41 | 8 | — | An allowed `run` returns the client exit code. |
| R42 | 3 | — | Verified product claims |
| R43 | 11 | — | Every material product promise maps to one clean-sandbox test in `.factory/claims.json`. |
| R44 | 16 | — | The suite covers the CLI demo, policy blocking, receipt redaction, browser isolation, privacy, and offline reload. |
| R45 | 5 | — | Run any listed command directly. |
| R46 | 2 | — | For example. |
| R47 | 3 | — | Develop and verify |
| R48 | 9 | — | `npm run build` creates the static site in `dist/site/`. |
| R49 | 9 | — | The browser sample reloads offline after its first visit. |
| R50 | 5 | — | It works without an account. |
| R51 | 4 | — | Deploy the static guide |
| R52 | 6 | — | Deploy `dist/site/` to a static host. |
| R53 | 8 | — | The factory deploys the public site at <https://api-profile-guard.sociobot.in>. |
| R54 | 2 | — | Safety limit |
| R55 | 9 | — | APG is a safety checkpoint, not an authorization system. |
| R56 | 9 | — | A client can ignore the metadata supplied to APG. |
| R57 | 8 | — | Review client commands and keep production allowlists narrow. |
| R58 | 7 | — | Read the public privacy policy and terms. |
| R59 | 1 | — | License |
| R60 | 10 | — | API Profile Guard is free software under the MIT License. |

The README consistently uses **environment file**, **production confirmation
phrase**, **client**, **browser sample/demo**, **receipt**, and **policy check**.
Words such as JSON, standard output, standard error, and allowlist appear only in
developer instructions where they name actual interfaces.

## Demo and sandbox verification

- One click on the first-screen action opened `/?demo=1#cli-demo`. The focused
  first demo viewport already showed the real CLI transcript, the wrong production
  host, `BLOCKED`, the approved host, and `ALLOWED` at both viewport sizes.
- The persistent banner said **“Demo — sample data, nothing is saved”** and exposed
  **Reset demo** and **Start for real**.
- The browser sample opened already blocked for production `POST
  https://wrong.example/v1/orders`. Changing only the URL to `/v1/orders` allowed
  it. Reset restored the wrong host and blocked result.
- Local- and session-storage canaries outside the `demo:` namespace survived entry,
  edits, reset, and exit. The only demo key was
  `demo:api-profile-guard:sample-v1`; leaving removed it.
- Interception after network idle recorded no request while the sample was edited
  and checked. The complete load used only the product origin and set no cookies.
- After service-worker control, an offline reload preserved the blocked sample and
  displayed the offline status.
- `apg demo` ran from a fresh temporary caller during the claim test. It created a
  separate OS temporary workspace, wrote two receipts there, matched every line of
  the published transcript after run-specific normalization, and left the caller
  directory unchanged.

## Claims verification

A fresh clone at `/tmp/api-profile-guard-review3-clean.Pzm1g9/repo` checked out the
reviewed revision. Every `test` value in `.factory/claims.json` was invoked
separately; each test created or used the sandbox stated in its manifest entry.

| Claim ID | Result |
| --- | --- |
| `cli-demo-sandbox` | PASS |
| `blocked-host-no-client` | PASS |
| `check-no-network` | PASS |
| `missing-variable-no-client` | PASS |
| `receipt-redaction` | PASS |
| `literal-environment-files` | PASS |
| `production-policy` | PASS |
| `policy-rule-order` | PASS |
| `clean-child-output` | PASS |
| `source-checkout-install` | PASS |
| `browser-demo-isolation` | PASS |
| `browser-policy-sample` | PASS |
| `browser-input-local` | PASS |
| `offline-demo-reload` | PASS |
| `no-account-demo` | PASS |
| `website-privacy` | PASS |
| `mit-license` | PASS |

Result: **17/17 listed claim commands passed.** The live landing, route metadata,
browser states, README, privacy page, and terms were then cross-checked against the
manifest. No material product claim is unlisted. Build/deploy instructions were
also exercised directly: the build produced `dist/site/`, and the deployed URL and
linked source repository returned 200.

## Earlier finding replay

Every earlier `.factory/review-*.md`, `.factory/polish-*.md`, and the handoff was
read before replaying the full checklist.

| Earlier ID | Live and code verification |
| --- | --- |
| R1-B1 — unclear first screen | **Fixed.** Job, audience, sample action, expected result, and three facts are visible without scrolling at 390×844 and 1440×900. |
| R1-B2 — missing isolated CLI/browser demo | **Fixed.** One-click transcript, `apg demo`, banner, reset, exit, offline path, and separate demo storage all passed. |
| R1-B3 — no claims manifest/tests | **Fixed.** The manifest has 17 uniquely tagged tests; all 17 commands passed separately in the clean clone. |
| R1-M1 — dense and inconsistent copy | **Fixed.** The complete audit above has no overlong/banned copy and uses “production confirmation phrase” consistently. |
| R1-M2 — incomplete route metadata/skeleton | **Fixed.** Every authored route and the designed 404 have complete metadata and shared chrome; live routing passed. |
| R1-M3 — slogan headings/vague actions | **Fixed.** Headings identify their sections and actions name the result or destination. |
| F-2-1 / R1-B2 — false CLI recording | **Fixed.** Live transcript equals `site/demo-transcript.txt`, contains the material output, and uses two distinct fingerprints; the claim compares it with a fresh binary run. |
| F-2-2 / R1-M1 — inconsistent confirmation term | **Fixed.** Live copy, source, README, CLI help, error text, and regression test use only “production confirmation phrase.” |
| F-2-3 — false Node minimum | **Fixed.** The public compatibility promise is absent; `package.json` declares Vite's actual supported engine range. |

No earlier finding is unfixed, half-fixed, or regressed.

## Structure, accessibility, and quality gates

- `/`, `/demo`, `/demo/`, `/?demo=1`, `/privacy/`, and `/terms/` return 200. The
  designed `/does-not-exist` returns 404 with recovery actions.
- Every route has a route-appropriate title of at most 60 characters, one H1, one
  main landmark, description, canonical, Open Graph/Twitter metadata, product art,
  SVG favicon, and Apple-touch icon. The sitemap lists every authored route.
- The common header, four-link primary navigation, skip link, footer, Privacy,
  Terms, Param Factory credit, and build ID remain present on every route.
- All internal and external destinations returned 200, except the intentional 404
  probe. Same-document skip and fragment targets exist. Back and forward navigation
  restored the expected URL and focused heading.
- Live axe checks found zero serious or critical violations on home, demo, privacy,
  terms, and 404 at both viewport sizes. Keyboard focus is visible, reduced motion
  disables smooth movement, mobile has no horizontal overflow, and footer targets
  are at least 44×44 CSS pixels.
- No page or console errors appeared. CSP, HSTS, `nosniff`, Permissions-Policy, and
  strict referrer headers are deployed.
- The warm paper, two-ink halftone inspection gate, square press specimens,
  registration details, and dense editorial rhythm match `.factory/design.md`.
  The result is recognizably product-specific and not a generic SaaS template.
- In the clean clone, `npm test`, `npm run lint`, `npm run build`, and
  `npm run test:e2e` passed. E2E reported 30 passed and 20 intentional
  project-scope skips. Initial home JavaScript is 3.32 KiB gzip.

## Missed leverage

No obvious product capability is missing from the brief. Import, export, or sync
would not improve a local request gate. An AI step would make a deterministic
pre-request safety decision less predictable, so no AI feature is justified and no
provider key is embedded.

## What would make this perfect

No corrective product, copy, demo, claim, route, accessibility, privacy, or visual
work remains from this review. The evaluated product already meets the stated
standard; adding a feature solely to create a next step would weaken the scope.
