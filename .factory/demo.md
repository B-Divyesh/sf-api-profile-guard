# Demo sandbox

## Browser sample

- URL: `https://api-profile-guard.sociobot.in/?demo=1`
- Alternate route: `https://api-profile-guard.sociobot.in/demo/`
- First action: **Try it with sample data** on the landing screen.
- Seeded request: production `POST https://wrong.example/v1/orders` with the exact
  production confirmation phrase. The wrong host produces a blocked result immediately.
- Reset: **Reset demo** restores the seeded wrong-host request.
- Exit: **Start for real** removes every `demo:` session-storage key before opening `/`.
- Storage boundary: demo mode reads and writes only
  `sessionStorage["demo:api-profile-guard:sample-v1"]`. It never reads or changes
  keys outside the `demo:` namespace. Normal mode does not use the demo key.
- Network boundary: changing or checking the browser sample makes no request. Static
  shell files are same-origin and cached for offline reload.

## CLI sample

- Command: `apg demo`
- Shipped fixtures: `examples/demo/apg.toml`,
  `examples/demo/production.env.example`, and `examples/demo/order.json`.
- The command copies equivalent bundled fixtures into a new `apg-demo-*` directory
  under the operating-system temporary directory.
- It checks a wrong-host production request, then an allowed production request.
- It prints the workspace, policy, environment, request body, and receipt paths.
- It never changes the process working directory and writes nothing into the caller
  directory. The temporary workspace remains available for inspection.
- The landing terminal reads `site/demo-transcript.txt`. Regenerate that asset with
  `npm run demo:record`; the script runs the current binary and shortens only the
  temporary workspace path.

Run `npm run test:claim -- --grep '@claim:cli-demo-sandbox'` and
`npm run test:claim -- --grep '@claim:browser-demo-isolation'` to verify both
boundaries from clean sandboxes. The CLI claim compares every published transcript
line with a fresh run and separately requires two distinct fingerprints.
