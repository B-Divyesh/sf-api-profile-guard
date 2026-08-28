import assert from 'node:assert/strict'
import AxeBuilder from '@axe-core/playwright'
import { chromium } from 'playwright'

const baseUrl = new URL(process.argv[2] || 'https://api-profile-guard.sociobot.in')
const browser = await chromium.launch()
const results = []

try {
  for (const [name, viewport] of [
    ['desktop', { width: 1440, height: 900 }],
    ['mobile', { width: 390, height: 844 }]
  ]) {
    const context = await browser.newContext({ viewport })
    const page = await context.newPage()
    const errors = []
    const requestOrigins = new Set()
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text())
    })
    page.on('pageerror', (error) => errors.push(String(error)))
    page.on('request', (request) => requestOrigins.add(new URL(request.url()).origin))

    for (const path of ['/', '/demo/', '/privacy/', '/terms/']) {
      const response = await page.goto(new URL(path, baseUrl).href, { waitUntil: 'networkidle' })
      assert.equal(response.status(), 200, `${name} ${path} status`)
      const serious = (await new AxeBuilder({ page }).analyze()).violations.filter(({ impact }) =>
        ['serious', 'critical'].includes(impact)
      )
      assert.deepEqual(serious, [], `${name} ${path} axe`)
    }

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

    const footerSizes = await page.locator('footer nav a').evaluateAll((links) =>
      links.map((link) => {
        const box = link.getBoundingClientRect()
        return { text: link.textContent.trim(), width: box.width, height: box.height }
      })
    )
    assert.equal(footerSizes.every(({ width, height }) => width >= 44 && height >= 44), true)

    await page.locator('body').press('Home')
    await page.keyboard.press('Tab')
    assert.equal(await page.evaluate(() => document.activeElement.classList.contains('skip-link')), true)
    assert.equal(await page.evaluate(() => getComputedStyle(document.activeElement).outlineWidth), '3px')

    await page.emulateMedia({ reducedMotion: 'reduce' })
    assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior), 'auto')

    results.push({ name, errors: errors.length, footerSizes })
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
