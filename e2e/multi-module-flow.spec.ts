/**
 * E2E — 多模块 API 全流程：填表 → 审批 → 台账
 *
 * HR 请假 / OA 出差 / 财务报销
 *
 * 运行：
 *   API_URL=http://127.0.0.1:3001 pnpm exec playwright test e2e/multi-module-flow.spec.ts --grep "API"
 *
 * UI 冒烟（需 shell :5050）：
 *   E2E_ENABLED=1 pnpm exec playwright test e2e/multi-module-flow.spec.ts --grep "UI"
 */
import { test, expect } from '@playwright/test'
import {
  ADMIN,
  API_URL,
  SHELL_BASE,
  approvePendingTasksForInstance,
  expectLedgerCompleted,
  login,
  resolveSchemaIdByCode,
  submitForm,
  waitForFlowInstance,
} from './helpers/flowApi'

async function runSubmitApproveLedger(
  request: import('@playwright/test').APIRequestContext,
  schemaCode: string,
  formData: Record<string, unknown>,
) {
  const token = await login(request)
  const schemaId = await resolveSchemaIdByCode(request, token, schemaCode)
  const submissionId = await submitForm(request, token, schemaId, formData)
  const instanceId = await waitForFlowInstance(request, token, schemaId, submissionId)
  await approvePendingTasksForInstance(request, token, instanceId)
  await expectLedgerCompleted(request, token, schemaId, submissionId)
  return { schemaId, submissionId }
}

test.describe('multi-module flow API', () => {
  test('HR leave: submit → approve → ledger', async ({ request }) => {
    const token = await login(request)
    const schemaId = await resolveSchemaIdByCode(request, token, 'hr-leave-apply')
    const reason = `E2E leave ${Date.now()}`
    const submissionId = await submitForm(request, token, schemaId, {
      leaveType: 'annual',
      days: 1,
      startDate: '2026-07-15',
      endDate: '2026-07-15',
      reason,
    })
    const instanceId = await waitForFlowInstance(request, token, schemaId, submissionId)
    await approvePendingTasksForInstance(request, token, instanceId)

    const detailRes = await request.get(
      `${API_URL}/api/submissions/record/${submissionId}/view`,
      { headers: { Authorization: `Bearer ${token}` } },
    )
    expect(detailRes.ok()).toBeTruthy()
    const detail = await detailRes.json()
    expect(detail.data.reason).toBe(reason)
    expect(detail.data.flowStatus).toBe('已完成')

    await expectLedgerCompleted(request, token, schemaId, submissionId)
  })

  test('OA trip: submit → dept approve → ledger', async ({ request }) => {
    await runSubmitApproveLedger(request, 'oa-trip-apply', {
      title: `E2E trip ${Date.now()}`,
      destination: '上海',
      startDate: '2026-07-20',
      endDate: '2026-07-22',
      transport: 'train',
      budgetAmount: 1500,
      reason: 'E2E 出差验收',
    })
  })

  test('Finance expense: submit → manager+finance → ledger', async ({ request }) => {
    await runSubmitApproveLedger(request, 'fin-expense-apply', {
      title: `E2E expense ${Date.now()}`,
      expenseType: 'travel',
      items: [{ name: '交通费', amount: 200 }],
      totalAmount: 200,
    })
  })

  test('Finance purchase: submit → approve → ledger', async ({ request }) => {
    await runSubmitApproveLedger(request, 'fin-purchase-apply', {
      title: `E2E purchase ${Date.now()}`,
      supplier: '测试供应商',
      urgency: 'normal',
      items: [{ name: '办公用品', qty: 2, unitPrice: 100, amount: 200 }],
      totalAmount: 200,
    })
  })
})

test.describe('multi-module flow UI', () => {
  test.skip(!process.env.E2E_ENABLED, 'Set E2E_ENABLED=1 with running shell+server')

  test('schema pages load for HR / OA / Finance', async ({ page, request }) => {
    const token = await login(request)
    for (const code of ['hr-leave-apply', 'oa-trip-apply', 'fin-expense-apply']) {
      await resolveSchemaIdByCode(request, token, code)
    }

    await page.goto(`${SHELL_BASE}/login`)
    await page.getByPlaceholder('用户名').fill(ADMIN.username)
    await page.getByPlaceholder('密码').fill(ADMIN.password)
    await page.getByRole('button', { name: /登录/ }).click()
    await page.waitForURL(/\/(schema-platform\/)?$|dashboard|workbench/, { timeout: 15000 })

    for (const code of ['hr-leave-apply', 'oa-trip-apply', 'fin-expense-apply']) {
      await page.goto(`${SHELL_BASE}/app/editor/view/${code}`)
      await expect(page.locator('body')).toBeVisible({ timeout: 15000 })
    }
  })
})
