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
})

test('simulator exposes allowed, blocked, and input-error states by keyboard', async ({ page }) => {
  await page.goto('/#simulator')
  const profile = page.getByLabel('Profile', { exact: true })
  await profile.selectOption('production')
  await page.getByLabel('Method').selectOption('POST')
  await page.getByLabel('URL or path').fill('/v1/orders')
  await page.getByLabel('Production phrase').fill('production')
  await page.getByRole('button', { name: 'Inspect request' }).focus()
  await page.keyboard.press('Enter')
  await expect(page.getByText('✓ ALLOWED')).toBeVisible()

  await page.getByLabel('URL or path').fill('https://wrong.example/v1/orders')
  await page.getByRole('button', { name: 'Inspect request' }).click()
  await expect(page.getByText('✕ BLOCKED')).toBeVisible()
  await expect(page.getByText(/not allowed for production/)).toBeVisible()

  await page.getByLabel('URL or path').fill('mailto:test@example.com')
  await page.getByRole('button', { name: 'Inspect request' }).click()
  await expect(page.getByText('! INPUT ERROR')).toBeVisible()
})

test('mobile layout has no horizontal page overflow and legal pages render', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes('mobile'), 'mobile-only viewport assertion')
  await page.goto('/')
  const sizes = await page.evaluate(() => ({ width: document.documentElement.scrollWidth, viewport: innerWidth }))
  expect(sizes.width).toBeLessThanOrEqual(sizes.viewport)
  await page.goto('/privacy/')
  await expect(page.getByRole('heading', { level: 1, name: 'Privacy' })).toBeVisible()
  await page.goto('/terms/')
  await expect(page.getByRole('heading', { level: 1, name: 'Terms' })).toBeVisible()
})

test('offline state explains that local tools remain available', async ({ page, context }, testInfo) => {
  test.skip(testInfo.project.name.includes('mobile'), 'one offline smoke test is sufficient')
  await page.goto('/')
  await context.setOffline(true)
  await page.evaluate(() => window.dispatchEvent(new Event('offline')))
  await expect(page.getByText(/Offline mode/)).toBeVisible()
  await context.setOffline(false)
})
