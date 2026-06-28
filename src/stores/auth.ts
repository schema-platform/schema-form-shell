/**
 * useAuthStore -- 统一使用 platform-shared 的认证 store
 *
 * 本地不再维护独立 store，避免与 platform-shared 的 useAuthStore（同名 'auth'）
 * 产生两套实例导致 token 状态不同步 → 路由守卫死循环。
 *
 * 字段映射：
 *   platform-shared: accessToken / refreshToken / userKey
 *   shell 旧代码:    token / refreshToken / userKey
 *
 * 兼容层：导出 token getter 供 shell 旧代码使用。
 */
export { useAuthStore } from '@schema-platform/platform-shared/utils/stores/authStore'

/**
 * 兼容 getter — 从 platform-shared store 读取 accessToken
 * 供 shell 中仍使用 `authStore.token` 的代码平滑迁移。
 */
import { useAuthStore as _useSharedAuthStore } from '@schema-platform/platform-shared/utils/stores/authStore'

/** 获取当前 token（兼容旧代码 authStore.token 的用法） */
export function getToken(): string | null {
  const store = _useSharedAuthStore()
  return store.accessToken
}
