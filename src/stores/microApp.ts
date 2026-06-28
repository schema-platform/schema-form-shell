/**
 * Micro-app store
 *
 * 子应用注册策略：
 * 1. BUILTIN_APPS：仅 qiankun 注册配置（entry + activeRule），不含显示属性
 * 2. fetchApps()：从后端拉取完整配置（含 displayName/icon/layout），合并注册
 * 3. 显示属性（菜单、图标等）全部由后端菜单系统驱动
 * 4. 注册时向子应用下发完整通信 props
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { registerMicroApps } from 'qiankun'
import { APP_CONFIGS } from '@schema-platform/platform-shared/qiankun/config'
import { fetchActiveMicroApps, type MicroAppConfig } from '@/api/microAppApi'
import { createSubAppProps, type SubAppProps } from '@/composables/useSubAppProps'

const BASE_PATH = APP_CONFIGS.shell.basePath  // '/schema-platform/'

// ── 全局状态 actions（由 main.ts 注入） ──

let globalStateActions: {
  onGlobalStateChange: (callback: (state: Record<string, unknown>, prev: Record<string, unknown>) => void) => void
  setGlobalState: (state: Record<string, unknown>) => void
} | null = null

export function setGlobalStateActions(actions: typeof globalStateActions): void {
  globalStateActions = actions
}

// ── 内置子应用：仅 qiankun 注册配置 ──

export interface BuiltinAppConfig {
  /** qiankun 应用标识 */
  name: string
  /** 本地开发端口 */
  devPort: number
  /** 生产环境 entry 路径（相对于 BASE_PATH） */
  prodPath: string
}

export const BUILTIN_APPS: BuiltinAppConfig[] = [
  {
    name: 'editor',
    devPort: 5100,
    prodPath: 'child/editor/',
  },
  {
    name: 'flow',
    devPort: 5200,
    prodPath: 'child/flow/',
  },
  {
    name: 'ai',
    devPort: 5300,
    prodPath: 'child/ai/',
  },
]

// ── Store ──

export const useMicroAppStore = defineStore('microApp', () => {
  const apps = ref<MicroAppConfig[]>([])
  const builtinRegistered = ref(false)
  const serverLoaded = ref(false)
  const error = ref<string | null>(null)

  /** 全部子应用（服务端配置为主，内置仅补充未被服务端覆盖的） */
  const allApps = computed(() => {
    const merged = new Map<string, MicroAppConfig>()

    // 服务端配置优先
    for (const s of apps.value) {
      merged.set(s.name, s)
    }

    // 内置补充（仅服务端未配置的）
    for (const b of BUILTIN_APPS) {
      if (!merged.has(b.name)) {
        merged.set(b.name, {
          id: `builtin-${b.name}`,
          name: b.name,
          displayName: b.name,
          url: getBuiltinEntry(b),
          icon: 'box',
          layout: 'without-menu',
          activeRule: `${BASE_PATH}${b.name}`,
          permissions: [],
          status: 'active',
          sort: 100,
        })
      }
    }

    return Array.from(merged.values()).sort((a, b) => a.sort - b.sort)
  })

  /** with-menu 布局的子应用 */
  const withMenuApps = computed(() =>
    allApps.value.filter(a => a.layout === 'with-menu'),
  )

  /** standalone 布局的子应用 */
  const standaloneApps = computed(() =>
    allApps.value.filter(a => a.layout === 'without-menu'),
  )

  function getBuiltinEntry(b: BuiltinAppConfig): string {
    if (import.meta.env.DEV) {
      return `http://localhost:${b.devPort}/`
    }
    return `${window.location.origin}${BASE_PATH}${b.prodPath}`
  }

  /** 构建子应用 props（统一通信契约） */
  function buildProps(appName: string): SubAppProps {
    if (!globalStateActions) {
      throw new Error('[microApp] globalStateActions not injected. Call setGlobalStateActions() in main.ts first.')
    }
    return createSubAppProps(appName, globalStateActions)
  }

  /** 注册内置子应用到 qiankun（应用名与子应用 qiankun 插件一致） */
  function registerBuiltin(): void {
    if (builtinRegistered.value) return

    const registrations = BUILTIN_APPS.map(b => ({
      name: b.name,
      entry: getBuiltinEntry(b),
      container: '#micro-container',
      activeRule: (location: Location) => {
        const p = location.pathname
        return p.startsWith(`${BASE_PATH}app/${b.name}`) ||
               p.startsWith(`${BASE_PATH}standalone/${b.name}`)
      },
      props: buildProps(b.name),
    }))

    registerMicroApps(registrations)
    builtinRegistered.value = true
  }

  /** 从后端拉取配置并合并注册 */
  async function fetchApps(): Promise<void> {
    try {
      error.value = null
      const serverApps = await fetchActiveMicroApps()
      apps.value = serverApps
      serverLoaded.value = true

      // 服务端返回的非内置应用需要追加注册到 qiankun
      const newApps = serverApps.filter(
        s => !BUILTIN_APPS.some(b => b.name === s.name),
      )

      if (newApps.length > 0) {
        registerMicroApps(
          newApps.map(app => ({
            name: app.name,
            entry: import.meta.env.DEV
              ? `http://localhost:${DEV_PORT_MAP[app.name] || 3000}/`
              : app.url,
            container: '#micro-container',
            activeRule: (location: Location) => {
              const p = location.pathname
              return p.startsWith(`${BASE_PATH}app/${app.name}`) ||
                     p.startsWith(`${BASE_PATH}standalone/${app.name}`)
            },
            props: buildProps(app.name),
          })),
        )
      }
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : '加载子应用配置失败'
      console.error('[shell] Failed to fetch micro-app configs:', err)
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
    builtinRegistered,
    serverLoaded,
    error,
    registerBuiltin,
    fetchApps,
    getApp,
  }
})

const DEV_PORT_MAP: Record<string, number> = {
  editor: 5100,
  flow: 5200,
  ai: 5300,
}
