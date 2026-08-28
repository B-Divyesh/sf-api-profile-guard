# Perfection-loop round 1 — finding closure

Polished candidate `606a048b6f0665282d91da532d947186d8296fa6` against
`.factory/review-1.md` from review commit
`007c983aa231e6f4ef4ea7f4ca10dd28270d3439`. No earlier
`.factory/review-*.md` or `.factory/polish-*.md` exists in the candidate.
Implementation commit: `163b82bc8ad5f3b83fb7c46ecb0f18fae0cc91b5`.

## Finding map

### R1-B1 — first screen did not state the user, job, and first action

- **Change:** The H1 is “Block API requests to the wrong environment.” The lead
  names developers switching dev, staging, and production. The primary action is
  “Try it with sample data,” followed by the result it opens. The three facts are
  “Runs on your machine,” “No account,” and “Free, MIT licensed.”
- **Evidence:** Playwright test `first-screen sample action opens the recorded CLI
  demo in one click`; claim `@claim:no-account-demo`; screenshot
  `.factory/polish-1-evidence/live-home-mobile.jpg`.
- **Live check:** Cold 390×844 Chromium at
  <https://api-profile-guard.sociobot.in/> asserted the exact H1, lead, action,
  three facts, one H1, and no horizontal overflow.

### R1-B2 — no CLI demo or isolated browser sample path

- **Change:** `apg demo` creates a unique OS temporary workspace, runs one blocked
  wrong-host request and one allowed request, prints every fixture and receipt
  path, and leaves the caller directory unchanged. `/?demo=1` and `/demo/` seed
  the browser sample in `demo:api-profile-guard:sample-v1`, show the persistent
  banner, restore checked demo state on reload, reset to the wrong host, and clear
  demo state through every exit path. The first action lands immediately on the
  self-hosted recording of the real CLI demo. Reset moves to the seeded browser
  result. Start for real clears demo state and focuses the home H1.
- **Evidence:** Claims `@claim:cli-demo-sandbox`,
  `@claim:browser-demo-isolation`, `@claim:browser-policy-sample`,
  `@claim:browser-input-local`, and `@claim:offline-demo-reload`; integration test
  `demo_uses_only_a_new_temporary_workspace`; Playwright first-screen test;
  screenshots `.factory/polish-1-evidence/live-demo-mobile.jpg` and
  `.factory/polish-1-evidence/live-demo-desktop.jpg`.
- **Live check:** Cold navigation to `/?demo=1#cli-demo` placed the recorded result
  in the viewport. The terminal contained both `BLOCKED` and `ALLOWED`. Session
  storage contained only the demo-prefixed key. Reset, exit, focus transfer, and
  offline reload passed. `/demo`, `/demo/`, and `/?demo=1` returned HTTP 200.

### R1-B3 — material promises lacked a claims manifest and claim tests

- **Change:** `.factory/claims.json` now lists 17 product claims. Every entry has
  exactly one `@claim:<id>` test and a clean-sandbox description. Coverage includes
  blocked child/network behavior, missing values, receipt redaction, literal
  environment parsing, production and JSON policy order, child streams and exit
  codes, source installation, both demos, offline use, privacy, no-account use,
  and the MIT license.
- **Evidence:** Node test `every claim has one tagged test and one runnable
  command`; all 17 manifest commands passed separately in the clean remote clone.
  Logs: `/work/.evidence/polish-1-clean/claim-<id>.log`. Screenshots:
  `.factory/polish-1-evidence/live-demo-mobile.jpg` and
  `.factory/polish-1-evidence/live-home-mobile.jpg`.
- **Live check:** The browser claims were repeated cold against the deployed demo.
  Every runtime request was same-origin, cookies were empty, entered sample data
  produced no request, and the `apg-field-guide-v5` shell reloaded offline.

### R1-M1 — dense, overlong, and inconsistent copy

