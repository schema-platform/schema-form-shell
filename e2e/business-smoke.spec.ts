/**
 * E2E — 登录 → 工作台 → API 冒烟（请假/报销路径）
 *
 * 运行：
 *   E2E_ENABLED=1 pnpm test:e2e
 */
import { test, expect } from '@playwright/test'

const API_URL = process.env.API_URL ?? 'http://127.0.0.1:3001'
const SHELL_BASE = (process.env.SHELL_URL ?? 'http://localhost:5050/schema-platform').replace(/\/$/, '')

test.describe('business platform smoke', () => {
  test('health check', async ({ request }) => {
    const res = await request.get(`${API_URL}/api/health`)
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    expect(body.success).toBe(true)
  })

  test('admin login API returns accessToken', async ({ request }) => {
    const res = await request.post(`${API_URL}/api/auth/login`, {
      data: { username: 'admin', password: 'admin123456' },
    })
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.data.accessToken).toBeTruthy()
  })

  test('dashboard API with auth', async ({ request }) => {
    const login = await request.post(`${API_URL}/api/auth/login`, {
      data: { username: 'admin', password: 'admin123456' },
    })
    const { data } = await login.json()
    const res = await request.get(`${API_URL}/api/dashboard`, {
      headers: { Authorization: `Bearer ${data.accessToken}` },
    })
    expect(res.ok()).toBeTruthy()
    const dash = await res.json()
    expect(dash.data.kpis).toBeDefined()
  })
})

test.describe('shell UI', () => {
  test.skip(!process.env.E2E_ENABLED, 'Set E2E_ENABLED=1 with shell running on :5050')

  test('login page loads', async ({ page }) => {
    await page.goto(`${SHELL_BASE}/login`)
    await expect(page.getByPlaceholder('用户名')).toBeVisible({ timeout: 10000 })
  })

  test('admin can login', async ({ page }) => {
    await page.goto(`${SHELL_BASE}/login`)
    await page.getByPlaceholder('用户名').fill('admin')
    await page.getByPlaceholder('密码').fill('admin123456')
    await page.getByRole('button', { name: /登录/ }).click()
    await page.waitForURL(/\/(schema-platform\/)?$|dashboard|workbench/, { timeout: 15000 })
  })
})
