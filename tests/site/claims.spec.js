import { expect, test } from 'playwright/test'
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:net'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

const binary = resolve('target/debug/apg')

function cli(args, cwd) {
  return spawnSync(binary, args, { cwd, encoding: 'utf8' })
}

function workspace(label) {
  return mkdtempSync(`${tmpdir()}/apg-claim-${label}-`)
}

function writePolicy(root, { baseUrl = 'https://api.example.com', token = 'claim-secret-value', allowedHost = 'api.example.com' } = {}) {
  writeFileSync(
    `${root}/apg.toml`,
    `version = 1
receipt_log = "receipts.jsonl"

[profiles.production]
env_file = "production.env"
base_url_var = "API_BASE_URL"
required = ["API_BASE_URL", "API_TOKEN"]
credential_class = "live"
production = true
acknowledgement = "production"
allowed_hosts = ["${allowedHost}"]
allow = ["POST /v1/*"]
deny = ["POST /v1/admin/*"]
required_json_fields = ["customer.id"]
forbidden_json_fields = ["debug"]
`
  )
  writeFileSync(`${root}/production.env`, `API_BASE_URL=${baseUrl}\n${token === null ? '' : `API_TOKEN=${token}\n`}`)
  writeFileSync(`${root}/body.json`, '{"customer":{"id":"receipt-body-canary"}}\n')
}

test('@claim:cli-demo-sandbox', async ({}, testInfo) => {
  test.skip(testInfo.project.name.includes('mobile'), 'one clean CLI sandbox is sufficient')
  const caller = workspace('demo')
  writeFileSync(`${caller}/keep.txt`, 'unchanged')
  const before = readdirSync(caller)
  const result = cli(['demo'], caller)
  expect(result.status).toBe(0)
  expect(result.stdout).toContain('Sample 1 of 2 — wrong production host')
  expect(result.stdout).toContain('✕ BLOCKED')
  expect(result.stdout).toContain('Sample 2 of 2 — approved production request')
  expect(result.stdout).toContain('✓ ALLOWED')
  expect(result.stdout).toContain('policy: ')
  expect(result.stdout).toContain('environment: ')
  expect(result.stdout).toContain('request body: ')
  expect(result.stdout).toContain('receipts: ')
  const demoPath = result.stdout.match(/^  workspace: (.+)$/m)?.[1]
  expect(demoPath).toBeTruthy()
  expect(demoPath.startsWith(tmpdir())).toBe(true)
  expect(readdirSync(caller)).toEqual(before)
  expect(readFileSync(`${demoPath}/receipts.jsonl`, 'utf8').trim().split('\n')).toHaveLength(2)
  rmSync(demoPath, { recursive: true })
  rmSync(caller, { recursive: true })
})

test('@claim:blocked-host-no-client', async ({}, testInfo) => {
  test.skip(testInfo.project.name.includes('mobile'), 'one clean CLI sandbox is sufficient')
  const root = workspace('blocked-host')
  let connections = 0
  const server = createServer((socket) => {
    connections += 1
    socket.destroy()
  })
  await new Promise((done) => server.listen(0, '127.0.0.1', done))
  const port = server.address().port
  writePolicy(root, { baseUrl: `http://127.0.0.1:${port}` })
  const result = cli([
    'run', '--profile', 'production', '--method', 'POST', '--url', '/v1/orders', '--body-file', 'body.json',
    '--ack-production', 'production', '--', 'sh', '-c', "touch child-started; curl -s '{url}'"
  ], root)
  await new Promise((done) => setTimeout(done, 50))
  expect(result.status).toBe(10)
  expect(() => readFileSync(`${root}/child-started`)).toThrow()
  expect(connections).toBe(0)
  await new Promise((done) => server.close(done))
  rmSync(root, { recursive: true })
})

test('@claim:check-no-network', async ({}, testInfo) => {
  test.skip(testInfo.project.name.includes('mobile'), 'one clean CLI sandbox is sufficient')
  const root = workspace('check-no-network')
  let connections = 0
  const server = createServer((socket) => {
    connections += 1
    socket.destroy()
  })
  await new Promise((done) => server.listen(0, '127.0.0.1', done))
  const port = server.address().port
  writePolicy(root, { baseUrl: `http://127.0.0.1:${port}`, allowedHost: '127.0.0.1' })
  const result = cli([
    'check', '--profile', 'production', '--method', 'POST', '--url', '/v1/orders', '--body-file', 'body.json',
    '--ack-production', 'production'
  ], root)
  await new Promise((done) => setTimeout(done, 50))
  expect(result.status).toBe(0)
  expect(connections).toBe(0)
  await new Promise((done) => server.close(done))
  rmSync(root, { recursive: true })
})

