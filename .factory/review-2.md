# Adversarial first-read review 2 — API Profile Guard

**Reviewed:** 2026-08-28 UTC

**Target:** <https://api-profile-guard.sociobot.in>

**Revision:** `d647ea7c98fcb1de56826a6fc02e1633c9821e55`
**Verdict: FAIL** — 2 blocking findings and 1 minor finding.

## First 30 seconds

Fresh Chromium contexts opened the deployed home page at 390×844 and 1440×900.
No scrolling occurred before this assessment.

- **What it does:** It checks local policy and blocks an API request aimed at the
  wrong development, staging, or production environment.
- **For whom:** Developers who switch requests among those environments.
- **What to click first:** **“Try it with sample data”** to see a blocked
  production request.

The first screen passes this test. The exact copy that makes the answers possible
is **“Block API requests to the wrong environment”**, **“For developers switching
dev, staging, and production before they run a request”**, and **“Try it with
sample data — See a blocked production request now.”** All of it is visible before
scrolling at both viewports.

## Findings

### BLOCKING — F-2-1 / reopened R1-B2 — the claimed CLI recording is not output from the real demo

- **Quote/location:** Landing page, one-click demo terminal: **“Recorded from apg
  demo”**. Both displayed decisions use fingerprint `8C31F2A091E4`.
- **Verification:** The terminal is hard-coded in `site/index.html`. Running the
  current binary's `apg demo` from a fresh temporary caller produced two distinct
  12-digit fingerprints (`B84757166304` for the wrong host and `70C015FABEBC` for
  the approved host in this run), plus method, host, credential class, reason, and
  receipt lines absent from the page. The values necessarily differ because
  `src/lib.rs` includes the resolved host in the fingerprint. One identical value
  for both decisions cannot be a recording of this binary's output.
- **Why a first-time visitor is misled:** The primary action promises a real sample
  and labels the transcript as recorded output. The product instead shows an
  edited simulation with a false safety identifier. This weakens the only
  one-click CLI proof and half-reopens the earlier missing-demo finding.
- **Concrete fix:** Generate the self-hosted terminal asset by running the current
  `apg demo`, or label it plainly as an illustrative excerpt and remove invented
  values. Show the distinct fingerprints and the material decision lines. Add a
  test that normalizes temporary paths and compares the published transcript with
  actual `apg demo` output.

### BLOCKING — F-2-2 / reopened R1-M1 — one production-confirmation term remains inconsistent

- **Quote/location:** Landing page, step 2: **“Match the host, operation, body, and
  production phrase.”** Elsewhere the same input is **“production confirmation
  phrase.”**
- **Verification:** The mismatch exists on the deployed page and in
  `site/index.html`. Round 1 required **“production confirmation phrase”**
  everywhere and `.factory/polish-1.md` says this was completed.
- **Why a first-time visitor is lost:** “Production phrase” can sound like a
  separate policy value. The shorter term also breaks the repository's own
  terminology table at the point where the workflow is summarized.
- **Concrete fix:** Replace it with **“Match the host, operation, body, and
  production confirmation phrase.”** Add the exact sentence to the copy audit or
  a terminology consistency assertion. This is blocking under this round's rule
  that any half-fixed earlier finding reopens as blocking.

### MINOR — F-2-3 — the documented Node.js minimum is false and absent from the claims manifest

- **Quote/location:** README, Develop and verify: **“Requirements are Rust 1.85 or
  newer and Node.js 20 or newer.”**
- **Verification:** `.factory/claims.json` has no compatibility entry. The pinned
  Vite 7.3.6 declares Node `^20.19.0 || >=22.12.0`; therefore Node 20.0–20.18 does
  not meet the build tool's declared requirement. The clean-clone suite ran on
  Node 22.23.2, so it does not exercise the stated Node 20 floor.
- **Why a first-time visitor is misled:** A developer on an early Node 20 release
  is told the documented build is supported when its pinned toolchain says it is
  not.
- **Concrete fix:** State the exact supported ranges, for example **“Use Rust 1.85
  or newer. Use Node.js 20.19–20.x or 22.12 or newer.”** Add `engines.node` to
  `package.json` and either list a tagged compatibility claim tested at the lower
  bounds or remove the unverified compatibility promise.

## Copy audit

Counts are whitespace-delimited. Hyphenated terms, commands, and version strings
count as one word. Code blocks, TOML, select options, and isolated navigation
labels are not sentences. Headings, actions, facts, and exercised runtime messages
are included because visitors must understand them. `—` means no flag. No copy
uses a banned marketing adjective and no sentence exceeds 22 words.

### Landing page

