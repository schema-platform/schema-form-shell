/**
 * Micro-app store
 *
 * 子应用注册策略：聚合静态配置 + 服务端拉取
 *
 * 1. BUILTIN_APPS：内置子应用静态配置，启动时立即注册
 * 2. fetchApps()：从后端拉取配置，合并/覆盖内置配置
 * 3. 双容器：with-menu 和 standalone 分别渲染
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { registerMicroApps } from 'qiankun'
import { APP_CONFIGS } from '@schema-form/platform-shared/qiankun/config'
import { fetchActiveMicroApps, type MicroAppConfig } from '@/api/microAppApi'
import { ensureStarted } from '@/utils/qiankunStarted'
import { useAuthStore } from '@/stores/auth'

const BASE_PATH = APP_CONFIGS.shell.basePath  // '/schema-platform/'

// ── 内置子应用静态配置 ──

export interface BuiltinAppConfig {
  name: string
  displayName: string
  icon: string
  layout: 'with-menu' | 'without-menu'
  activeRule: string
  devPort: number
  /** 生产环境 entry 路径（相对于 BASE_PATH） */
  prodPath: string
  sort: number
}

export const BUILTIN_APPS: BuiltinAppConfig[] = [
  {
    name: 'editor',
    displayName: '表单设计器',
    icon: 'edit',
    layout: 'with-menu',
    activeRule: `${BASE_PATH}app/editor`,
    devPort: 5100,
    prodPath: 'child/editor/',
    sort: 10,
  },
  {
    name: 'flow',
    displayName: '流程引擎',
    icon: 'connection',
    layout: 'with-menu',
    activeRule: `${BASE_PATH}app/flow`,
    devPort: 5200,
    prodPath: 'child/flow/',
    sort: 20,
  },
  {
    name: 'ai',
    displayName: 'AI 助手',
    icon: 'chat-dot-round',
    layout: 'with-menu',
    activeRule: `${BASE_PATH}app/ai`,
    devPort: 5300,
    prodPath: 'child/ai/',
    sort: 30,
  },
]

// ── Store ──

export const useMicroAppStore = defineStore('microApp', () => {
  const apps = ref<MicroAppConfig[]>([])
  const builtinRegistered = ref(false)
  const serverLoaded = ref(false)
  const error = ref<string | null>(null)

  /** 合并后的全部子应用（内置 + 服务端） */
  const allApps = computed(() => {
    const merged = new Map<string, MicroAppConfig>()
    // 内置优先
    for (const b of BUILTIN_APPS) {
      merged.set(b.name, {
        id: `builtin-${b.name}`,
        name: b.name,
        displayName: b.displayName,
        url: getBuiltinEntry(b),
        icon: b.icon,
        layout: b.layout,
        activeRule: b.activeRule.replace(BASE_PATH, '/'),
        permissions: [],
        status: 'active',
        sort: b.sort,
      })
    }
    // 服务端覆盖
    for (const s of apps.value) {
      merged.set(s.name, { ...merged.get(s.name), ...s })
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

  /** 注册内置子应用到 qiankun */
  function registerBuiltin(): void {
    if (builtinRegistered.value) return

    const authStore = useAuthStore()
    const registrations = BUILTIN_APPS.map(b => ({
      name: b.name,
      entry: getBuiltinEntry(b),
      container: '#micro-container',
      activeRule: (location: Location) => {
        const p = location.pathname
        return p.startsWith(b.activeRule) ||
               p.startsWith(`${BASE_PATH}standalone/${b.name}`)
      },
      props: {
        token: authStore.token,
        getRouteBase: () => {
          const p = window.location.pathname
          const base = BASE_PATH + b.name
          return p.startsWith(base) ? base : ''
        },
      },
    }))

    registerMicroApps(registrations)
    ensureStarted()
    builtinRegistered.value = true
  }

  /** 从后端拉取配置并合并注册 */
  async function fetchApps(): Promise<void> {
    try {
      error.value = null
      const serverApps = await fetchActiveMicroApps()
      apps.value = serverApps
      serverLoaded.value = true

      // 服务端返回的非内置应用需要追加注册
      const authStore = useAuthStore()
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
              return p.startsWith(`${BASE_PATH}standalone/${app.name}`) ||
                     p.startsWith(`${BASE_PATH}app/${app.name}`)
            },
            props: {
              token: authStore.token,
              getRouteBase: () => {
                const p = window.location.pathname
                const base = BASE_PATH + app.name
                return p.startsWith(base) ? base : ''
              },
            },
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
