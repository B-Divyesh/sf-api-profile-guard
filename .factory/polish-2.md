# Perfection-loop round 2 — finding closure

Polished candidate `d647ea7c98fcb1de56826a6fc02e1633c9821e55` against
review commit `6b14d32f8754a6331cf2770ba3e46baa17169c6a`. This replay
includes every finding in `.factory/review-1.md`, `.factory/polish-1.md`, and
`.factory/review-2.md`. Implementation commit:
`e9972f104343bf9fc0fb407564eecb5d43308eba`.

## Round 2 findings

### F-2-1 / reopened R1-B2 — the claimed CLI recording was not real output

- **Change:** `npm run demo:record` now runs the current debug binary and writes
  its output to `site/demo-transcript.txt`. It shortens only the generated
  temporary workspace path. The site renders that file rather than invented
  markup. The recording includes both requests, distinct fingerprints, credential
  class, host, method, reason, and receipt paths.
- **Evidence:** Claim `@claim:cli-demo-sandbox` runs `apg demo` in a fresh caller
  directory, verifies the sandbox, normalizes only paths and fingerprints, and
  compares every published line with the new run. Test
  `first-screen sample action opens the recorded CLI demo in one click` checks the
  material lines and both results in the first mobile viewport. Screenshot:
  `.factory/polish-2-evidence/live-demo-mobile.png`.
- **Live check:** Cold desktop and 390 px checks at
  <https://api-profile-guard.sociobot.in/?demo=1#cli-demo> matched the published
  transcript exactly and found two different fingerprints. Both `BLOCKED` and
  `ALLOWED` were visible. Reset, exit, focus, and real-storage canaries passed.

### F-2-2 / reopened R1-M1 — one confirmation term was inconsistent

- **Change:** The workflow now says “production confirmation phrase.” CLI help,
  browser errors, landing copy, README, and the terminology table use that exact
  term. `.factory/copy-audit.md` includes the corrected sentence.
- **Evidence:** Node test `production confirmation phrase is the only public term`
  rejects both shortened alternatives. Unit test `production requires the exact
  confirmation phrase` checks the browser policy message. Screenshot:
  `.factory/polish-2-evidence/live-home-mobile.png`.
- **Live check:** Cold home and demo text contained the canonical term. No sentence
  exceeded 22 words and no banned word or alternate confirmation term remained.

### F-2-3 — the Node.js minimum was false and unlisted

- **Change:** The unverified README compatibility promise was removed.
  `package.json` and the lockfile now declare the pinned Vite requirement as
  `>=20.19.0 <21 || >=22.12.0`. The public docs no longer promise an untested
  lower-bound runtime.
- **Evidence:** Node test `Node engine matches the pinned Vite runtime requirement`
  checks the machine-readable range. The clean clone ran on Node 22.23.2.
  Screenshot: `.factory/polish-2-evidence/live-home-mobile.png`.
- **Live check:** The deployed page makes no Node compatibility claim. The source
  and install links returned HTTP 200.

## Earlier finding replay

### R1-B1 — the first screen did not state the user, job, and first action

- **Change:** The prior job-first headline, developer sentence, sample action,
  expected result, and three facts are preserved.
- **Evidence:** Test `first-screen sample action opens the recorded CLI demo in one
  click`; claim `@claim:no-account-demo`; screenshot
  `.factory/polish-2-evidence/live-home-mobile.png`.
- **Live check:** All required first-screen copy and the sample action were visible
  without scrolling at 390×844 and 1440×900.

### R1-B2 — no isolated CLI or browser sample path existed

- **Change:** The earlier isolated `apg demo`, `/?demo=1`, `/demo/`, demo-prefixed
  session storage, persistent banner, reset, and exit remain. F-2-1 additionally
  makes the terminal proof authentic.
- **Evidence:** Claims `@claim:cli-demo-sandbox`,
  `@claim:browser-demo-isolation`, `@claim:browser-policy-sample`,
  `@claim:browser-input-local`, and `@claim:offline-demo-reload`; screenshot
  `.factory/polish-2-evidence/live-demo-mobile.png`.
