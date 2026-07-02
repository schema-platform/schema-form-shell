import { APIRequestContext, expect } from '@playwright/test'

export const API_URL = process.env.API_URL ?? 'http://127.0.0.1:3001'

export async function loginAdmin(request: APIRequestContext): Promise<string> {
  const res = await request.post(`${API_URL}/api/auth/login`, {
    data: { username: 'admin', password: 'admin123456' },
  })
  expect(res.ok()).toBeTruthy()
  const body = await res.json()
  expect(body.success).toBe(true)
  return body.data.accessToken as string
}

export function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` }
}

export async function getLeaveApplySchemaId(request: APIRequestContext, token: string): Promise<string> {
  const res = await request.get(`${API_URL}/api/business/hr/leave/schemas`, {
    headers: authHeaders(token),
  })
  expect(res.ok()).toBeTruthy()
  const body = await res.json()
  const apply = body.data.schemas.find((s: { code: string }) => s.code === 'hr-leave-apply')
  expect(apply?.formSchemaId).toBeTruthy()
  return apply.formSchemaId as string
}

/** Poll leave detail until flowInstanceId is set (webhook async). */
export async function waitForLeaveFlow(
  request: APIRequestContext,
  token: string,
  recordId: string,
  timeoutMs = 15_000,
) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    const res = await request.get(
      `${API_URL}/api/business/hr/leave/detail?recordId=${recordId}`,
      { headers: authHeaders(token) },
    )
    if (res.ok()) {
      const body = await res.json()
      if (body.data?.flowInstanceId) return body.data as Record<string, unknown>
    }
    await new Promise((r) => setTimeout(r, 500))
  }
  throw new Error(`Leave flow not started for record ${recordId} within ${timeoutMs}ms`)
}
