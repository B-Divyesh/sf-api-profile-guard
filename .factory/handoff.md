# API Profile Guard v0.1.0 — repair handoff

Repair work order `api-profile-guard-repair-1` is complete. The release-blocking
findings recorded in verifier commit `2976f13ef64bdb0b99a49b78a9a1d3c9d37ac2a9`
for candidate `f67fc1baf8da7d2f1d117f19407cff9fe1c026fe` were reproduced,
fixed, regression-tested, pushed, and deployed to
<https://api-profile-guard.sociobot.in> on August 28, 2026 UTC.

## Finding disposition

1. **Unavailable primary install — fixed.** The hero and README now use the
   immediately working source command:
   `cargo install --git https://github.com/B-Divyesh/sf-api-profile-guard.git --locked api-profile-guard`.
   A clean install from public GitHub resolved commit `b700102a`, compiled, and
   returned `apg 0.1.0`. Registry publishing was not attempted because credentials
   belong to the factory.
2. **Allowed `run --json` contaminated stdout — fixed.** Allowed runs reserve stdout
   byte-for-byte for the child and write the preflight decision to stderr. `check`
   and blocked `run` retain one decision object on stdout. Help and README state this
   stream contract. The regression test parses child stdout and the independent
   allowed decision as separate JSON values.
3. **Deployment ignored cache policy — fixed.** The built site now contains an
   Azure `staticwebapp.config.json`. Live hashed JS returns
   `public, max-age=31536000, immutable`; `/sw.js` returns `no-cache`. Brotli and
   ETag/304 remain working.
4. **False-200 unknown routes — fixed.** Azure's 404 response override serves the
   authored `404.html` with HTTP 404. `/does-not-exist` was verified live as 404 and
   its body hash matches the build.
5. **Hardening and manifest MIME — fixed.** Live responses include CSP,
   Permissions-Policy, `nosniff`, strict referrer policy, HSTS, and DNS-prefetch
   disabled. The manifest moved from `.webmanifest` (Azure served it as
   `application/octet-stream`) to `/manifest.json`, which is live as
   `application/json` and parses as JSON.
6. **42px Terms target — fixed.** Footer links have a 44px minimum width and height.
   Live computed sizes at desktop and 390px are Privacy 58.81×44, Terms 44×44, and
   MIT license 92.42×44 CSS pixels.

The service-worker shell advanced to `apg-field-guide-v3`; activation removes old
caches and a controlled offline reload succeeds. The researched brief and original
pressroom visual system were preserved.

## Regression coverage

- `tests/cli.rs`: allowed JSON runs keep child stdout clean and independently emit
  a parseable allowed decision on stderr.
- `site/deployment.test.js`: the primary command is a Git install, Azure caching and
  hardening routes are present, 404 remains a 404, and the shell cache version is
  advanced.
- `tests/site/site.spec.js`: exact install text, all footer target dimensions,
  desktop/mobile axe scans, keyboard operation, 390px overflow, legal routes, and a
  service-worker-controlled offline reload.
- `site/live-check.mjs` / `npm run verify:live`: deployed desktop and mobile axe,
  console errors, same-origin request policy, cookie/storage privacy, keyboard focus,
  reduced motion, touch targets, legal pages, active cache version, and offline reload.

## Verification evidence

Commands run from a clean dependency install:

```sh
npm ci
npm audit --audit-level=high
npm test
npm run lint
npm run build
npm run test:e2e
cargo build --release
cargo package
npm run verify:live
```

- `npm ci`: 20 packages installed; audit found 0 vulnerabilities.
- `npm test`: 7 Rust unit + 4 CLI integration + 7 site/deployment tests passed
  (18 total, 0 failed).
- `npm run lint`: Rust formatting and all-target Clippy with warnings denied passed.
- `npm run build`: Vite 7.3.6 produced `dist/site/`.
- `npm run test:e2e`: 6 passed across desktop Chromium and 390×844 Chromium; 2
  intentional project-scope skips. Axe found zero serious/critical violations.
- `cargo build --release`: stripped single `apg` binary, 1,565,712 bytes.
- `cargo package`: 15 files, 77.2 KiB unpacked / 22.9 KiB compressed; package
  verification compiled. An isolated install from its unpacked crate passed.
- Public Git consumer install: passed from outside the checkout; version and full
  help output passed.
- Visual inspection: full-page 1440×900 and 390×844 renders had no clipping,
  overlap, or horizontal page overflow.
- Offline/update: the new `v3` cache took control, only the current cache remained,
  the offline status appeared, and a network-disabled reload rendered the complete
  home shell.
- Privacy: no cookies, localStorage, sessionStorage, analytics, third-party scripts,
  or cross-origin runtime requests on either viewport.
- Factory `verify-url.sh`: HTTPS 200, title and `lang=en`, one h1, main landmark,
  complete image alt text, labelled controls, 2,676 visible characters, and zero
  console/page errors.

Production payloads remain within budget: 5,100 bytes raw initial JavaScript,
11,354 bytes CSS, 0 bytes fonts, 49,178-byte mobile hero, and 148,256-byte large
hero. The deployed artifact upload was 236,859 bytes.

### Live Lighthouse 12.8.2 mobile profile

| Metric | Result |
| --- | ---: |
| Performance | 100 |
| Accessibility | 100 |
| Best practices | 100 |
| SEO | 100 |
| FCP | 0.9 s |
| LCP | 1.1 s |
| TBT | 0 ms |
| CLS | 0 |
| Total transfer | 59 KiB |

### Deployment identity and policy

Local/live SHA-256 pairs matched exactly:

- `index.html`: `b14a4bbd6d3f444935ebbac34b204e1a3f8a40896fb47240af19df220295b6d9`
- `sw.js`: `4c9834cb0a91d63dac633594f9579136415902732d5d6026e23c26e58dc6e913`
- `manifest.json`: `4b48563cb52abc53a9199850666ec3c0721e41dfbc3aadd34e26649898eef616`
- `404.html`: `762d004059df6436f323f4d69a69acdf5f97e754227beb731e825df7c95413ff`

HTTP redirects to HTTPS with 301. Conditional ETag returned 304. Deployment
`109357f5-c9a7-4f58-9bfe-3f5d7af6b1e2` succeeded on Azure Static Web Apps and the
custom domain reported Ready.

## Known product boundary and next step

The guard remains a wrapper, not an intercepting proxy: a child can ignore supplied
request metadata. Keep reviewed scripts and narrow production allowlists. The
package is ready for `cargo publish`, but the factory must perform registry
publication; until then, the tested Git install is the truthful primary path.
