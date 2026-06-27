/**
 * Shell main entry
 *
 * Initializes:
 * 1. Vue app with Pinia + Router + Element Plus
 * 2. Qiankun global state (token sync)
 * 3. Restore user session (fetchUser if token exists)
 * 4. Fetches micro-app configs from backend (registers with qiankun)
 *
 * Qiankun start() is called by layout containers on mounted.
 */
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import 'element-plus/dist/index.css'
import '@schema-form/platform-shared/styles/theme.scss'
import '@schema-form/platform-shared/styles/css-variables.scss'
import { initGlobalState } from 'qiankun'
import { useAuthStore } from '@/stores/auth'
import { useMicroAppStore } from '@/stores/microApp'
import { setupElementPlus } from '@schema-form/platform-shared/config/element'
import { fetchCurrentUser } from '@/api/authApi'
import { setTokenProvider, setUnauthorizedHandler } from '@schema-form/platform-shared/utils/apiClient'
import { cancelAutoRefresh } from '@/composables/useAuth'

import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)
setupElementPlus(app)
app.mount('#app')

// Initialize qiankun global state (token sync)
const initialState = { token: localStorage.getItem('sfp_access_token') || '' }
const actions = initGlobalState(initialState)

const authStore = useAuthStore()
authStore.$subscribe((_mutation, state) => {
  actions.setGlobalState({ token: state.token || '' })
})

// 注入 tokenProvider + 401 handler
setTokenProvider(() => authStore.token)
setUnauthorizedHandler(() => {
  cancelAutoRefresh()
  authStore.reset()
  router.push('/login')
})

// 恢复用户会话
async function restoreSession(): Promise<void> {
  if (!authStore.token || authStore.user) return
  try {
    const user = await fetchCurrentUser()
    authStore.setUser(user)
  } catch {
    // token 无效，apiClient 401 拦截器会自动清除状态并跳转登录
  }
}

// 并行恢复会话和加载微应用配置（注册到 qiankun）
const microAppStore = useMicroAppStore()

Promise.all([
  restoreSession(),
  microAppStore.fetchApps().catch((err: unknown) => {
    console.error('[shell] Failed to fetch micro-app configs:', err)
  }),
])
