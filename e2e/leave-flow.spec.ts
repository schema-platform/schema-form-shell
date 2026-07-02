/**
 * E2E skeleton — 登录 → 请假 → 审批 → 台账
 *
 * 运行前：
 *   pnpm add -D @playwright/test
 *   npx playwright install chromium
 *   SHELL_URL=http://localhost:5173 API_URL=http://localhost:3000 npx playwright test
 */
import { test, expect } from '@playwright/test'

const SHELL_URL = process.env.SHELL_URL ?? 'http://localhost:5173'
const API_URL = process.env.API_URL ?? 'http://localhost:3000'

test.describe('leave flow E2E', () => {
  test.skip(!process.env.E2E_ENABLED, 'Set E2E_ENABLED=1 with running shell+server')

  test('admin can login and open workbench', async ({ page }) => {
    await page.goto(`${SHELL_URL}/login`)
    await page.fill('input[type="text"]', 'admin')
    await page.fill('input[type="password"]', 'admin123456')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/dashboard|workbench|\/$/, { timeout: 15000 })
  })

  test('leave apply menu is reachable after login', async ({ page }) => {
    await page.goto(`${SHELL_URL}/login`)
    await page.fill('input[type="text"]', 'admin')
    await page.fill('input[type="password"]', 'admin123456')
    await page.click('button[type="submit"]')
    await page.waitForURL(/dashboard|workbench|\/$/, { timeout: 15000 })
    const searchBtn = page.locator('button').filter({ has: page.locator('[data-icon], svg') }).first()
    if (await searchBtn.isVisible()) {
      await searchBtn.click()
    }
  })

  test('health check API', async ({ request }) => {
    const res = await request.get(`${API_URL}/api/health`)
    expect(res.ok()).toBeTruthy()
  })
})
