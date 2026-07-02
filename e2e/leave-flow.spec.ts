/**
 * E2E — 登录 → 请假提交 → 审批 → 台账
 *
 * API 全流程（无需浏览器）：
 *   pnpm exec playwright test e2e/leave-flow.spec.ts --grep "API"
 *
 * UI 冒烟（需 shell :5050）：
 *   E2E_ENABLED=1 pnpm exec playwright test e2e/leave-flow.spec.ts --grep "UI"
 */
import { test, expect, type APIRequestContext } from '@playwright/test'

const API_URL = process.env.API_URL ?? 'http://127.0.0.1:3001'
const SHELL_BASE = (process.env.SHELL_URL ?? 'http://localhost:5050/schema-platform').replace(/\/$/, '')
const ADMIN = { username: 'admin', password: 'admin123456' }

async function login(request: APIRequestContext): Promise<string> {
  const res = await request.post(`${API_URL}/api/auth/login`, { data: ADMIN })
  expect(res.ok()).toBeTruthy()
  const body = await res.json()
  return body.data.accessToken as string
}

async function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` }
}

async function getLeaveApplySchemaId(request: APIRequestContext, token: string): Promise<string> {
  const res = await request.get(`${API_URL}/api/business/hr/leave/schemas`, {
    headers: authHeaders(token),
  })
  expect(res.ok()).toBeTruthy()
  const body = await res.json()
  const entry = body.data.schemas.find((s: { code: string }) => s.code === 'hr-leave-apply')
  expect(entry?.formSchemaId).toBeTruthy()
  return entry.formSchemaId as string
}

async function submitLeave(
  request: APIRequestContext,
  token: string,
  schemaId: string,
  reason: string,
): Promise<string> {
  const res = await request.post(`${API_URL}/api/submissions/${schemaId}`, {
    headers: authHeaders(token),
    data: {
      data: {
        leaveType: 'annual',
        days: 1,
        startDate: '2026-07-15',
        endDate: '2026-07-15',
        reason,
      },
    },
  })
  expect(res.status()).toBe(201)
  const body = await res.json()
  const id = body.data.id ?? body.data._id
  expect(id).toBeTruthy()
  return id as string
}

async function waitForFlowInstance(
  request: APIRequestContext,
  token: string,
  schemaId: string,
  submissionId: string,
  timeoutMs = 8000,
): Promise<string> {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    const res = await request.get(
      `${API_URL}/api/submissions/${schemaId}?page=1&pageSize=20`,
      { headers: authHeaders(token) },
    )
    const body = await res.json()
    const item = body.data.items.find((i: { id: string }) => i.id === submissionId)
    if (item?.flowInstanceId) return item.flowInstanceId as string
    await new Promise((r) => setTimeout(r, 400))
  }
  throw new Error(`flowInstanceId not set for submission ${submissionId}`)
}

async function approvePendingTasksForInstance(
  request: APIRequestContext,
  token: string,
  instanceId: string,
  timeoutMs = 30_000,
) {
  const deadline = Date.now() + timeoutMs
  let idleChecks = 0

  while (Date.now() < deadline) {
    const res = await request.get(`${API_URL}/api/flow-tasks/my?status=pending&pageSize=50`, {
      headers: authHeaders(token),
    })
    const body = await res.json()
    const tasks = (body.data.items as Array<{ id: string; instanceId: string }>).filter(
      (t) => t.instanceId === instanceId,
    )

    if (tasks.length === 0) {
      idleChecks += 1
      if (idleChecks >= 2) return
      await new Promise((r) => setTimeout(r, 600))
      continue
    }

    idleChecks = 0
    for (const task of tasks) {
      await request.post(`${API_URL}/api/flow-tasks/${task.id}/claim`, {
        headers: authHeaders(token),
      })
      const complete = await request.post(`${API_URL}/api/flow-tasks/${task.id}/complete`, {
        headers: authHeaders(token),
        data: { outcome: 'approve', comment: 'E2E auto approve' },
      })
      expect(complete.ok()).toBeTruthy()
    }
    await new Promise((r) => setTimeout(r, 800))
  }

  throw new Error(`Timed out approving tasks for instance ${instanceId}`)
}

test.describe('leave flow API', () => {
  test('submit → dept+HR approve → ledger shows completed', async ({ request }) => {
    const token = await login(request)
    const schemaId = await getLeaveApplySchemaId(request, token)
    const reason = `E2E leave ${Date.now()}`
    const submissionId = await submitLeave(request, token, schemaId, reason)
    const instanceId = await waitForFlowInstance(request, token, schemaId, submissionId)
    await approvePendingTasksForInstance(request, token, instanceId)

    const detailRes = await request.get(`${API_URL}/api/submissions/record/${submissionId}/view`, {
      headers: authHeaders(token),
    })
    expect(detailRes.ok()).toBeTruthy()
    const detail = await detailRes.json()
    expect(detail.data.reason).toBe(reason)
    expect(detail.data.flowStatus).toBe('已完成')
    expect(detail.data.status).toBe('已通过')

    const listRes = await request.get(
      `${API_URL}/api/submissions/${schemaId}?page=1&pageSize=50`,
      { headers: authHeaders(token) },
    )
    const list = await listRes.json()
    const row = list.data.items.find((i: { id: string }) => i.id === submissionId)
    expect(row).toBeDefined()
    expect(row.flowStatus).toBe('completed')
  })

  test('health check API', async ({ request }) => {
    const res = await request.get(`${API_URL}/api/health`)
    expect(res.ok()).toBeTruthy()
  })
})

test.describe('leave flow UI', () => {
  test.skip(!process.env.E2E_ENABLED, 'Set E2E_ENABLED=1 with running shell+server')

  test('admin can login and open workbench', async ({ page }) => {
    await page.goto(`${SHELL_BASE}/login`)
    await page.getByPlaceholder('用户名').fill(ADMIN.username)
    await page.getByPlaceholder('密码').fill(ADMIN.password)
    await page.getByRole('button', { name: /登录/ }).click()
    await page.waitForURL(/\/(schema-platform\/)?$|dashboard|workbench/, { timeout: 15000 })
  })

  test('leave apply schema page loads from menu route', async ({ page, request }) => {
    const token = await login(request)
    const schemaId = await getLeaveApplySchemaId(request, token)

    await page.goto(`${SHELL_BASE}/login`)
    await page.getByPlaceholder('用户名').fill(ADMIN.username)
    await page.getByPlaceholder('密码').fill(ADMIN.password)
    await page.getByRole('button', { name: /登录/ }).click()
    await page.waitForURL(/\/(schema-platform\/)?$|dashboard|workbench/, { timeout: 15000 })

    await page.goto(`${SHELL_BASE}/app/editor/view/hr-leave-apply`)
    await expect(page.locator('body')).toBeVisible({ timeout: 15000 })
    expect(schemaId).toBeTruthy()
  })
})
