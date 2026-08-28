# API Profile Guard — review 1 handoff

## Outcome

Completed the requested adversarial first-read review without changing product code.
The complete report is in `.factory/review-1.md`; verdict: **FAIL**.

The blocking issues are: first-screen clarity, absence of the required isolated CLI/sample
demo, and absence of `.factory/claims.json` plus tagged claim tests. Minor issues cover copy,
route metadata, and skeleton consistency.

## Verification performed

- Fresh live Chromium contexts at 390×844 and 1440×900; no initial console errors.
- Checked `/`, `/?demo=1`, `/demo`, Privacy, Terms, and an unknown route; `/demo` is 404.
- Intercepted ordinary simulator traffic (same-origin only), checked storage (empty), and
  confirmed an offline service-worker reload still runs the default simulator. This is not a
  demo/claim test because no demo exists.
- Ran `apg --demo` and `apg demo` in a new temp directory: both exit 2 because neither command
  exists.
- Cloned the public remote cleanly at `e5d186bf349a6baa5bb22882e76f9c3253a4ff97`; confirmed
  `claims.json` is absent; `npm test` passed and `npm run build` produced `dist/site/`.
- Crawled all landing-page link targets. Linked destinations returned 200, except the expected
  intentional unknown-route 404.

## How to reproduce

```sh
git clone https://github.com/B-Divyesh/sf-api-profile-guard.git /tmp/apg-clean
cd /tmp/apg-clean
npm ci
npm test
npm run build
target/debug/apg --demo  # currently exits 2; required demo is absent
target/debug/apg demo    # currently exits 2; required demo is absent
```

No deployment, billing, infrastructure, or application-source change was made. Next work is
to implement the report’s demo, claims, hero-copy, and route-metadata fixes, then rerun this
review from a clean clone.