- **Change:** Landing and README copy now introduces “environment file,” uses
  “production confirmation phrase” consistently, explains standard output and
  standard error in separate sentences, and keeps every audited sentence at 22
  words or fewer. `.factory/copy-audit.md` contains all landing and README prose,
  word counts, banned-word results, and the terminology table.
- **Evidence:** `.factory/copy-audit.md` has no flags. The full browser suite checks
  the rewritten first screen, form labels, results, headings, and actions.
  Screenshot: `.factory/polish-1-evidence/live-home-mobile.jpg`.
- **Live check:** Cold visible text matched the audited source. The catalog line is
  the 63-character verb-first sentence “Block wrong-environment API requests
  before your client starts.”

### R1-M2 — metadata and site skeleton incomplete off the landing page

- **Change:** Home, demo, privacy, terms, and 404 now have route-specific titles,
  descriptions, canonicals, Open Graph and Twitter metadata, favicon and 180px
  Apple icon. Every route has the shared header, primary navigation, footer,
  legal links, Param Factory credit, and build ID. Focus moves to the new heading
  after forward, back, and demo-exit navigation. Azure routing serves `/demo` as a
  real route and unknown paths as the styled 404 with HTTP 404.
- **Evidence:** Playwright tests `every route has complete metadata, common
  navigation, and no serious accessibility findings` and `internal page
  navigation moves focus to the new heading`; Node tests `all authored routes
  carry complete sharing metadata and common chrome` and `Azure deployment config
  enforces caching, hardening, MIME, and a true 404`; screenshot
  `.factory/polish-1-evidence/live-404-mobile.jpg`.
- **Live check:** `/`, `/demo`, `/demo/`, `/privacy/`, and `/terms/` returned 200.
  `/does-not-exist` returned 404 with title “Page not found — API Profile Guard,”
  shared navigation, footer, and recovery actions. Live CSP, Permissions-Policy,
  Referrer-Policy, `nosniff`, immutable assets, and no-cache worker headers passed.

### R1-M3 — slogan headings and vague actions

- **Change:** Headings now say “Require a confirmation for production requests,”
  “Save receipts without request values,” and “Install the production request
  guard.” Actions now say “Copy install command” and “Install from source.” The
  README headings are “Run a checked API request” and “API request policy rules.”
- **Evidence:** Clean-clone route and accessibility tests passed at desktop and
  390×844. Claim `@claim:source-checkout-install` installed one `apg` executable
  and asserted `apg 0.1.0`. Screenshot:
  `.factory/polish-1-evidence/live-home-mobile.jpg`.
- **Live check:** The complete mobile page showed every rewritten heading and
  action without clipping. Axe reported no serious or critical issue on every
  authored route at both tested viewports.

## Additional acceptance hardening

The final audit also added back/forward focus recovery, preserved demo state only
inside its namespace, cleared it for external as well as internal exits, asserted
the source install, tested the browser block/allow result as a claim, tested
required nested JSON paths, verified the demo target is in the first viewport, and
checked the constrained mobile page at 200% text size.

## Verification and deployment

- Clean remote clone: `/tmp/apg-polish-1-clean.Z2qFJ8/repo` at
  `163b82bc8ad5f3b83fb7c46ecb0f18fae0cc91b5`.
- Separate claim commands: 17/17 passed.
- `npm test`: 21/21 passed.
- `npm run lint`: passed.
- `npm run build`: passed; `dist/site/` created.
- `npm run test:e2e`: 30 passed, 20 intentional project-scope skips.
- `cargo build --release` and `cargo package`: passed.
- Deployment ID: `17902802-1b10-4142-9fd4-a0d142a992a7`.
- Factory live verifier: HTTP 200, 918 ms, correct title/lang/H1/main/alt/buttons,
  zero console or page errors.
- Live Lighthouse: performance 100, accessibility 100, best practices 100, SEO
  100; FCP 0.9 s, LCP 1.1 s, TBT 40 ms, CLS 0, transfer 61 KiB.
- Cold live finding output:
  `/work/.evidence/api-profile-guard-polish-1-live/cold-findings.json`.

All six findings are closed. No severity is deferred.
