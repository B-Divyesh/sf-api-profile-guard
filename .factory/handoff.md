# API Profile Guard — perfection-loop round 1 handoff

## Outcome

Repaired every blocking and minor finding in `.factory/review-1.md` while keeping
the Rust CLI and static-site deployment model. The approved pressroom visual system
remains intact. Implementation commits: `04264bcae377e43c2700acf52f73df1efccf9064`
and demo-exit cleanup `a4f8d5a04bfb47d4a1dd00fce86f3bda83406c73`.

## What changed

- Replaced the first-screen metaphor with “Block API requests to the wrong
  environment,” named developers switching dev, staging, and production, and made
  the first action promise an immediate blocked sample.
- Added `apg demo`. It creates a unique OS temporary workspace, writes bundled
  sample policy/environment/body files there, shows a blocked wrong-host request
  and an allowed request, prints all paths, and leaves the caller directory alone.
- Added `/?demo=1` and `/demo/`. Demo mode starts with the blocked production
  sample, displays the persistent required banner, and provides Reset demo and
  Start for real controls. Only `demo:api-profile-guard:sample-v1` session storage
  is used; leaving removes it without reading or changing other storage.
- Added `.factory/claims.json` with 15 material claims and exactly one tagged test
  per claim. Added `.factory/demo.md` and bundled fixtures under `examples/demo/`.
- Reworked headings and labels into plain instructions. Added the full sentence
  audit and terminology table in `.factory/copy-audit.md`; no sentence exceeds 22
  words and no banned marketing word remains.
- Added real demo output, complete route titles/canonicals/Open Graph/Twitter
  metadata, a 1200×630 social image, a 180×180 Apple icon, shared headers/footers,
  build ID, route focus transfer, a styled 404, and `/demo` routing.
- Repaired the 390 px layout, 44 px targets, sticky demo controls, accessible form
  labels/live results, designed focus states, reduced-motion behavior, and offline
  module loading. The service-worker cache is now `apg-field-guide-v4`.
- Updated README, CHANGELOG, design provenance, sitemap, deployment policy, and the
  71-character verb-first catalog description.

## Clean-clone evidence

Verification used fresh clone `/tmp/apg-polish-clean.OWac5D/repo`, detached at
`a4f8d5a04bfb47d4a1dd00fce86f3bda83406c73`, after `npm ci` installed 20 packages
with 0 vulnerabilities.

- Every one of the 15 `.factory/claims.json` commands: PASS independently. Each
  selected one tagged desktop test; the duplicate mobile project was intentionally
  skipped by the claim test.
- `npm test`: PASS — 7 Rust unit tests, 5 CLI integration tests, and 9 Node site
  tests; 21 total.
- `npm run lint`: PASS — `cargo fmt --check` and Clippy on all targets with warnings
  denied.
- `npm run build`: PASS — generated `dist/site/`, including `demo/index.html`, all
  legal/error routes, deployment config, and offline shell.
- `npm run test:e2e`: PASS — 25 browser cases passed and 17 intentional duplicate
  project cases skipped across desktop Chromium and 390×844 mobile Chromium.
  Coverage includes all five authored routes, axe, keyboard operation, focus
  transfer, 44 px targets, no horizontal overflow, console errors, privacy,
  isolated reset/exit behavior, and offline reload.
- `cargo build --release`: PASS — produced the single release binary.
- `cargo package`: PASS — 18 files, 82.2 KiB unpacked and 23.8 KiB compressed;
  Cargo also compiled the packaged crate.

## Local browser and performance evidence

- Factory `verify-url.sh` against the production preview: PASS — HTTP 200,
  `lang=en`, one H1, main landmark, zero missing alt attributes, zero unlabeled
  buttons, and zero console/page errors; measured load was 536 ms.
- Lighthouse 12.8.2 mobile: performance 100, accessibility 100, best practices
  100, SEO 100; FCP 1.0 s, LCP 1.6 s, TBT 0 ms, CLS 0, total transfer 61 KiB.
- Production payload: initial app JavaScript 6,444 bytes, all JavaScript 7,964
  bytes, CSS 13,141 bytes, mobile hero 49,178 bytes, large hero 148,256 bytes,
  and no font downloads.
- Full-page 390×844 home and demo images plus the 1440×900 first screen were
  inspected. No clipping, overlap, horizontal overflow, or lost action was found.

## Run it

```sh
npm ci
npm test
npm run lint
npm run build
npm run test:e2e
cargo run -- demo
```

Run all claims exactly as the verifier does:

```sh
while IFS=$'\t' read -r id command; do
  printf 'CLAIM %s\n' "$id"
  bash -lc "$command"
done < <(jq -r '.[] | [.id, .test] | @tsv' .factory/claims.json)
```

Static deployment uses the work-order command `npm ci && npm run build:site` and
uploads `dist/site/`.

## Deployment evidence

- Deployed `dist/site/` through `/opt/fleet/lib/deploy-static.sh` using work-order
  slug `api-profile-guard`. Final Azure deployment ID:
  `57640a2a-622e-41c3-8477-c1d2d1478f53`.
- Live URL: `https://api-profile-guard.sociobot.in`.
- Live factory verification: PASS — HTTPS 200, 704 ms measured load, correct title,
  `lang=en`, one H1, main landmark, no missing alt text, no unlabeled buttons, and
  zero console/page errors.
- Live browser suite: PASS at desktop and 390×844 — all tested requests stayed
  same-origin, cookies and non-demo local storage stayed empty, 44 px footer targets
  passed, and the `apg-field-guide-v4` shell reloaded offline.
- Live routing: `/`, `/demo`, `/demo/`, `/?demo=1`, `/privacy/`, and `/terms/`
  returned 200. `/does-not-exist` returned the authored 404 with status 404.
- Live policy: CSP, Permissions-Policy, Referrer-Policy, and `nosniff` are present;
  hashed assets return one-year immutable caching and `sw.js` returns `no-cache`.
- The live HTML references final app asset `home-hMZqc3ne.js`.

## Known gaps and next steps

No blocking or known product defect remains. Registry publication and release
binary publishing remain factory-owned; this repair did not publish either.