- **Live check:** `/demo`, `/demo/`, and `/?demo=1` returned 200. Reset restored the
  blocked wrong host. Start for real removed only `demo:` state and focused the H1.

### R1-B3 — material promises had no claims manifest or tests

- **Change:** The 17-entry `.factory/claims.json` remains complete. The demo claim
  now also covers transcript honesty. Each ID has exactly one tagged source test.
- **Evidence:** Node test `every claim has one tagged test and one runnable
  command`; all 17 commands passed separately from the clean remote clone. Logs:
  `/work/.evidence/api-profile-guard-polish-2-clean/claim-<id>.log`. Screenshot:
  `.factory/polish-2-evidence/live-demo-desktop.png`.
- **Live check:** The live verifier repeated browser privacy, isolation, policy,
  no-account, offline, and demo-output outcomes after deployment.

### R1-M1 — copy was dense, overlong, and inconsistent

- **Change:** The round-one plain wording remains, and F-2-2 closes the last term
  mismatch. The copy audit now covers the transcript label and current runtime
  messages.
- **Evidence:** `.factory/copy-audit.md` has no flags; terminology and browser
  result tests passed. Screenshot:
  `.factory/polish-2-evidence/live-home-desktop.png`.
- **Live check:** The deployed first screen, workflow, simulator, and install copy
  matched the audited source at both viewports.

### R1-M2 — route metadata and shared site structure were incomplete

- **Change:** Home, demo, privacy, terms, and the designed 404 retain route titles,
  descriptions, canonicals, sharing metadata, icons, one H1, common navigation,
  complete footer, route focus, and legal links. The final live verifier now checks
  these requirements on every deployment.
- **Evidence:** Tests `every route has complete metadata, common navigation, and no
  serious accessibility findings`, `internal page navigation moves focus to the
  new heading`, and `Azure deployment config enforces caching, hardening, MIME,
  and a true 404`; screenshot `.factory/polish-2-evidence/live-404-mobile.png`.
- **Live check:** Authored routes returned 200 and `/does-not-exist` returned 404.
  Every route had zero serious or critical axe findings. Internal fragments and
  both GitHub links resolved.

### R1-M3 — headings and actions were slogans

- **Change:** The concrete round-one headings and verb-led actions remain:
  confirmation, receipt, block, install, copy, and sample actions name their result.
- **Evidence:** Full browser route/accessibility suite and
  `@claim:source-checkout-install`; screenshot
  `.factory/polish-2-evidence/live-home-mobile.png`.
- **Live check:** Heading outline and labelled controls passed on every live route
  at desktop and mobile sizes.

## Verification and deployment

- Clean remote clone:
  `/tmp/api-profile-guard-polish2-clean.2jhNAD/repo` at implementation revision
  `e9972f104343bf9fc0fb407564eecb5d43308eba`.
- Claim commands: 17/17 passed separately.
- `npm test`: 7 Rust unit, 5 CLI integration, and 11 site tests passed.
- `npm run lint`: passed.
- `npm run build`: passed; `dist/site/` created. Initial home JavaScript is 3.32
  KiB gzip and CSS is 3.89 KiB gzip.
- `npm run test:e2e`: 30 passed; 20 intentional cross-project skips.
- `cargo build --release` and `cargo package --allow-dirty`: passed.
- Deployment ID: `45b15c6e-1ada-44b3-a13e-262a0f641d30`.
- Factory URL verifier: HTTP 200 in 616 ms; correct title, language, H1, main,
  image alternatives, labelled buttons, and zero console errors.
- Cold live replay: desktop and 390 px routes, transcript, focus, isolation,
  reset, exit, axe, touch targets, reduced motion, privacy, and offline reload
  passed. Log: `/work/.evidence/api-profile-guard-polish-2-live/live-review-final.log`.
- Live Lighthouse: performance 100, accessibility 100, best practices 100, SEO
  100; FCP 0.9 s, LCP 1.1 s, TBT 40 ms, CLS 0, transfer 61 KiB.

All nine cumulative findings are closed. No severity is deferred.
