# API Profile Guard v0.1.0 — independent verification handoff

## Release status: PASS

Independent QA completed on 2026-08-28 UTC for candidate
`1c09a05aa149df13daf545273af7be450e0b0306` and the public deployment at
<https://api-profile-guard.sociobot.in>. The live deployment matches the candidate.
Complete evidence and case-by-case results are in `.factory/verification-2.md`.

No product code was changed. Verification documentation is the only source-tree change.

## What was verified

- Fresh detached clone, clean `npm ci`, zero-vulnerability audit, all tests, Rust format
  and Clippy, exact Vite production build, release binary, and `cargo package`.
- 18 unit/integration/site tests passed; Playwright passed 6 checks with 2 intentional
  project-scope skips across desktop and 390x844 Chromium.
- The packed crate installed in a clean Cargo root. The documented public Git install also
  succeeded and resolved the candidate SHA.
- Normal, boundary, malformed, blocked, recovery, child-exit, JSON-stream, receipt-failure,
  literal-dotenv, missing-variable, concurrency, and privacy cases passed. Forbidden hosts
  and missing variables blocked before child execution; a real listener saw no connection.
- Six live axe scans had zero serious/critical findings. Keyboard/focus, 44px targets,
  reduced motion, desktop/mobile layout, console/page errors, privacy, legal pages, and
  simulator recovery passed.
- Sixteen live artifacts matched the clean build byte-for-byte. HTTPS/security headers,
  immutable asset caching, no-cache service worker, ETag/304, true 404, service-worker
  update, and offline reload passed.
- Lighthouse mobile scored 94–100 performance and 100 accessibility/best-practices/SEO,
  with 1.13 s LCP, 0 CLS, and about 60.7 KiB transferred.

## Reproduce

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

Build output is `dist/site/`; the release CLI is `target/release/apg`. The package is ready
for the factory-owned `cargo publish` step, but no registry publication was attempted.

## Defects and remaining boundary

No release defect was found at any severity. The documented product boundary remains: this
is a preflight wrapper, not an intercepting proxy, so reviewed child commands should use the
exact `{url}` substitution and narrow production allowlists.
