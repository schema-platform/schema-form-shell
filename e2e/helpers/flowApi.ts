import { expect, type APIRequestContext } from '@playwright/test'

export const API_URL = process.env.API_URL ?? 'http://127.0.0.1:3001'
export const SHELL_BASE = (process.env.SHELL_URL ?? 'http://localhost:5050/schema-platform').replace(/\/$/, '')
export const ADMIN = { username: 'admin', password: 'admin123456' }

export async function login(request: APIRequestContext): Promise<string> {
  const res = await request.post(`${API_URL}/api/auth/login`, { data: ADMIN })
  expect(res.ok()).toBeTruthy()
  const body = await res.json()
  return body.data.accessToken as string
}

export function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` }
}

/** 从 /api/schemas 分页或 HR 专用接口解析 formSchemaId */
export async function resolveSchemaIdByCode(
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

  for (let page = 1; page <= 5; page++) {
    const res = await request.get(`${API_URL}/api/schemas?page=${page}&pageSize=100`, {
      headers: authHeaders(token),
    })
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    const item = body.data.items.find((s: { code?: string }) => s.code === code)
    if (item?.id) return item.id as string
    if (page >= body.data.totalPages) break
  }
  throw new Error(`schema code ${code} not found`)
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
  timeoutMs = 10_000,
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

export async function approvePendingTasksForInstance(
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

export async function expectLedgerCompleted(
  request: APIRequestContext,
  token: string,
  schemaId: string,
  submissionId: string,
  timeoutMs = 15_000,
) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    const listRes = await request.get(
      `${API_URL}/api/submissions/${schemaId}?page=1&pageSize=50`,
      { headers: authHeaders(token) },
    )
    expect(listRes.ok()).toBeTruthy()
    const list = await listRes.json()
    const row = list.data.items.find((i: { id: string }) => i.id === submissionId)
    expect(row, `submission ${submissionId} not in ledger`).toBeDefined()
    if (row.flowStatus === 'completed') return
    await new Promise((r) => setTimeout(r, 500))
  }
  const listRes = await request.get(
    `${API_URL}/api/submissions/${schemaId}?page=1&pageSize=50`,
    { headers: authHeaders(token) },
  )
  const list = await listRes.json()
  const row = list.data.items.find((i: { id: string }) => i.id === submissionId)
  expect(row?.flowStatus).toBe('completed')
}