test('@claim:missing-variable-no-client', async ({}, testInfo) => {
  test.skip(testInfo.project.name.includes('mobile'), 'one clean CLI sandbox is sufficient')
  const root = workspace('missing-variable')
  writePolicy(root, { token: null })
  const result = cli([
    'run', '--profile', 'production', '--method', 'POST', '--url', '/v1/orders', '--body-file', 'body.json',
    '--ack-production', 'production', '--', 'touch', 'child-started'
  ], root)
  expect(result.status).toBe(10)
  expect(result.stdout).toContain('missing_required:API_TOKEN')
  expect(() => readFileSync(`${root}/child-started`)).toThrow()
  rmSync(root, { recursive: true })
})

test('@claim:receipt-redaction', async ({}, testInfo) => {
  test.skip(testInfo.project.name.includes('mobile'), 'one clean CLI sandbox is sufficient')
  const root = workspace('receipt')
  writePolicy(root)
  const result = cli([
    '--json', 'check', '--profile', 'production', '--method', 'POST',
    '--url', '/v1/orders?query_canary=private', '--body-file', 'body.json', '--ack-production', 'production'
  ], root)
  expect(result.status).toBe(0)
  const receiptText = readFileSync(`${root}/receipts.jsonl`, 'utf8')
  const receipt = JSON.parse(receiptText)
  expect(Object.keys(receipt).sort()).toEqual([
    'credential_class', 'decision', 'fingerprint', 'host', 'method', 'path', 'profile', 'reason_codes', 'schema', 'time'
  ])
  for (const canary of ['claim-secret-value', 'receipt-body-canary', 'query_canary', 'private']) {
    expect(`${result.stdout}\n${receiptText}`).not.toContain(canary)
  }
  rmSync(root, { recursive: true })
})

test('@claim:literal-environment-files', async ({}, testInfo) => {
  test.skip(testInfo.project.name.includes('mobile'), 'one clean CLI sandbox is sufficient')
  const root = workspace('literal-env')
  writePolicy(root)
  writeFileSync(`${root}/production.env`, 'API_BASE_URL=https://api.example.com\nAPI_TOKEN=$(touch expansion-ran)\n')
  const result = cli(['check', '--profile', 'production', '--method', 'POST', '--url', '/v1/orders', '--body-file', 'body.json', '--ack-production', 'production'], root)
  expect(result.status).toBe(2)
  expect(result.stderr).toContain('shell expansion and command substitution are not allowed')
  expect(() => readFileSync(`${root}/expansion-ran`)).toThrow()
  rmSync(root, { recursive: true })
})

test('@claim:production-policy', async ({}, testInfo) => {
  test.skip(testInfo.project.name.includes('mobile'), 'one clean CLI sandbox is sufficient')
  const root = workspace('production-policy')
  writePolicy(root)
  const base = ['check', '--profile', 'production', '--method', 'POST', '--url', '/v1/orders', '--body-file', 'body.json']
  expect(cli(base, root).status).toBe(10)
  expect(cli([...base, '--ack-production', 'wrong'], root).status).toBe(10)
  expect(cli([...base, '--ack-production', 'production'], root).status).toBe(0)
  expect(cli([
    'check', '--profile', 'production', '--method', 'POST', '--url', 'https://wrong.example/v1/orders',
    '--body-file', 'body.json', '--ack-production', 'production'
  ], root).status).toBe(10)
  expect(cli(['check', '--profile', 'production', '--method', 'DELETE', '--url', '/v1/orders', '--body-file', 'body.json', '--ack-production', 'production'], root).status).toBe(10)
  rmSync(root, { recursive: true })
})

