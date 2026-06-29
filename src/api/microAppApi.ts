/**
 * Micro-app API client
 *
 * CRUD 操作 + 状态管理。
 * Used by useMicroAppStore to register qiankun micro-apps and render menus.
 */
import { apiClient } from '@schema-platform/platform-shared/utils/apiClient'

export interface MicroAppConfig {
  id: string
  name: string
  displayName: string
  url: string
  icon: string
  layout: 'with-menu' | 'without-menu'
  /** 激活规则：单路径或多路径 */
  activeRule: string | string[]
  permissions: string[]
  status: 'active' | 'inactive'
  sort: number
}

export interface MicroAppFormData {
  name: string
  displayName: string
  url: string
  icon: string
  layout: 'with-menu' | 'without-menu'
  activeRule: string | string[]
  permissions: string[]
  status: 'active' | 'inactive'
  sort: number
}

/** 获取所有活跃子应用 */
export async function fetchActiveMicroApps(): Promise<MicroAppConfig[]> {
  const res = await apiClient.get<{ items: MicroAppConfig[] }>('/micro-apps?status=active&pageSize=100')
  return res.items
}

/** 获取所有子应用（含停用） */
export async function fetchAllMicroApps(): Promise<MicroAppConfig[]> {
  const res = await apiClient.get<{ items: MicroAppConfig[] }>('/micro-apps?pageSize=100')
  return res.items
}

/** 创建子应用 */
export async function createMicroApp(data: MicroAppFormData): Promise<MicroAppConfig> {
  return apiClient.post<MicroAppConfig>('/micro-apps', data)
}

/** 更新子应用 */
export async function updateMicroApp(id: string, data: Partial<MicroAppFormData>): Promise<MicroAppConfig> {
  return apiClient.post<MicroAppConfig>(`/micro-apps/${id}`, data)
}

/** 删除子应用 */
export async function deleteMicroApp(id: string): Promise<void> {
  await apiClient.post(`/micro-apps/${id}/delete`)
}

/** 切换子应用状态（启用/停用） */
export async function toggleMicroAppStatus(id: string, status: 'active' | 'inactive'): Promise<MicroAppConfig> {
  return apiClient.post<MicroAppConfig>(`/micro-apps/${id}/toggle-status`, { status })
}
