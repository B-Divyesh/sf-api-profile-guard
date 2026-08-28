# Independent product verification — FAIL

Tested on 2026-08-28 UTC.

- Candidate: `f67fc1baf8da7d2f1d117f19407cff9fe1c026fe`
- Repository: `https://github.com/B-Divyesh/sf-api-profile-guard.git`
- Live URL: `https://api-profile-guard.sociobot.in`
- Artifact: Rust CLI (`apg`) plus static documentation/policy simulator
- Verdict: **FAIL**

The candidate is clean, buildable, safety checks fail closed, and the live site is
the candidate build. It does not meet the end-to-end release contract because the
live primary install command cannot currently install the product and the promised
single-object JSON mode is invalid for an allowed `run` whose child writes stdout.
Deployment caching also contradicts the repository's explicit asset policy.

## Environment and clean-checkout evidence

Verification ran from a separate, fresh clone checked out detached at the candidate.
The source worktree was clean before report-only changes, and `origin/main` resolved
to the same SHA.

| Tool | Version |
| --- | --- |
| Node.js | 22.23.2 |
| npm | 10.9.8 |
| rustc | 1.98.0 |
| cargo | 1.98.0 |
| Playwright | 1.58.2 |
| Lighthouse | 12.8.2 |

`npm ci` installed 20 packages from the lockfile. `npm audit --audit-level=high`
reported 0 vulnerabilities. There is no separate TypeScript/typecheck script; this
is Rust plus vanilla JavaScript. The repository's available static gates are Rust
formatting and Clippy.

## Repository gates

| Gate | Result | Evidence |
| --- | --- | --- |
| `npm test` | PASS | 7 Rust unit + 3 CLI integration + 4 site policy tests; 14 passed, 0 failed |
| `npm run lint` | PASS | `cargo fmt --check` and all-target Clippy with warnings denied |
| `npm run build` | PASS | Vite 7.3.6; output created at `dist/site/` |
| `npm run test:e2e` | PASS | 6 passed, 2 intentional project-scope skips, desktop + 390x844 Chromium |
| `cargo build --release` | PASS | stripped `apg` binary, 1,562,168 bytes |
| `cargo package` | PASS | 15 files, 74.2 KiB unpacked / 22.1 KiB compressed; package verification compiled |
| isolated package install | PASS | installed from the packaged crate into a new Cargo root; `apg 0.1.0` and help worked |

Production build payloads were 4,389 + 711 bytes raw initial JavaScript, 11,303
bytes CSS, 0 bytes fonts, 49,178 bytes for the mobile hero, and 148,256 bytes for
the large hero. Total `dist/` disk use was about 300 KiB. These meet the 200 KiB JS,
50 KiB CSS, 120 KiB font, and 300 KiB hero budgets.

## CLI and policy exercise

The packaged consumer binary was exercised independently of the source target.

| Case | Expected / observed |
| --- | --- |
| allowed production POST with exact acknowledgement | exit 0 / allowed |
| missing or wrong production acknowledgement | exit 10 / blocked |
| explicit deny overlapping an allow | exit 10 / deny won |
| `api.example.com.evil.test` absolute URL | exit 10 / `host_not_allowed` |
| missing required profile variable | exit 10 / blocked before child |
| forbidden JSON field | exit 10 / blocked without body value in output |
| malformed JSON under a JSON field policy | exit 10 / `body_invalid_json` |
| 16-byte body with a 16-byte limit | exit 0 / allowed |
| 17-byte body with a 16-byte limit | exit 10 / `body_too_large` |
| invalid method, scheme, or profile | exit 2 with actionable diagnostic |
| dotenv `$(touch ...)` expression | exit 2; marker was not created |
| allowed child exits 7 | CLI propagated exit 7 |
| blocked child has a marker side effect | exit 10; marker absent |
| receipt write to `/dev/full` | exit 2; child not started |
| allowed run environment and `{url}` replacement | profile value and exact resolved URL reached child |

The repository's forbidden-host integration test bound a real local TCP listener
and proved both that the child marker was absent and that `accept()` saw no
connection. This directly satisfies the success measure for the seeded hostile
hosts. Missing-variable seeded cases also blocked 100% before child execution.

Forty checks ran concurrently against one receipt file. All 40 appended records
were intact; the resulting 51-line test receipt parsed as JSON line-by-line. Canary
profile values, body values, and query values were absent from stdout decisions and
receipts. Invalid input recovered on the next valid invocation.

### CLI defect reproduction

The global help promises: “Emit one JSON object for scripting.” An allowed run with
a child that writes stdout produced:

```text
{"decision":"allowed",...}
CHILD_STDOUT
```

Parsing the complete stdout with `JSON.parse` failed at line 2. Normal non-JSON run
output similarly precedes child stdout, so wrapping curl contaminates response
pipelines. `check --json` and blocked `run --json` remain valid single objects.

## Live deployment identity

The live home and service worker hashes matched the clean production build:

- `index.html`: `d4ac46422bd7868055dd9acd5c60c7bb43d20ed1d07392c7a380ed7af5306e7d`
- `sw.js`: `650fc908d2393684c25cb0d7e9b18f1afee3ea0b26ce6504c5f3dfc2ef386474`