test('@claim:policy-rule-order', async ({}, testInfo) => {
  test.skip(testInfo.project.name.includes('mobile'), 'one clean CLI sandbox is sufficient')
  const root = workspace('policy-rules')
  writePolicy(root)
  const common = ['check', '--profile', 'production', '--method', 'POST', '--body-file', 'body.json', '--ack-production', 'production']
  expect(cli([...common, '--url', 'ftp://api.example.com/v1/orders'], root).status).toBe(2)
  expect(cli([...common, '--url', 'https://api.example.com.evil.test/v1/orders'], root).status).toBe(10)
  const denied = cli([...common, '--url', '/v1/admin/delete'], root)
  expect(denied.status).toBe(10)
  expect(denied.stdout).toContain('operation_denied')
  const missingBody = cli(['check', '--profile', 'production', '--method', 'POST', '--url', '/v1/orders', '--ack-production', 'production'], root)
  expect(missingBody.status).toBe(10)
  expect(missingBody.stdout).toContain('body_required')
  writeFileSync(`${root}/body.json`, '{"customer":{}}\n')
  const missingPath = cli([...common, '--url', '/v1/orders'], root)
  expect(missingPath.status).toBe(10)
  expect(missingPath.stdout).toContain('required_json_field_missing:customer.id')
  writeFileSync(`${root}/body.json`, '{"customer":{"id":"claim-customer"}}\n')
  expect(cli([...common, '--url', '/v1/orders'], root).status).toBe(0)
  rmSync(root, { recursive: true })
})

test('@claim:clean-child-output', async ({}, testInfo) => {
  test.skip(testInfo.project.name.includes('mobile'), 'one clean CLI sandbox is sufficient')
  const root = workspace('stdout')
  writePolicy(root)
  const result = cli([
    '--json', 'run', '--profile', 'production', '--method', 'POST', '--url', '/v1/orders', '--body-file', 'body.json',
    '--ack-production', 'production', '--', 'sh', '-c',
    "test \"$API_TOKEN\" = claim-secret-value && printf '{\"client\":\"response\",\"url\":\"%s\"}' \"$1\"",
    'apg-claim-child', '{url}'
  ], root)
  expect(result.status).toBe(0)
  expect(JSON.parse(result.stdout)).toEqual({ client: 'response', url: 'https://api.example.com/v1/orders' })
  expect(JSON.parse(result.stderr).decision).toBe('allowed')
  expect(`${result.stdout}\n${result.stderr}`).not.toContain('claim-secret-value')
  const exitResult = cli([
    'run', '--profile', 'production', '--method', 'POST', '--url', '/v1/orders', '--body-file', 'body.json',
    '--ack-production', 'production', '--', 'sh', '-c', 'exit 7'
  ], root)
  expect(exitResult.status).toBe(7)
  rmSync(root, { recursive: true })
})

test('@claim:source-checkout-install', async ({}, testInfo) => {
  test.skip(testInfo.project.name.includes('mobile'), 'one clean source installation is sufficient')
  const root = workspace('source-install')
  const result = spawnSync('cargo', ['install', '--path', resolve('.'), '--root', root, '--locked'], { encoding: 'utf8' })
  expect(result.status, result.stderr).toBe(0)
  expect(readdirSync(`${root}/bin`)).toEqual(['apg'])
  const version = spawnSync(`${root}/bin/apg`, ['--version'], { encoding: 'utf8' })
  expect(version.status).toBe(0)
  expect(version.stdout.trim()).toBe('apg 0.1.0')
  rmSync(root, { recursive: true })
})

