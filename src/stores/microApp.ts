/**
 * Micro-app store
 *
 * 子应用注册策略：
 * 1. 服务端配置为主（/api/micro-apps），包含 activeRule、url、layout 等完整信息
 * 2. 开发环境用 DEV_ENTRIES 覆盖 entry（localhost:port）
 * 3. 统一向子应用下发通信 props
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { registerMicroApps } from 'qiankun'
import { APP_CONFIGS } from '@schema-platform/platform-shared/qiankun/config'
import { shellLog, qiankunLog } from '@schema-platform/platform-shared/utils/logger'
import { fetchActiveMicroApps, type MicroAppConfig } from '@/api/microAppApi'
import { createSubAppProps, type SubAppProps } from '@/composables/useSubAppProps'

const BASE_PATH = APP_CONFIGS.shell.basePath

// ── 开发环境子应用入口 ──

const DEV_ENTRIES: Record<string, string> = {
  editor: import.meta.env.VITE_EDITOR_ENTRY,
  flow: import.meta.env.VITE_FLOW_ENTRY,
  ai: import.meta.env.VITE_AI_ENTRY,
}

// ── 全局状态 actions（由 main.ts 注入） ──

let globalStateActions: {
  onGlobalStateChange: (callback: (state: Record<string, unknown>, prev: Record<string, unknown>) => void) => void
  setGlobalState: (state: Record<string, unknown>) => void
} | null = null

export function setGlobalStateActions(actions: typeof globalStateActions): void {
  globalStateActions = actions
}

// ── Store ──

export const useMicroAppStore = defineStore('microApp', () => {
  const apps = ref<MicroAppConfig[]>([])
  const registered = ref(false)
  const error = ref<string | null>(null)

  /** 全部子应用（服务端配置） */
  const allApps = computed(() =>
    [...apps.value].sort((a, b) => a.sort - b.sort),
  )

  /** with-menu 布局的子应用 */
  const withMenuApps = computed(() =>
    allApps.value.filter(a => a.layout === 'with-menu'),
  )

  /** without-menu 布局的子应用 */
  const standaloneApps = computed(() =>
    allApps.value.filter(a => a.layout === 'without-menu'),
  )

  /** 获取子应用 entry：开发环境用 DEV_ENTRIES，生产环境用服务端 url */
  function getEntry(app: MicroAppConfig): string {
    if (import.meta.env.DEV && DEV_ENTRIES[app.name]) {
      return DEV_ENTRIES[app.name]
    }
    return app.url
  }

  /**
   * 构建 activeRule 函数
   *
   * 服务端 activeRule 可能是：
   * - 数组: ['/standalone/editor', '/app/editor']
   * - 逗号分隔字符串: '/standalone/editor,/app/editor'
   * - 单个字符串: '/standalone/editor'
   *
   * 需要加上 BASE_PATH 前缀才能匹配 location.pathname。
   */
  function buildActiveRule(
    activeRule: string | string[],
  ): (location: Location) => boolean {
    const raw = Array.isArray(activeRule)
      ? activeRule
      : activeRule.split(',').map(s => s.trim()).filter(Boolean)
    const rules = raw.map(r => r.startsWith(BASE_PATH) ? r : `${BASE_PATH.replace(/\/$/, '')}${r}`)
    return (location: Location) => rules.some(r => location.pathname.startsWith(r))
  }

  /** 构建子应用 props */
  function buildProps(appName: string): SubAppProps {
    if (!globalStateActions) {
      throw new Error('[microApp] globalStateActions not injected. Call setGlobalStateActions() in main.ts first.')
    }
    return createSubAppProps(appName, globalStateActions)
  }

  /** 从服务端拉取配置并注册到 qiankun */
  async function fetchApps(): Promise<void> {
    const t0 = performance.now()
    shellLog.info('fetchApps: start')
    try {
      error.value = null
      const serverApps = await fetchActiveMicroApps()
      shellLog.perf('fetchApps', `${Math.round(performance.now() - t0)}ms`, `server returned ${serverApps.length} apps`)
      apps.value = serverApps

      // 按 activeRule 路径拆分注册：/app/* → #micro-container，/standalone/* → #standalone-container
      const rawRules = (r: string | string[]) =>
        Array.isArray(r) ? r : r.split(',').map(s => s.trim()).filter(Boolean)

      const registrations: ReturnType<typeof buildProps> extends never ? never : {
        name: string
        entry: string
        container: string
        activeRule: (location: Location) => boolean
        props: SubAppProps
      }[] = []

      for (const app of serverApps) {
        const entry = getEntry(app)
        const allRules = rawRules(app.activeRule)
        const appRules = allRules.filter(r => r.includes('/app/'))
        const standaloneRules = allRules.filter(r => r.includes('/standalone/'))
        const otherRules = allRules.filter(r => !r.includes('/app/') && !r.includes('/standalone/'))

        if (appRules.length > 0) {
          const container = '#micro-container'
          shellLog.info(`→ ${app.name} (app): entry=${entry}, activeRule=${appRules}, container=${container}`)
          registrations.push({
            name: app.name,
            entry,
            container,
            activeRule: buildActiveRule(appRules),
            props: buildProps(app.name),
          })
        }

        if (standaloneRules.length > 0) {
          const container = '#standalone-container'
          shellLog.info(`→ ${app.name} (standalone): entry=${entry}, activeRule=${standaloneRules}, container=${container}`)
          registrations.push({
            name: `${app.name}-standalone`,
            entry,
            container,
            activeRule: buildActiveRule(standaloneRules),
            props: buildProps(app.name),
          })
        }

        if (otherRules.length > 0) {
          const container = app.layout === 'without-menu' ? '#standalone-container' : '#micro-container'
          shellLog.info(`→ ${app.name} (other): entry=${entry}, activeRule=${otherRules}, container=${container}`)
          registrations.push({
            name: app.name,
            entry,
            container,
            activeRule: buildActiveRule(otherRules),
            props: buildProps(app.name),
          })
        }
      }

      registerMicroApps(registrations, {
        beforeLoad: (app) => { qiankunLog.lifecycle('beforeLoad:', app.name); return Promise.resolve() },
        beforeMount: (app) => { qiankunLog.lifecycle('beforeMount:', app.name); return Promise.resolve() },
        afterMount: (app) => { qiankunLog.lifecycle('afterMount:', app.name); return Promise.resolve() },
        beforeUnmount: (app) => { qiankunLog.lifecycle('beforeUnmount:', app.name); return Promise.resolve() },
        afterUnmount: (app) => { qiankunLog.lifecycle('afterUnmount:', app.name); return Promise.resolve() },
      })
      registered.value = true
      shellLog.perf('registered', `${registrations.length} apps`, `${Math.round(performance.now() - t0)}ms total`)
      // start() 不在这里调用，由 layout 的 onMounted 调用，确保 #micro-container 已存在于 DOM
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : '加载子应用配置失败'
      shellLog.error('fetchApps failed:', error.value, err)
    }
  }

  function getApp(name: string): MicroAppConfig | undefined {
    return allApps.value.find(a => a.name === name)
  }

  return {
    apps,
    allApps,
    withMenuApps,
    standaloneApps,
    registered,
    error,
    fetchApps,
    getApp,
  }
})
