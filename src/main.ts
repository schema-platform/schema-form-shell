/**
 * Shell main entry
 *
 * 初始化顺序：
 * 1. Vue app + Pinia + Router + Element Plus
 * 2. Qiankun global state（token 同步）
 * 3. 注入 401 handler（带 router.push）
 * 4. 恢复用户会话（fetchUser）
 * 5. 注册内置子应用（静态配置，立即可用）
 * 6. 启动 qiankun（registerBuiltin 后立即 start）
 * 7. 拉取服务端子应用配置（合并/覆盖）
 *
 * ⚠️ 认证 store 统一使用 platform-shared 的 useAuthStore（同名 'auth'）。
 *    不再维护本地 useAuthStore，避免两套实例导致 token 状态不同步。
 */
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import 'element-plus/dist/index.css'
import '@schema-platform/platform-shared/styles/theme.scss'
import '@schema-platform/platform-shared/styles/css-variables.scss'
import { initGlobalState, start } from 'qiankun'
import { useAuthStore } from '@schema-platform/platform-shared/utils/stores/authStore'
import { useMicroAppStore, setGlobalStateActions } from '@/stores/microApp'
import { setRouter } from '@/composables/useSubAppProps'
import { setupElementPlus } from '@schema-platform/platform-shared/config/element'
import { fetchCurrentUser } from '@/api/authApi'
import { setUnauthorizedHandler } from '@schema-platform/platform-shared/utils/apiClient'
import { cancelAutoRefresh } from '@/composables/useAuth'

import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)
setRouter(router)
setupElementPlus(app)
app.mount('#app')

// Initialize qiankun global state (token sync)
const initialState = { token: localStorage.getItem('sfp_access_token') || '' }
const actions = initGlobalState(initialState)

const authStore = useAuthStore()
authStore.$subscribe((_mutation, state) => {
  actions.setGlobalState({ token: state.accessToken || '' })
})

// 注入 401 handler — 必须在 LoginView 挂载之前设置
// platform-shared 的 useAuth() 也会调用 setUnauthorizedHandler，
// 但 apiClient 的 setUnauthorizedHandler 有 "if (!onUnauthorized)" 保护，
// 所以 shell 先设置的 handler 不会被覆盖。
setUnauthorizedHandler(() => {
  cancelAutoRefresh()
  authStore.reset()
  router.push('/login')
})

// 恢复用户会话
async function restoreSession(): Promise<void> {
  if (!authStore.accessToken || authStore.user) return
  try {
    const user = await fetchCurrentUser()
    authStore.setUser(user)
  } catch {
    // token 无效，apiClient 401 拦截器会自动清除状态并跳转登录
  }
}

// ── 子应用注册：内置立即注册 + 服务端拉取合并 ──

// 注入 globalState actions 到 microAppStore（用于子应用 props 下发）
setGlobalStateActions({
  onGlobalStateChange: (callback) => {
    actions.onGlobalStateChange(callback)
  },
  setGlobalState: (state) => {
    actions.setGlobalState(state)
  },
})

const microAppStore = useMicroAppStore()

// 1. 内置子应用立即注册（不依赖网络）
microAppStore.registerBuiltin()

// 2. 启动 qiankun
start({ sandbox: false })

// 3. 并行：恢复会话 + 拉取服务端配置
Promise.all([
  restoreSession(),
  microAppStore.fetchApps().catch((err: unknown) => {
    console.error('[shell] Failed to fetch micro-app configs:', err)
  }),
])
