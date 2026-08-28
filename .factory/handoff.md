# API Profile Guard — perfection-loop round 1 handoff

## Outcome

All blocking and minor findings in `.factory/review-1.md` are fixed and verified.
No earlier review or polish report exists. The artifact remains a Rust `clap`
single-binary CLI with a Vite-built static guide. The distinctive warm-paper,
halftone preflight-pressroom identity is unchanged.

Deployed implementation commit:
`163b82bc8ad5f3b83fb7c46ecb0f18fae0cc91b5`.

## Delivered repair

- Rewrote the first screen around the user, job, immediate sample result, and three
  plain facts.
- Shipped `apg demo` with a blocked and allowed production-policy sample in a
  unique temporary workspace.
- Shipped `/?demo=1` and `/demo/` with a persistent banner, reset, real-data exit,
  demo-only storage, reload restoration, all-path cleanup, and immediate focus on
  the recorded CLI result.
- Expanded `.factory/claims.json` to 17 claims with exactly one tagged clean-
  sandbox test each.
- Completed titles, metadata, canonicals, social art, common navigation/footer,
  legal links, route focus, back/forward focus, `/demo`, and a true HTTP 404.
- Repaired 390px layout, 44px targets, 200% text resize, keyboard behavior, live
  results, reduced motion, privacy, and the offline shell.
- Updated the README, copy audit, demo guide, changelog, 63-character catalog
  description, and finding map in `.factory/polish-1.md`.

## Exact clean-clone evidence

Verification used the fresh remote clone
`/tmp/apg-polish-1-clean.Z2qFJ8/repo` at the implementation SHA. `npm ci`
installed 20 packages and `npm audit --audit-level=high` found 0 vulnerabilities.

- All 17 `.factory/claims.json` commands passed separately. Each selected one
  desktop claim test; the duplicate mobile project was intentionally skipped.
  Per-claim logs are in `/work/.evidence/polish-1-clean/`.
- `npm test`: PASS — 7 Rust unit, 5 CLI integration, and 9 Node site tests; 21
  total.
- `npm run lint`: PASS — Rust formatting and all-target Clippy with warnings
  denied.
- `npm run build`: PASS — created `dist/site/`, including the demo, legal routes,
  404, deployment policy, and `apg-field-guide-v5` offline shell.
- `npm run test:e2e`: PASS — 30 browser cases and 20 intentional duplicate/
  viewport skips. Coverage includes every claim, route metadata, axe, keyboard
  operation, focus transfer and history return, 44px targets, 390px overflow,
  200% text, privacy, reset/exit isolation, and offline reload.
- `cargo build --release`: PASS — produced the single release binary.
- `cargo package`: PASS — 18 files, 82.4 KiB unpacked and 23.9 KiB compressed;
  Cargo compiled the packaged crate.

## Payload and live quality

- Production output: 7,238-byte home JavaScript, 8,865 bytes across all
  JavaScript, 13,141-byte CSS, 0 font bytes, 49,178-byte mobile hero, and
  148,256-byte large hero. Total `dist/site/` size is 454,794 bytes.
- Lighthouse 12.8.2 mobile: performance 100, accessibility 100, best practices
  100, SEO 100; FCP 0.9 s, LCP 1.1 s, TBT 40 ms, CLS 0, transfer 61 KiB.
- Factory verifier: HTTPS 200 in 918 ms; correct title, `lang=en`, one H1, main
  landmark, all image alt text, labelled buttons, and zero console/page errors.
- Live browser suite: PASS at 1440×900 and 390×844; same-origin requests only,
  empty cookies and real storage, no horizontal overflow, minimum 44px footer
  targets, route axe scans, and offline reload under `apg-field-guide-v5`.
- Cold finding replay: exact first-screen copy, one-click CLI recording in the
  viewport, `demo:`-only state, reset, exit cleanup, focus, complete metadata,
  shared legal links, and the authored 404 all passed.
- Evidence screenshots are under `.factory/polish-1-evidence/`. The complete
  finding map and live checks are in `.factory/polish-1.md`.

## Deployment

- Work-order build: `npm ci && npm run build:site`.
- Uploaded `dist/site/` through `/opt/fleet/lib/deploy-static.sh` for slug
  `api-profile-guard`.
- Azure deployment ID: `17902802-1b10-4142-9fd4-a0d142a992a7`.
- Live URL: <https://api-profile-guard.sociobot.in>.
- Live routes: `/`, `/demo`, `/demo/`, `/?demo=1`, `/privacy/`, and `/terms/`
  return 200; `/does-not-exist` returns the authored page with status 404.
- Live response policy: CSP, Permissions-Policy, Referrer-Policy, and `nosniff`
  are present. Hashed assets are one-year immutable; `sw.js` is `no-cache`.
- Deployed home asset: `home-Dk6GCiEC.js`.

## Run and verify

```sh
npm ci
npm test
npm run lint
npm run build
npm run test:e2e
cargo run -- demo
```

To repeat every claim independently, run each `test` command from
`.factory/claims.json` in a fresh clone.

## Known gaps and next steps

No known product or review defect remains. Crates.io and release-binary publishing
remain factory-owned; the public Git/source installation is tested and available
now.
