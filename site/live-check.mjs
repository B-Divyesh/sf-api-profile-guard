import assert from 'node:assert/strict'
import AxeBuilder from '@axe-core/playwright'
import { mkdir, readFile } from 'node:fs/promises'
import { chromium } from 'playwright'

const baseUrl = new URL(process.argv[2] || 'https://api-profile-guard.sociobot.in')
const evidenceDir = process.argv[3]
const publishedTranscript = (await readFile(new URL('./demo-transcript.txt', import.meta.url), 'utf8')).trimEnd()
if (evidenceDir) await mkdir(evidenceDir, { recursive: true })
const browser = await chromium.launch()
const results = []
const isInViewport = (locator) =>
  locator.evaluate((element) => {
    const rect = element.getBoundingClientRect()
    return rect.bottom > 0 && rect.right > 0 && rect.top < innerHeight && rect.left < innerWidth
  })

try {
  for (const [name, viewport] of [
    ['desktop', { width: 1440, height: 900 }],
    ['mobile', { width: 390, height: 844 }]
  ]) {
    const context = await browser.newContext({ viewport })
    const page = await context.newPage()
    const errors = []
    const requestOrigins = new Set()
    let currentPath = ''
    page.on('console', (message) => {
      const expected404Navigation =
        currentPath === '/does-not-exist' && message.text() === 'Failed to load resource: the server responded with a status of 404 ()'
      if (message.type() === 'error' && !expected404Navigation) errors.push(message.text())
    })
    page.on('pageerror', (error) => errors.push(String(error)))
    page.on('request', (request) => requestOrigins.add(new URL(request.url()).origin))

    for (const path of ['/', '/demo/', '/privacy/', '/terms/', '/does-not-exist']) {
      currentPath = path
      const response = await page.goto(new URL(path, baseUrl).href, { waitUntil: 'networkidle' })
      assert.equal(response.status(), path === '/does-not-exist' ? 404 : 200, `${name} ${path} status`)
      assert.equal(await page.locator('h1').count(), 1, `${name} ${path} h1`)
      assert.equal(await page.locator('main').count(), 1, `${name} ${path} main`)
      assert.equal(await page.locator('header [aria-label="Primary navigation"]').count(), 1, `${name} ${path} header`)
      assert.equal(await page.locator('footer').count(), 1, `${name} ${path} footer`)
      for (const selector of [
        'meta[name="description"]',
        'link[rel="canonical"]',
        'meta[property="og:title"]',
        'meta[property="og:description"]',
        'meta[property="og:image"]',
        'meta[name="twitter:card"]',
        'link[rel="icon"]',
        'link[rel="apple-touch-icon"]'
      ]) {
        assert.equal(await page.locator(selector).count(), 1, `${name} ${path} ${selector}`)
      }
      const serious = (await new AxeBuilder({ page }).analyze()).violations.filter(({ impact }) =>
        ['serious', 'critical'].includes(impact)
      )
      assert.deepEqual(serious, [], `${name} ${path} axe`)
      if (path === '/does-not-exist' && evidenceDir) {
        await page.screenshot({ path: `${evidenceDir}/live-404-${name}.png`, fullPage: true })
      }
    }

    currentPath = '/'
    await page.goto(baseUrl.href, { waitUntil: 'networkidle' })
    assert.equal(await page.locator('h1').count(), 1)
    assert.equal(
      await page.locator('#install-command').textContent(),
      'cargo install --git https://github.com/B-Divyesh/sf-api-profile-guard.git --locked api-profile-guard'
    )
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true)
    assert.deepEqual(errors, [])
    assert.deepEqual([...requestOrigins], [baseUrl.origin])
    assert.deepEqual(await context.cookies(), [])
    assert.deepEqual(
      await page.evaluate(() => ({ local: Object.keys(localStorage), session: Object.keys(sessionStorage) })),
      { local: [], session: [] }
    )

    assert.equal(await page.getByRole('heading', { level: 1 }).textContent(), 'Block API requests to the wrong environment')
    assert.equal(await page.getByText('For developers switching dev, staging, and production before they run a request.').count(), 1)
    assert.equal(await isInViewport(page.getByRole('link', { name: 'Try it with sample data' })), true)
    if (evidenceDir) await page.screenshot({ path: `${evidenceDir}/live-home-${name}.png`, fullPage: true })

    await page.evaluate(() => {
      localStorage.setItem('real:canary', 'local-real-data')
      sessionStorage.setItem('real:canary', 'session-real-data')
    })
    await page.getByRole('link', { name: 'Try it with sample data' }).click()
    assert.equal(new URL(page.url()).search, '?demo=1')
    assert.equal(new URL(page.url()).hash, '#cli-demo')
    assert.equal(await page.getByText('Demo — sample data, nothing is saved').isVisible(), true)
    const demoHeading = page.getByRole('heading', { level: 2, name: 'Run the bundled CLI sample' })
    assert.equal(await demoHeading.evaluate((element) => element === document.activeElement), true)
    assert.equal(await isInViewport(demoHeading), true)
    const transcript = page.getByLabel('Terminal recording of the bundled CLI demo')
    assert.equal((await transcript.textContent()).trimEnd(), publishedTranscript)
    assert.match(await transcript.textContent(), /POST wrong\.example\/v1\/orders/)
    assert.match(await transcript.textContent(), /POST api\.example\.com\/v1\/orders/)
    assert.match(await transcript.textContent(), /host_not_allowed: Host wrong\.example/)
    const fingerprints = [...(await transcript.textContent()).matchAll(/production · ([A-F0-9]{12})/g)].map((match) => match[1])
    assert.equal(fingerprints.length, 2)
    assert.equal(new Set(fingerprints).size, 2)
    assert.equal(await isInViewport(transcript.getByText('✕ BLOCKED')), true)
    assert.equal(await isInViewport(transcript.getByText('✓ ALLOWED')), true)
    if (evidenceDir) await page.screenshot({ path: `${evidenceDir}/live-demo-${name}.png`, fullPage: true })

    await page.getByRole('button', { name: 'Reset demo' }).click()
    assert.equal(await page.locator('#result-stamp').textContent(), '✕ BLOCKED')
    assert.equal(await page.locator('#request-url').inputValue(), 'https://wrong.example/v1/orders')
    await page.getByRole('link', { name: 'Start for real' }).click()
    assert.equal(new URL(page.url()).pathname, '/')
    assert.equal(await page.getByRole('heading', { level: 1 }).evaluate((element) => element === document.activeElement), true)
    assert.deepEqual(
      await page.evaluate(() => ({
        local: Object.fromEntries(Object.entries(localStorage)),
        session: Object.fromEntries(Object.entries(sessionStorage))
      })),
      { local: { 'real:canary': 'local-real-data' }, session: { 'real:canary': 'session-real-data' } }
    )

    await page.goto(baseUrl.href, { waitUntil: 'networkidle' })
    const footerSizes = await page.locator('footer nav a').evaluateAll((links) =>
      links.map((link) => {
        const box = link.getBoundingClientRect()
        return { text: link.textContent.trim(), width: box.width, height: box.height }
      })
    )
    assert.equal(footerSizes.every(({ width, height }) => width >= 44 && height >= 44), true)

    await page.evaluate(() => document.activeElement.blur())
    await page.locator('body').press('Home')
    await page.keyboard.press('Tab')
    assert.equal(await page.evaluate(() => document.activeElement.classList.contains('skip-link')), true)
    assert.equal(await page.evaluate(() => getComputedStyle(document.activeElement).outlineWidth), '3px')

    await page.emulateMedia({ reducedMotion: 'reduce' })
    assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior), 'auto')

    results.push({ name, errors: errors.length, footerSizes, distinctDemoFingerprints: fingerprints.length })
    await context.close()
  }

  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()
  await page.goto(baseUrl.href, { waitUntil: 'networkidle' })
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready
    if (!navigator.serviceWorker.controller) {
      await new Promise((resolve) => navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true }))
    }
  })
  assert.deepEqual(await page.evaluate(() => caches.keys()), ['apg-field-guide-v6'])
  await context.setOffline(true)
  await page.reload({ waitUntil: 'domcontentloaded' })
  assert.equal(await page.locator('h1').textContent(), 'Block API requests to the wrong environment')
  await context.setOffline(false)
  await context.close()

  console.log(JSON.stringify({ url: baseUrl.href, results, offlineReload: true }, null, 2))
} finally {
  await browser.close()
}
