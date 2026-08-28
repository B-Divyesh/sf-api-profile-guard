# Independent product verification — PASS

Tested on 2026-08-28 UTC.

- Candidate: `1c09a05aa149df13daf545273af7be450e0b0306`
- Repository: `https://github.com/B-Divyesh/sf-api-profile-guard.git`
- Live URL: `https://api-profile-guard.sociobot.in`
- Artifact: Rust CLI (`apg`) plus static documentation/policy simulator
- Verdict: **PASS**

The candidate satisfies the researched CLI contract. The policy engine blocked every
seeded forbidden-host and missing-variable request before a child or network connection
could start, packaged and installed cleanly, kept receipts value-free, and recovered
correctly from invalid input. The public Git installation journey works. The live site
matches the candidate build, passes its browser/privacy/accessibility checks, and applies
the intended security and caching policies.

## Clean-checkout and repository gates

Verification ran in a fresh, detached clone at the exact candidate. The clone and source
worktree were clean before report changes, and public `origin/main` resolved to the same
SHA. Tool versions were Node.js 22.23.2, npm 10.9.8, rustc/cargo 1.98.0, Playwright
1.58.2, Vite 7.3.6, and Lighthouse 12.8.2.

| Gate | Result | Evidence |
| --- | --- | --- |
| `npm ci` | PASS | 20 packages installed from lockfile |
| `npm audit --audit-level=high` | PASS | 0 vulnerabilities |
| `npm test` | PASS | 7 Rust unit + 4 CLI integration + 7 site/deployment tests; 18 passed |
| `npm run lint` | PASS | `cargo fmt --check`; all-target Clippy with warnings denied |
| `npm run build` | PASS | exact Vite production build created `dist/site/` |
| `npm run test:e2e` | PASS | 6 passed, 2 intentional project-scope skips; desktop + 390x844 Chromium |
| `cargo build --release` | PASS | stripped single binary, 1,565,712 bytes |
| `cargo package` | PASS | 15 files; 77.2 KiB unpacked / 22.9 KiB compressed; package verification compiled |

There is no separate TypeScript check: this product is Rust plus vanilla JavaScript.
The repository's available type/static gates are Rust compilation, formatting, and
Clippy, all of which passed.

## Packaged CLI and end-to-end policy exercise

The `.crate` was installed into a new Cargo root and its public `apg` binary reported
version 0.1.0 with complete `check`/`run`, exit-code, and JSON help. The documented public
Git command was also run from outside the checkout; Cargo resolved
`https://github.com/B-Divyesh/sf-api-profile-guard.git#1c09a05a`, installed successfully,
and returned `apg 0.1.0`.

| Representative case | Observed result |
| --- | --- |
| development check against unreachable local base | exit 0; allowed without a network dependency |
| allowed production POST + exact acknowledgement | exit 0; allowed |
| missing or case-mismatched acknowledgement | exit 10; blocked |
| explicit deny overlapping an allow | exit 10; `operation_denied` |
| `api.example.com.evil.test` absolute URL | exit 10; `host_not_allowed` |
| missing required profile variable | exit 10; child marker absent |
| required body absent / required field missing | exit 10 with actionable reason |
| forbidden JSON field | exit 10; field name only, never its value |
| malformed JSON under a JSON policy | exit 10; `body_invalid_json` |
| 16-byte body at a 16-byte maximum | exit 0 |
| 17-byte body at a 16-byte maximum | exit 10; `body_too_large` |
| invalid scheme, method, or profile | exit 2 with actionable diagnostic |
| dotenv `$(touch ...)` expression | exit 2; marker absent; expression was not executed |
| allowed child writes JSON on stdout | child JSON remained parseable; guard JSON was independently parseable on stderr |
| allowed child exits 7 | CLI propagated exit 7 |
| blocked child has a marker side effect | exit 10; marker absent |
| receipt write to `/dev/full` | exit 2; child marker absent |
| invalid input followed by a valid invocation | valid invocation succeeded |

The repository integration test used a real local TCP listener and confirmed both that
the forbidden-host child did not start and `accept()` observed no connection. Its seeded
forbidden-host and missing-variable matrices blocked 100%, directly satisfying the brief's
success measure.

Forty checks concurrently appended to one receipt. All 40 records remained intact and
parsed independently as JSON. Receipt keys were limited to schema/time, decision, profile,
fingerprint, method, host, path, credential class, and reason codes. Environment canaries,
query canaries, and body values were absent from decisions and receipts.

