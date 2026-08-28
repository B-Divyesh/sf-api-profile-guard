import AxeBuilder from '@axe-core/playwright'
import { expect, test } from 'playwright/test'

test('home is accessible and has no console errors', async ({ page }) => {
  const errors = []
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  await page.goto('/')
  await expect(page).toHaveTitle(/API Profile Guard/)
  await expect(page.locator('main')).toHaveCount(1)
  await expect(page.locator('h1')).toHaveCount(1)
  await expect(page.locator('img:not([alt])')).toHaveCount(0)
  const scan = await new AxeBuilder({ page }).analyze()
  expect(scan.violations.filter(({ impact }) => ['serious', 'critical'].includes(impact))).toEqual([])
  expect(errors).toEqual([])
  await expect(page.locator('#install-command')).toHaveText(
    'cargo install --git https://github.com/B-Divyesh/sf-api-profile-guard.git --locked api-profile-guard'
  )

  const footerTargets = await page.locator('footer nav a').evaluateAll((links) =>
    links.map((link) => ({ text: link.textContent.trim(), ...link.getBoundingClientRect().toJSON() }))
  )
  for (const target of footerTargets) {
    expect(target.width, `${target.text} width`).toBeGreaterThanOrEqual(44)
    expect(target.height, `${target.text} height`).toBeGreaterThanOrEqual(44)
  }
})

test('every route has complete metadata, common navigation, and no serious accessibility findings', async ({ page }) => {
  const routes = [
    ['/', 'API Profile Guard — block wrong-environment requests'],
    ['/demo/', 'Demo — API Profile Guard'],
    ['/privacy/', 'Privacy — API Profile Guard'],
    ['/terms/', 'Terms — API Profile Guard'],
    ['/404.html', 'Page not found — API Profile Guard']
  ]
  for (const [path, title] of routes) {
    await page.goto(path)
    await expect(page).toHaveTitle(title)
    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page.locator('main')).toHaveCount(1)
    await expect(page.locator('header nav')).toHaveCount(1)
    await expect(page.locator('footer')).toHaveCount(1)
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1)
    await expect(page.locator('meta[property="og:title"]')).toHaveCount(1)
    await expect(page.locator('meta[name="twitter:card"]')).toHaveCount(1)
    await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveCount(1)
    const scan = await new AxeBuilder({ page }).analyze()
    expect(scan.violations.filter(({ impact }) => ['serious', 'critical'].includes(impact)), path).toEqual([])
  }
})

test('internal page navigation moves focus to the new heading', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Privacy', exact: true }).first().click()
  await expect(page).toHaveURL(/\/privacy\/$/)
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused()

  await page.goBack()
  await expect(page.getByRole('heading', { level: 1, name: 'Block API requests to the wrong environment' })).toBeFocused()

  await page.goto('/?demo=1#simulator')
  await page.getByRole('link', { name: 'Privacy', exact: true }).first().click()
  await expect(page.getByRole('heading', { level: 1, name: 'Privacy for local API checks' })).toBeFocused()
})

test('first-screen sample action opens the recorded CLI demo in one click', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Try it with sample data' }).click()
  await expect(page).toHaveURL(/\?demo=1#cli-demo$/)
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible()
  await expect(page.getByRole('heading', { level: 2, name: 'Run the bundled CLI sample' })).toBeFocused()
  await expect(page.getByRole('heading', { level: 2, name: 'Run the bundled CLI sample' })).toBeInViewport()
  const transcript = page.getByLabel('Terminal recording of the bundled CLI demo')
  await expect(transcript).toContainText('wrong production host')
  await expect(transcript).toContainText('POST wrong.example/v1/orders')
  await expect(transcript).toContainText('POST api.example.com/v1/orders')
  await expect(transcript).toContainText('credential class: live-sample')
  await expect(transcript.getByText('✕ BLOCKED')).toBeInViewport()
  await expect(transcript.getByText('✓ ALLOWED')).toBeInViewport()
  const fingerprints = await transcript.evaluate((element) =>
    [...element.textContent.matchAll(/production · ([A-F0-9]{12})/g)].map((match) => match[1])
  )
  expect(fingerprints).toHaveLength(2)
  expect(new Set(fingerprints).size).toBe(2)
  await page.getByRole('button', { name: 'Reset demo' }).click()
  await expect(page.getByRole('heading', { level: 2, name: 'Check a request in your browser' })).toBeFocused()
  await expect(page.locator('#result-stamp')).toHaveText('✕ BLOCKED')
})

