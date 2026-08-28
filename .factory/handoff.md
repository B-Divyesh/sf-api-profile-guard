# API Profile Guard v0.1.0 — handoff

## What shipped

- A publish-ready Rust package producing one `apg` binary with `check` and `run`
  commands, clear help, stable `--json` output, documented exit codes, and no
  interactive prompt in CI.
- Literal dotenv parsing that never evaluates a shell and rejects `$` expansion,
  command substitution, duplicate keys, malformed assignments, and multiline
  values.
- Named profiles with required variables, non-secret fingerprints, credential-class
  labels, exact host allowlists, deny-first method/path rules, default-deny
  production operations, exact production acknowledgement, body-size limits, and
  required/forbidden JSON field paths.
- Fail-closed execution: `apg run` spawns the requested client only after policy and
  receipt writing succeed. Exact `{url}` arguments resolve to the checked URL, and
  profile values are injected only into the child environment.
- Append-only JSONL receipts containing decision metadata but no environment values,
  headers, query strings, or request bodies.
- A Vite static docs site in `dist/site/` with a real browser-only preflight
  simulator; explicit empty, loading, allowed, blocked, input-error, and offline
  states; keyboard and 390px layouts; privacy, terms, 404, sitemap, cache headers,
  and versioned service-worker caching.
- A product-specific dithered safety-manual visual system. The original hero was
  generated with `/opt/fleet/lib/gen-image.sh` using the `factory-image` deployment,
  converted to 145 KB WebP, and given a 49 KB mobile derivative. The full prompt and
  provenance are in `.factory/design.md` and
  `site/public/preflight-gate.webp.json`.

## Run and verify

```sh
npm ci
npm test
npm run build
npm run test:e2e
npm run lint
cargo build --release
cargo package
```

- `npm test`: pass — 7 Rust unit tests, 3 Rust CLI integration tests, and 4 browser
  policy tests. The seeded forbidden-production-host and missing-required-variable
  matrices blocked 100%. Integration tests prove the child was not started and a
  local TCP listener received no connection for a forbidden production host.
- `npm run test:e2e`: pass — 6 Playwright checks passed across desktop Chromium and
  a 390 × 844 Chromium viewport; 2 intentionally project-scoped checks skipped.
  Includes allowed/blocked/error keyboard paths, mobile overflow, legal routes,
  offline messaging, console errors, and axe. Axe found zero serious/critical
  issues.
- `npm run build`: pass — Vite output at exactly `dist/site/`, with `index.html` at
  its root.
- `npm run lint`: pass — `cargo fmt --check` and Clippy with warnings denied.
- `cargo package`: pass — verified package, about 22 KB compressed. Publish later
  with `cargo publish`; the factory owns registry credentials and no publish was
  attempted.
- `cargo build --release`: pass — stripped single binary at `target/release/apg`
  (about 1.5 MB in this build environment).
- Factory `verify-url.sh` against the production preview: HTTP 200, no console
  errors, `lang=en`, one h1, main landmark present, no image missing alt text, and no
  unlabeled button.
- `npm audit --audit-level=high`: pass — 0 known vulnerabilities.

## Lighthouse-class results

Measured August 28, 2026 against `vite preview` with Lighthouse 12.8.2's mobile
profile and headless Chromium:

| Category / metric | Result |
| --- | ---: |
| Performance | 100 |
| Accessibility | 100 |
| Best practices | 100 |
| SEO | 100 |
| LCP | 1.5 s |
| Total blocking time | 0 ms |
| CLS | 0 |

Built home payloads are about 5.1 KB initial JavaScript, 11.3 KB CSS, 0 KB fonts,
and a 49 KB mobile hero. These are below the 200 KB JS, 50 KB CSS, 120 KB font, and
300 KB hero budgets. Local preview results are evidence, not a promise of deployed
network latency.

## Known gaps and operational notes

- The tool is a wrapper, not an intercepting proxy. A child program can ignore the
  request metadata passed to `apg`; teams should keep reviewed scripts and narrow
  production allowlists. This boundary is explicit in the README and terms.
- Host policy intentionally matches hostname only, without wildcard domains. Ports
  are still preserved in the resolved URL passed to the child.
- JSON field rules address object properties with dot paths; they do not currently
  address array indices or JSON Pointer escaping.
- Registry publishing, release binaries, signing, and static deployment remain with
  the factory. No infrastructure, DNS, billing, or registry state was changed.

## Suggested next steps

1. Publish signed binaries and the crate from CI, then replace the landing page's
   `cargo install` expectation with release-asset links where appropriate.
2. Add shell-completion generation after the first release stabilizes the CLI.
3. Consider an opt-in local proxy mode only if real-world clients cannot expose
   reliable method/path/body metadata to the wrapper.