test('@claim:browser-demo-isolation', async ({ page, context }, testInfo) => {
  test.skip(testInfo.project.name.includes('mobile'), 'one clean browser sandbox is sufficient')
  await context.addInitScript(() => {
    localStorage.setItem('real:keep', 'local-value')
    sessionStorage.setItem('real:keep', 'session-value')
  })
  await page.goto('/')
  await page.getByRole('link', { name: 'Try it with sample data' }).click()
  await expect(page).toHaveURL(/\?demo=1#cli-demo$/)
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible()
  await expect(page.locator('#result-stamp')).toHaveText('✕ BLOCKED')
  expect(await page.evaluate(() => localStorage.getItem('real:keep'))).toBe('local-value')
  expect(await page.evaluate(() => sessionStorage.getItem('real:keep'))).toBe('session-value')
  expect(await page.evaluate(() => Object.keys(sessionStorage).sort())).toEqual([
    'demo:api-profile-guard:sample-v1', 'real:keep'
  ])
  await page.getByLabel('URL or path').fill('/v1/orders')
  await page.getByRole('button', { name: 'Check request' }).click()
  await expect(page.locator('#result-stamp')).toHaveText('✓ ALLOWED')
  await page.reload()
  await expect(page.getByLabel('URL or path')).toHaveValue('/v1/orders')
  await expect(page.locator('#result-stamp')).toHaveText('✓ ALLOWED')
  await page.getByRole('button', { name: 'Reset demo' }).click()
  await expect(page.getByLabel('URL or path')).toHaveValue('https://wrong.example/v1/orders')
  await page.getByRole('link', { name: 'Start for real' }).click()
  await expect(page).toHaveURL(/\/$/)
  await expect(page.getByRole('heading', { level: 1, name: 'Block API requests to the wrong environment' })).toBeFocused()
  expect(await page.evaluate(() => Object.keys(sessionStorage).filter((key) => key.startsWith('demo:')))).toEqual([])
  expect(await page.evaluate(() => localStorage.getItem('real:keep'))).toBe('local-value')
  expect(await page.evaluate(() => sessionStorage.getItem('real:keep'))).toBe('session-value')

  await page.goto('/?demo=1')
  await page.goto('/privacy/')
  expect(await page.evaluate(() => Object.keys(sessionStorage).filter((key) => key.startsWith('demo:')))).toEqual([])
  expect(await page.evaluate(() => localStorage.getItem('real:keep'))).toBe('local-value')
  expect(await page.evaluate(() => sessionStorage.getItem('real:keep'))).toBe('session-value')

  await page.goto('/?demo=1')
  const keysAfterExternalExit = await page.evaluate(() => new Promise((resolveKeys) => {
    document.addEventListener('click', (event) => {
      event.preventDefault()
      resolveKeys(Object.keys(sessionStorage).filter((key) => key.startsWith('demo:')))
    }, { once: true })
    document.querySelector('.final-cta a').click()
  }))
  expect(keysAfterExternalExit).toEqual([])
})

test('@claim:browser-policy-sample', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name.includes('mobile'), 'one clean browser policy sandbox is sufficient')
  await page.goto('/?demo=1')
  await expect(page.getByLabel('URL or path')).toHaveValue('https://wrong.example/v1/orders')
  await expect(page.locator('#result-stamp')).toHaveText('✕ BLOCKED')
  await expect(page.getByText(/not allowed for production/)).toBeVisible()
  await page.getByLabel('URL or path').fill('/v1/orders')
  await page.getByRole('button', { name: 'Check request' }).click()
  await expect(page.locator('#result-stamp')).toHaveText('✓ ALLOWED')
})

test('@claim:browser-input-local', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name.includes('mobile'), 'one clean browser sandbox is sufficient')
  await page.goto('/?demo=1', { waitUntil: 'networkidle' })
  const requests = []
  page.on('request', (request) => requests.push(request.url()))
  await page.getByLabel('URL or path').fill('/v1/orders')
  await page.getByRole('button', { name: 'Check request' }).click()
  await expect(page.locator('#result-stamp')).toHaveText('✓ ALLOWED')
  expect(requests).toEqual([])
})

test('@claim:offline-demo-reload', async ({ page, context }, testInfo) => {
  test.skip(testInfo.project.name.includes('mobile'), 'one offline browser sandbox is sufficient')
  await page.goto('/?demo=1')
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready
    if (!navigator.serviceWorker.controller) {
      await new Promise((done) => navigator.serviceWorker.addEventListener('controllerchange', done, { once: true }))
    }
  })
  await context.setOffline(true)
  await page.reload({ waitUntil: 'domcontentloaded' })
  await expect(page).toHaveTitle('Demo — API Profile Guard')
  await expect(page.locator('#result-stamp')).toHaveText('✕ BLOCKED')
  await expect(page.getByText(/Offline/)).toBeVisible()
  await context.setOffline(false)
})

test('@claim:no-account-demo', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name.includes('mobile'), 'one clean browser sandbox is sufficient')
  const responses = []
  page.on('response', (response) => responses.push(response.status()))
  await page.goto('/?demo=1')
  await expect(page.locator('#result-stamp')).toHaveText('✕ BLOCKED')
  expect(responses).not.toContain(401)
  expect(responses).not.toContain(403)
  await expect(page.locator('input[type="email"], input[type="password"]')).toHaveCount(0)
})

test('@claim:website-privacy', async ({ page, context }, testInfo) => {
  test.skip(testInfo.project.name.includes('mobile'), 'one clean browser sandbox is sufficient')
  const origins = new Set()
  page.on('request', (request) => origins.add(new URL(request.url()).origin))
  await page.goto('/?demo=1', { waitUntil: 'networkidle' })
  expect([...origins]).toEqual(['http://127.0.0.1:4173'])
  expect(await context.cookies()).toEqual([])
})

test('@claim:mit-license', async ({}, testInfo) => {
  test.skip(testInfo.project.name.includes('mobile'), 'one repository check is sufficient')
  expect(readFileSync('LICENSE', 'utf8')).toContain('Permission is hereby granted, free of charge')
  expect(readFileSync('Cargo.toml', 'utf8')).toContain('license = "MIT"')
})