## Live build identity and response policy

Sixteen representative live artifacts matched the fresh production build byte-for-byte:
home, privacy, terms, the real 404 body, service worker, manifest, favicon, both WebPs,
image provenance, robots, sitemap, all three JavaScript chunks, and CSS.

- `index.html`: `b14a4bbd6d3f444935ebbac34b204e1a3f8a40896fb47240af19df220295b6d9`
- `sw.js`: `4c9834cb0a91d63dac633594f9579136415902732d5d6026e23c26e58dc6e913`
- `manifest.json`: `4b48563cb52abc53a9199850666ec3c0721e41dfbc3aadd34e26649898eef616`
- `404.html`: `762d004059df6436f323f4d69a69acdf5f97e754227beb731e825df7c95413ff`

HTTP redirects to HTTPS with 301. Live HTML carries HSTS, CSP, Permissions-Policy,
`nosniff`, strict referrer policy, and DNS-prefetch disabled. Hashed assets return
`public, max-age=31536000, immutable` with Brotli; WebPs use a seven-day TTL; `sw.js`
returns `no-cache`; an ETag conditional request returned 304. The manifest is valid JSON.
An unknown route returned HTTP 404 and the candidate's exact authored 404 body.

## Browser, accessibility, privacy, and offline behavior

Fresh Chromium checks ran at 1440x900 and 390x844 against production.

- Six live axe scans (home, privacy, and terms at both viewports) found zero serious or
  critical violations. The repository scans passed as well.
- One `h1`, `<main>`, `lang=en`, titles, alt text, labels, live result messaging, and
  landmarks were present. The factory `verify-url.sh` reported 2,676 visible characters,
  no unlabeled button, no missing image alt, and zero console/page errors.
- Keyboard traversal reached the skip link, navigation, install/copy actions, every form
  control, scrollable code regions, CTA, and footer links without a trap. All interactive
  focus stops used the designed 3px solid outline. Enter operated the simulator.
- All visible interactive targets measured at least 44x44 CSS px. The repaired Terms link
  measured exactly 44x44. Default mobile layout had zero horizontal page overflow.
- Production allowed, foreign-host blocked, invalid-scheme, and subsequent valid recovery
  states worked. A query canary was not rendered in the result.
- Reduced-motion mode changed smooth scrolling to `auto` and transitions to 0.00001s.
- There were no console errors, uncaught page errors, or failed runtime requests. Every
  request was same-origin; no cookies, localStorage, sessionStorage, analytics, third-party
  scripts, or third-party runtime bytes appeared.
- Live service-worker control used only `apg-field-guide-v3`; a network-disabled reload
  rendered the complete home shell and offline status. In a temporary copy, changing the
  shell from v3 to v4 activated the new worker, retired v3, retained only v4, and still
  reloaded offline.
- Full-page desktop and mobile screenshots were visually inspected: no overlap, clipping,
  hidden controls, or broken hierarchy was found.

The site has an offline manifest/service worker but the product is distributed as a CLI,
not advertised as an installable PWA. The manifest has no install icons; installable PWA
distribution is outside this artifact's acceptance scope.

## Performance and budgets

Production output was 5,100 bytes of initial home JavaScript (5,287 bytes across all JS),
11,354 bytes CSS, 0 font bytes, a 49,178-byte mobile hero, a 148,256-byte large hero, and
236,859 bytes for all `dist/site/` files. This is well below the 200 KiB JS, 50 KiB CSS,
120 KiB font, and 300 KiB hero budgets.

Two fresh Lighthouse mobile runs captured normal lab variance. Performance scored 94 and
100; accessibility, best practices, and SEO scored 100 in both. FCP was 0.89–0.95 s, LCP
1.13 s, TBT 81–289 ms, CLS 0, and transfer 60.7 KiB. Both performance scores exceed the
required 90 and LCP/CLS meet their budgets.

## Defects and release decision

No critical, high, medium, or low release defects were found in the candidate.

Known boundary, not a newly discovered defect: `apg` is a preflight wrapper rather than an
intercepting proxy, so a child can ignore the supplied metadata. The README and terms state
this clearly; reviewed commands, exact `{url}` substitution, and narrow production
allowlists remain necessary.

**PASS.** Candidate `1c09a05aa149df13daf545273af7be450e0b0306` is fit for release under
the supplied work order and researched brief.
