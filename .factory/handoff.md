# API Profile Guard — adversarial review 2 handoff

## Outcome

Review 2 completed against live production and repository revision
`d647ea7c98fcb1de56826a6fc02e1633c9821e55`.

Verdict: **FAIL** with two blocking findings and one minor finding. No product code
was changed.

## Deliverables

- `.factory/review-2.md` contains the cold 390 px and desktop assessment, complete
  landing/README sentence audit, findings, all 17 claim results, demo/storage/
  offline evidence, earlier-finding replay, route/link/accessibility checks, and
  missed-leverage assessment.
- The one-click demo and its isolation work, but its hard-coded terminal claims to
  be recorded from `apg demo` while showing an impossible identical fingerprint
  for the blocked and allowed requests.
- The landing page still shortens the required term to “production phrase” once.
- The README's unlisted “Node.js 20 or newer” claim conflicts with Vite 7.3.6's
  declared `^20.19.0 || >=22.12.0` range.

## Verification

Fresh clone: `/tmp/api-profile-guard-review2-clone.u4xhB5/repo` at the reviewed
SHA.

- 17/17 `.factory/claims.json` commands passed separately.
- `npm test` passed.
- `npm run lint` passed.
- `npm run build` passed and produced `dist/site/`.
- `npm run test:e2e` passed: 30 passed, 20 intentional skips.
- The exact public Git install command installed one `apg 0.1.0` binary.
- Live route, link, axe, focus, same-origin, storage-canary, reset, exit, and
  offline checks passed apart from the findings recorded above.

## Next steps

Resolve F-2-1, F-2-2, and F-2-3 exactly as specified in the review, deploy, and
repeat the full review from a fresh browser and clone. Do not treat the passing
general suite as closure for the inaccurate demo transcript or unlisted Node
compatibility claim.
