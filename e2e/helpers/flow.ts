import { APIRequestContext, expect } from '@playwright/test'
import { API_URL, authHeaders, loginAdmin } from './api'

export { loginAdmin, authHeaders, API_URL }

export async function getSchemaIdByCode(
  request: APIRequestContext,
  token: string,
  code: string,
): Promise<string> {
  if (code.startsWith('hr-leave-')) {
    const res = await request.get(`${API_URL}/api/business/hr/leave/schemas`, {
      headers: authHeaders(token),
    })
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    const entry = body.data.schemas.find((s: { code: string }) => s.code === code)
    if (entry?.formSchemaId) return entry.formSchemaId as string
  }

  for (let page = 1; page <= 20; page++) {
    const res = await request.get(`${API_URL}/api/schemas?page=${page}&pageSize=100`, {
      headers: authHeaders(token),
    })
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    const items = body.data.items as Array<{ id: string; code?: string | null }>
    const found = items.find((s) => s.code === code)
    if (found?.id) return found.id
    if (items.length < 100) break
  }
  throw new Error(`Schema not found for code: ${code}`)
}

export async function submitForm(
  request: APIRequestContext,
  token: string,
  schemaId: string,
  data: Record<string, unknown>,
): Promise<string> {
  const res = await request.post(`${API_URL}/api/submissions/${schemaId}`, {
    headers: authHeaders(token),
    data: { data },
  })
  expect(res.status()).toBe(201)
  const body = await res.json()
  const id = body.data.id ?? body.data._id
  expect(id).toBeTruthy()
  return id as string
}

export async function waitForFlowInstance(
  request: APIRequestContext,
  token: string,
  schemaId: string,
  submissionId: string,
  timeoutMs = 12_000,
): Promise<string> {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    const res = await request.get(
      `${API_URL}/api/submissions/${schemaId}?page=1&pageSize=50`,
      { headers: authHeaders(token) },
    )
    const body = await res.json()
    const item = body.data.items.find((i: { id: string }) => i.id === submissionId)
    if (item?.flowInstanceId) return item.flowInstanceId as string
    await new Promise((r) => setTimeout(r, 400))
  }
  throw new Error(`flowInstanceId not set for submission ${submissionId}`)
}

export async function approveAllTasksForInstance(
  request: APIRequestContext,
  token: string,
  instanceId: string,
  maxRounds = 8,
) {
  for (let round = 0; round < maxRounds; round++) {
    const res = await request.get(`${API_URL}/api/flow-tasks/my?status=pending&pageSize=50`, {
      headers: authHeaders(token),
    })
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    const tasks = (body.data.items as Array<{ id: string; instanceId: string }>).filter(
      (t) => t.instanceId === instanceId,
    )
    if (tasks.length === 0) return
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
    await new Promise((r) => setTimeout(r, 600))
  }
  throw new Error(`Flow instance ${instanceId} still has pending tasks after ${maxRounds} rounds`)
}

export async function assertSubmissionCompleted(
  request: APIRequestContext,
  token: string,
  schemaId: string,
  submissionId: string,
) {
  const detailRes = await request.get(`${API_URL}/api/submissions/record/${submissionId}/view`, {
    headers: authHeaders(token),
  })
  expect(detailRes.ok()).toBeTruthy()
  const detail = await detailRes.json()
  expect(detail.data.flowStatus).toMatch(/已完成|completed/i)

  const listRes = await request.get(
    `${API_URL}/api/submissions/${schemaId}?page=1&pageSize=50`,
    { headers: authHeaders(token) },
  )
  expect(listRes.ok()).toBeTruthy()
  const list = await listRes.json()
  const row = list.data.items.find((i: { id: string }) => i.id === submissionId)
  expect(row).toBeDefined()
  expect(row.flowStatus).toBe('completed')
}
