/**
 * useAuth -- shell 认证业务逻辑
 *
 * 基于 platform-shared 的 useAuthStore，添加：
 * - SSO 登录（ssoToken API）
 * - 与 shell router 的跳转集成
 * - 401 handler 中 router.push('/login')
 *
 * ⚠️ 不再调用 setTokenProvider / setUnauthorizedHandler
 *    由 platform-shared 的 useAuth() 在 LoginView 挂载时自动注入。
 *    shell 的 main.ts 中的 tokenProvider 设置已移除，避免被覆盖。
 */
import { onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { login as apiLogin, fetchCurrentUser, refreshToken as apiRefreshToken, ssoToken, logout as apiLogout } from '@/api/authApi'
import type { LoginPayload } from '@schema-form/business-shared/utils/authTypes'

/** Auto-refresh timer handle */
let refreshTimer: ReturnType<typeof setTimeout> | null = null

/** Cancel pending auto-refresh (exported for 401 handler in main.ts) */
export function cancelAutoRefresh(): void {
  if (refreshTimer) {
    clearTimeout(refreshTimer)
    refreshTimer = null
  }
}

export function useAuth() {
  const store = useAuthStore()
  const router = useRouter()
  const route = useRoute()
  const { user, accessToken: token, refreshToken, isAuthenticated, loading } = storeToRefs(store)

  /**
   * Schedule automatic token refresh 60s before expiry.
   * @param expiresIn - seconds until access token expires
   */
  function scheduleRefresh(expiresIn: number): void {
    cancelRefresh()
    // Refresh 60s before expiry, minimum 10s
    const delay = Math.max((expiresIn - 60) * 1000, 10_000)
    refreshTimer = setTimeout(() => {
      doRefresh()
    }, delay)
  }

  /** Cancel pending auto-refresh */
  function cancelRefresh(): void {
    cancelAutoRefresh()
  }

  /**
   * Exchange refresh token for a new access token.
   * Silently fails if refresh token is invalid (user will hit 401 on next request).
   */
  async function doRefresh(): Promise<void> {
    const rt = store.refreshToken
    if (!rt) return

    try {
      const res = await apiRefreshToken(rt)
      store.setTokens(res.accessToken)
      scheduleRefresh(res.expiresIn)
    } catch {
      // Refresh failed -- clear auth state, user must re-login
      cancelRefresh()
      store.reset()
    }
  }

  /**
   * SSO login: exchange authorization code for tokens.
   * On success: persist tokens + user, redirect to ?redirect= or /.
   */
  async function ssoLogin(code: string): Promise<void> {
    store.setLoading('login', true)
    try {
      const res = await ssoToken(code, 'shell', `${window.location.origin}/schema-platform/sso/callback`)
      store.setTokens(res.accessToken, res.refreshToken)
      // Fetch user info after getting token
      const userRes = await fetchCurrentUser()
      store.setUser(userRes)
      store.setUserKey(userRes.id)
      scheduleRefresh(res.expiresIn)
      const redirect = (route.query.redirect as string) || '/'
      await router.push(redirect)
    } finally {
      store.setLoading('login', false)
    }
  }

  /**
   * Username/password login.
   * On success: persist tokens + user, redirect to ?redirect= or /.
   */
  async function login(payload: LoginPayload): Promise<void> {
    store.setLoading('login', true)
    try {
      const res = await apiLogin(payload)
      store.setTokens(res.accessToken, res.refreshToken)
      store.setUser(res.user)
      store.setUserKey(res.user.id)
      scheduleRefresh(res.expiresIn)
      const redirect = (route.query.redirect as string) || '/'
      await router.push(redirect)
    } finally {
      store.setLoading('login', false)
    }
  }

  /**
   * Fetch current user by existing token.
   * Used to restore login state after page refresh.
   */
  async function fetchUser(): Promise<void> {
    if (!store.accessToken) return

    store.setLoading('fetchUser', true)
    try {
      const res = await fetchCurrentUser()
      store.setUser(res)
      // Re-schedule refresh (we don't know original expiresIn after page reload,
      // assume 15min = 900s from now as the token was issued at login)
      scheduleRefresh(900)
    } catch {
      // Token invalid -- clear state
      cancelRefresh()
      store.reset()
    } finally {
      store.setLoading('fetchUser', false)
    }
  }

  /**
   * Logout: call server, clear state, redirect to /login.
   */
  async function logout(): Promise<void> {
    cancelRefresh()
    try {
      await apiLogout()
    } finally {
      store.reset()
      await router.push('/login')
    }
  }

  // Cleanup on component unmount
  onUnmounted(() => {
    // Do NOT cancel refresh here -- it should persist across component mounts.
    // Only logout() and 401 handler cancel it.
  })

  return {
    // state (storeToRefs preserves reactivity)
    user,
    token,
    refreshToken,
    isAuthenticated,
    loading,
    // methods
    login,
    ssoLogin,
    fetchUser,
    logout,
    doRefresh,
  }
}