| ID | Words | Flag | Sentence, heading, or action |
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
| L12 | 7 | — | Open the named environment file as text. |
| L13 | 8 | F-2-2: inconsistent term | Match the host, operation, body, and production phrase. |
| L14 | 9 | — | Start the API client only when every check passes. |
| L15 | 6 | — | Check a request in your browser |
| L16 | 9 | — | Change the sample request and check its policy result. |
| L17 | 9 | — | The browser sends no input and starts no client. |
| L18 | 8 | — | Use an absolute URL to check its host. |
| L19 | 3 | — | Type “production” exactly. |
| L20 | 4 | — | No request checked yet |
| L21 | 5 | — | Choose an environment and operation. |
| L22 | 4 | — | Then check the request. |
| L23 | 6 | — | Require a confirmation for production requests |
| L24 | 15 | — | Production requests need an exact host, an allowed operation, and the configured production confirmation phrase. |
| L25 | 5 | — | Read environment files as text |
| L26 | 7 | — | APG rejects shell expansion and command substitution. |
| L27 | 5 | — | Save receipts without request values |
| L28 | 10 | — | Receipts exclude environment values, headers, query strings, and request bodies. |
| L29 | 5 | — | Block before the client starts |
| L30 | 11 | — | A blocked run does not start curl, Bruno, or your script. |
| L31 | 5 | — | Run the bundled CLI sample |
| L32 | 6 | — | `apg demo` creates a temporary workspace. |
| L33 | 9 | — | It shows one blocked request and one allowed request. |
| L34 | 5 | — | Install the production request guard |
| L35 | 9 | — | Build the MIT-licensed Rust binary from the public source. |
| L36 | 3 | — | Install from source |
| L37 | 4 | — | Block wrong-environment API requests. |
| L38 | 6 | — | Demo — sample data, nothing is saved |
| L39 | 2 | — | Reset demo |
| L40 | 3 | — | Start for real |
| L41 | 5 | — | Blocked before the client starts. |
| L42 | 7 | — | Host wrong.example is not allowed for production. |
| L43 | 2 | — | Policy passed. |
| L44 | 4 | — | The client may start. |
| L45 | 9 | — | The browser sample does not open a network connection. |
| L46 | 5 | — | Reading the environment and policy… |
| L47 | 3 | — | Correct the input. |
| L48 | 5 | — | Then check the request again. |
| L49 | 8 | — | Offline — this guide and its sample still work. |

The actions name results or the state they change. Technical words such as
“standard output,” “JSON,” and “allowlist” occur only in developer instructions or
policy context. The only terminology conflict is L13.

### README

| ID | Words | Flag | Sentence or standalone heading |
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
| R48 | 11 | F-2-3: false, unlisted claim | Requirements are Rust 1.85 or newer and Node.js 20 or newer. |
| R49 | 9 | — | `npm run build` creates the static site in `dist/site/`. |
| R50 | 9 | — | The browser sample reloads offline after its first visit. |
| R51 | 5 | — | It works without an account. |
| R52 | 4 | — | Deploy the static guide |
| R53 | 6 | — | Deploy `dist/site/` to a static host. |
| R54 | 8 | — | The factory deploys the public site at <https://api-profile-guard.sociobot.in>. |
| R55 | 2 | — | Safety limit |
| R56 | 9 | — | APG is a safety checkpoint, not an authorization system. |
| R57 | 9 | — | A client can ignore the metadata supplied to APG. |
| R58 | 8 | — | Review client commands and keep production allowlists narrow. |
| R59 | 7 | — | Read the public privacy policy and terms. |
| R60 | 1 | — | License |
| R61 | 10 | — | API Profile Guard is free software under the MIT License. |

### Terminology check

| Concept | Required term | Observed deviation |
| --- | --- | --- |
| Named dotenv input | environment file | None |
| User confirmation for production | production confirmation phrase | “production phrase” at L13 |
| Program started after a passing check | client | None |
| Browser try-out | browser sample or demo | None |
| Saved value-free decision | receipt | None |
| Host, operation, and body decision | policy check | None |

## Demo and sandbox verification

- One click from the hero opened `/?demo=1#cli-demo`, kept the demo banner visible,
  focused **“Run the bundled CLI sample,”** and put `BLOCKED` and `ALLOWED` in the
  390 px viewport.
- The seeded interactive sample was already blocked with production `POST
  https://wrong.example/v1/orders`. Changing only the URL to `/v1/orders` produced
  `ALLOWED` with no browser request.
- **Reset demo** restored the wrong host, blocked result, and sample heading focus.
  **Start for real** removed all `demo:` keys, returned home, and focused the H1.