Thirteen representative output files matched byte-for-byte: home, privacy, terms,
the 404 artifact, service worker, manifest, favicon, both WebP images, all three JS
chunks, and the CSS chunk. This is sufficient build identity evidence: the live
deployment is the candidate, not an older preview.

The factory `/opt/fleet/lib/verify-url.sh` passed: HTTPS 200, title, `lang=en`, one
`h1`, `main`, image alt text, labelled buttons, 2,543 visible text characters, and
zero console/page errors.

## Browser, accessibility, privacy, and PWA checks

Fresh Chromium checks ran at 1440x900 desktop and 390x844 mobile.

- Home, privacy, and terms had zero axe violations of any impact (therefore zero
  serious/critical findings).
- There was no horizontal page overflow at 390 px; visual inspection found no
  clipping or overlap in default state.
- Tab order reached the skip link, navigation, copy action, simulator controls,
  scrollable code regions, CTA, and footer. Every tested tab stop showed the designed
  3 px solid focus outline. Enter submitted the simulator.
- The simulator passed allowed production, blocked foreign host, invalid-scheme,
  and subsequent valid recovery cases. Query canaries were not rendered.
- `prefers-reduced-motion: reduce` changed smooth scrolling to `auto` and reduced
  transition duration to `0.00001s`.
- No console errors, uncaught page errors, or failed requests occurred.
- All initial runtime requests were same-origin. No cookies, localStorage, or
  sessionStorage entries appeared; no analytics or third-party runtime bytes loaded.
- A real offline reload succeeded under service-worker control and displayed the
  offline status. A controlled service-worker cache bump from v1 to v2 caused
  `controllerchange`, reached `activated`, deleted v1, retained only v2, and still
  reloaded offline.
- Chrome parsed the manifest without errors. It has no install icons, but installable
  PWA distribution is not part of this CLI's stated core scope.

One footer `Terms` link measured 42x44 CSS px, two pixels short of the product's
44x44 target contract. Other visible controls met the target in the sampled states.

## Live performance

Lighthouse 12.8.2 ran against the public URL with the mobile profile on 2026-08-28.

| Metric | Result |
| --- | ---: |
| Performance | 100 |
| Accessibility | 100 |
| Best practices | 100 |
| SEO | 100 |
| FCP | 1.11 s |
| LCP | 1.16 s |
| TBT | 0 ms |
| CLS | 0 |
| Total transfer | 59,970 bytes |
| Third-party transfer | 0 bytes |

## Response policies and caching

HTTP redirects to HTTPS. HTTPS responses include HSTS
(`max-age=10886400; includeSubDomains; preload`), `nosniff`,
`strict-origin-when-cross-origin`, and DNS prefetch disabled. Brotli works for JS,
and an ETag conditional request returned 304.

The live host does **not** apply `site/public/_headers`: HTML, hashed assets, WebP,
and `sw.js` all return `Cache-Control: public, must-revalidate, max-age=30`. Hashed
assets therefore lack the required one-year immutable policy and `sw.js` lacks the
declared `no-cache` policy. The manifest is served as `application/octet-stream`
(Chrome still parsed it). CSP and Permissions-Policy are absent. An unknown route
returns HTTP 200 with the home page instead of the built 404 response.

## Defects

### High — live primary installation path is unavailable

The hero tells users to run `cargo install api-profile-guard`. From `/tmp` (outside
the source checkout), `cargo info api-profile-guard` updated the crates.io index and
failed with `could not find api-profile-guard`. `cargo search` returned no match and
the repository has no GitHub release. The README's source-build route works, but the
deployed primary command does not. Until factory publication occurs, the live site
must present a working source/git install command or clearly label the registry
command as unavailable.

### Medium — allowed `run --json` violates the stable JSON contract

Child stdout follows the decision object on the same stdout stream, so the complete
result is not one JSON value and cannot be consumed by a JSON parser. This breaks the
documented scripting mode for a core `run` path. Separate guard metadata from child
stdout (or narrow and document the JSON guarantee).

### Medium — deployed cache rules ignore the candidate's explicit policy

Hashed assets use a 30-second revalidating TTL rather than one-year immutable
caching, and the worker script has the same generic policy rather than `no-cache`.
The current Lighthouse result is fast, but this fails the stated caching acceptance
contract and causes needless repeat validation.

### Low — unknown routes return a false 200

`/does-not-exist` returns the home document with HTTP 200 even though `404.html` is
present and matches the candidate. This harms error recovery and indexing semantics.

### Low — browser hardening and MIME policy are incomplete

CSP and Permissions-Policy are absent, and the web manifest has a generic binary
MIME type. Existing HSTS, referrer, and nosniff headers are good; Chrome parsed the
manifest despite the MIME type.

### Low — one touch target misses the product contract

The visible footer `Terms` link is 42x44 CSS px at desktop and mobile rather than the
required minimum 44x44.

## Release decision

**FAIL.** No critical security or data-loss issue was found, and the core policy
engine itself behaved safely. Release acceptance is blocked by the non-working live
install journey and broken `run --json` public contract. Correct those and apply the
deployment caching/404 policies, then rerun this verification.