test('simulator exposes allowed, blocked, and input-error states by keyboard', async ({ page }) => {
  await page.goto('/#simulator')
  const profile = page.getByLabel('Environment', { exact: true })
  await profile.selectOption('production')
  await page.getByLabel('Method').selectOption('POST')
  await page.getByLabel('URL or path').fill('/v1/orders')
  await page.getByLabel('Production confirmation phrase').fill('production')
  await page.getByRole('button', { name: 'Check request' }).focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('#result-stamp')).toHaveText('✓ ALLOWED')

  await page.getByLabel('URL or path').fill('https://wrong.example/v1/orders')
  await page.getByRole('button', { name: 'Check request' }).click()
  await expect(page.locator('#result-stamp')).toHaveText('✕ BLOCKED')
  await expect(page.getByText(/not allowed for production/)).toBeVisible()

  await page.getByLabel('URL or path').fill('mailto:test@example.com')
  await page.getByRole('button', { name: 'Check request' }).click()
  await expect(page.getByText('! INPUT ERROR')).toBeVisible()
})

test('mobile layout has no horizontal page overflow and legal pages render', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes('mobile'), 'mobile-only viewport assertion')
  for (const path of ['/', '/?demo=1', '/privacy/', '/terms/', '/404.html']) {
    await page.goto(path)
    const sizes = await page.evaluate(() => ({ width: document.documentElement.scrollWidth, viewport: innerWidth }))
    expect(sizes.width, path).toBeLessThanOrEqual(sizes.viewport)
    const undersized = await page.locator('a:visible, button:visible, input:visible, select:visible, [tabindex="0"]:visible').evaluateAll((items) =>
      items.map((item) => ({ name: item.getAttribute('aria-label') || item.textContent?.trim() || item.id, box: item.getBoundingClientRect().toJSON() }))
        .filter(({ box }) => box.width < 44 || box.height < 44)
    )
    expect(undersized, path).toEqual([])
  }
  await page.goto('/privacy/')
  await expect(page.getByRole('heading', { level: 1, name: 'Privacy for local API checks' })).toBeVisible()
  await page.goto('/terms/')
  await expect(page.getByRole('heading', { level: 1, name: 'Terms for using API Profile Guard' })).toBeVisible()
})

test('pages remain usable at 200 percent text size', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes('mobile'), 'mobile viewport is the constrained text-resize case')
  await page.goto('/?demo=1')
  await page.addStyleTag({ content: 'html { font-size: 200% !important; }' })
  const sizes = await page.evaluate(() => ({ width: document.documentElement.scrollWidth, viewport: innerWidth }))
  expect(sizes.width).toBeLessThanOrEqual(sizes.viewport)
  await expect(page.getByRole('button', { name: 'Reset demo' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Check request' })).toBeVisible()
})

test('offline reload remains usable and explains local availability', async ({ page, context }, testInfo) => {
  test.skip(testInfo.project.name.includes('mobile'), 'one offline smoke test is sufficient')
  await page.goto('/')
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready
    if (!navigator.serviceWorker.controller) {
      await new Promise((resolve) => navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true }))
    }
  })
  await context.setOffline(true)
  await page.evaluate(() => window.dispatchEvent(new Event('offline')))
  await expect(page.getByText(/Offline/)).toBeVisible()
  await page.reload({ waitUntil: 'domcontentloaded' })
  await expect(page).toHaveTitle(/API Profile Guard/)
  await expect(page.getByRole('heading', { level: 1, name: 'Block API requests to the wrong environment' })).toBeVisible()
  await context.setOffline(false)
})