- Local- and session-storage canaries outside the `demo:` namespace remained
  unchanged. The only demo key was
  `demo:api-profile-guard:sample-v1`; cookies remained empty.
- Every runtime request was same-origin. After service-worker control, disabling
  the network and reloading kept the blocked sample and displayed the offline
  status.
- The real `apg demo` ran from a fresh temporary caller. It created its workspace
  under `/tmp`, wrote two receipts there, showed one blocked and one allowed
  request, and left the caller's only file unchanged.

Isolation passes. The transcript-honesty defect remains blocking under F-2-1.

## Claims verification

A fresh remote clone was checked out at the reviewed SHA in
`/tmp/api-profile-guard-review2-clone.u4xhB5/repo`. Every command in
`.factory/claims.json` was run separately from that clone.

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

Result: **17/17 listed claim commands passed.** The exact public Git install command
was also run independently in a fresh Cargo root and installed one `apg 0.1.0`
binary. F-2-3 is the only claim-like landing/README sentence with no adequate
manifest entry; it also contradicts the pinned build tool's engine range.

## Earlier finding replay

| Earlier ID | Live and code result |
| --- | --- |
| R1-B1 — unclear first screen | **Fixed.** Job, audience, sample action, result, and three facts are visible cold at both viewports. |
| R1-B2 — missing isolated CLI/browser demo | **Reopened by F-2-1.** Isolation and controls work, but the alleged real CLI recording contains output the binary cannot produce. |
| R1-B3 — no claims manifest/tests | **Fixed.** Manifest exists and all 17 commands pass separately in a clean clone. |
| R1-M1 — dense/inconsistent copy | **Reopened by F-2-2.** Caps and banned-word checks pass, but the required production-confirmation term is still inconsistent. |
| R1-M2 — incomplete route metadata/skeleton | **Fixed.** Home, demo, privacy, terms, and 404 have complete metadata and shared chrome; routing checks pass. |
| R1-M3 — slogan headings/vague actions | **Fixed.** Rewritten headings stand alone and actions name their result. |

The current handoff's statement that no known defect remains is therefore not
confirmed.

## Structure, accessibility, and link checks

- `/`, `/demo`, `/demo/`, `/?demo=1`, `/privacy/`, and `/terms/` returned 200.
  An unknown route returned the designed page with HTTP 404.
- Every route has the required title pattern, one H1, one main landmark, route
  description, canonical, Open Graph/Twitter metadata, social image, SVG favicon,
  and Apple-touch icon. `robots.txt`, `sitemap.xml`, and the social image return
  200; the sitemap lists all authored routes.
- Forward navigation, back navigation, direct demo links, and leaving demo moved
  focus to the destination heading. Leaving demo for Privacy removed demo state.
- The complete internal and external link crawl found no dead linked destination.
  The only 404 was the intentional unknown-route probe.
- Live axe scans found zero violations on home, demo, privacy, terms, and 404 at
  both viewports. The factory URL verifier found the title, `lang=en`, one H1,
  main, complete image alt text, labelled buttons, and no page/console errors on
  the normal route.
- The mobile pages had no horizontal overflow. The live verifier measured every
  footer action at least 44×44 CSS pixels. The clean browser suite also passed its
  keyboard, 200% text, focus, reduced-motion, and offline checks.
- The warm-paper pressroom, two-ink halftone gate, square specimen panels, and
  registration-print details match `.factory/design.md` and are recognizably
  product-specific rather than a generic SaaS template.
- Response headers include CSP, Permissions-Policy, strict referrer policy,
  `nosniff`, and HSTS.

## Missed leverage

No additional AI feature is justified. This job requires deterministic local
policy evaluation before a client starts; model output would weaken that boundary.
The brief does not imply remote sync, and adding it would conflict with the local
privacy model. Policy files and request bodies already use ordinary files, so no
separate proprietary import/export format is missing.

## Additional quality evidence

From the same clean clone:

- `npm test`: PASS — 7 Rust unit tests, 5 CLI integration tests, and 9 site tests.
- `npm run lint`: PASS.
- `npm run build`: PASS — `dist/site/` produced; initial home JavaScript is 7.24
  KB uncompressed and below the product budget.
- `npm run test:e2e`: PASS — 30 passed, 20 intentional cross-project skips.
- Exact documented public Git install: PASS — one `apg 0.1.0` executable.

## What would make this perfect

There are exactly three remaining actions: publish a transcript generated from the
real CLI output, use **“production confirmation phrase”** in the remaining step,
and correct plus test the Node compatibility range. Re-run this complete cold,
demo, claims, history, routing, accessibility, and copy audit after those changes.
The product reaches PASS only when all three findings are absent and no new finding
appears.
