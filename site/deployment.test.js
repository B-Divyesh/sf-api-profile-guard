import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8')

test('primary install journey uses a working source install until registry publication', async () => {
  const html = await read('./index.html')
  assert.match(
    html,
    /cargo install --git https:\/\/github\.com\/B-Divyesh\/sf-api-profile-guard\.git --locked api-profile-guard/
  )
  assert.doesNotMatch(html, />cargo install api-profile-guard</)
})

test('Azure deployment config enforces caching, hardening, MIME, and a true 404', async () => {
  const config = JSON.parse(await read('./public/staticwebapp.config.json'))
  const route = (path) => config.routes.find(({ route }) => route === path)

  assert.equal(route('/assets/*').headers['cache-control'], 'public, max-age=31536000, immutable')
  assert.equal(route('/sw.js').headers['cache-control'], 'no-cache')
  assert.equal(route('/manifest.json').headers['content-type'], 'application/manifest+json')
  assert.deepEqual(config.responseOverrides['404'], { rewrite: '/404.html', statusCode: 404 })
  assert.match(config.globalHeaders['content-security-policy'], /default-src 'self'/)
  assert.match(config.globalHeaders['content-security-policy'], /frame-ancestors 'none'/)
  assert.match(config.globalHeaders['permissions-policy'], /camera=\(\)/)
})

test('service-worker cache version advances with the repaired shell', async () => {
  assert.match(await read('./public/sw.js'), /const CACHE = 'apg-field-guide-v3'/)
})
