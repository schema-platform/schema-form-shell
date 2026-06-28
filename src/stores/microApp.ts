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

// ── activeRule 构建 ──

/**
 * 将 activeRule 配置转为 qiankun 需要的函数。
 * - string：精确匹配路径前缀
 * - string[]：任一匹配即激活
 * - 未提供：默认匹配 /app/{name} 和 /standalone/{name}
 */
function buildActiveRule(
  name: string,
  activeRule?: string | string[],
): (location: Location) => boolean {
  if (activeRule) {
    const rules = Array.isArray(activeRule) ? activeRule : [activeRule]
    return (location: Location) => rules.some(r => location.pathname.startsWith(r))
  }
  // 默认：同时匹配 /app/name 和 /standalone/name
  return (location: Location) => {
    const p = location.pathname
    return p.startsWith(`${BASE_PATH}app/${name}`) ||
           p.startsWith(`${BASE_PATH}standalone/${name}`)
  }
}

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
  /** 生产环境 entry 路径（相对于 BASE_PATH） */
  prodPath: string
}

export const BUILTIN_APPS: BuiltinAppConfig[] = [
  { name: 'editor', prodPath: 'editor/' },
  { name: 'flow', prodPath: 'flow/' },
  { name: 'ai', prodPath: 'ai/' },
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
          activeRule: [`${BASE_PATH}app/${b.name}`, `${BASE_PATH}standalone/${b.name}`],
          permissions: [],
          status: 'active',
          sort: 100,
        })
      }
    }

    const result = Array.from(merged.values()).sort((a, b) => a.sort - b.sort)
    console.log(`[microApp] allApps computed: ${result.length} apps (server=${apps.value.length}, builtin=${BUILTIN_APPS.length})`)
    return result
  })

  /** with-menu 布局的子应用 */
  const withMenuApps = computed(() =>
    allApps.value.filter(a => a.layout === 'with-menu'),
  )

  /** without-menu 布局的子应用 */
  const standaloneApps = computed(() =>
    allApps.value.filter(a => a.layout === 'without-menu'),
  )

  /** 开发环境子应用入口地址（Vite 需要静态 import.meta.env 访问） */
  const DEV_ENTRIES: Record<string, string> = {
    editor: import.meta.env.VITE_EDITOR_ENTRY,
    flow: import.meta.env.VITE_FLOW_ENTRY,
    ai: import.meta.env.VITE_AI_ENTRY,
  }

  function getBuiltinEntry(b: BuiltinAppConfig): string {
    const entry = import.meta.env.DEV
      ? (DEV_ENTRIES[b.name] || `http://localhost:3000/`)
      : `${window.location.origin}${BASE_PATH}${b.prodPath}`
    console.log(`[microApp] getBuiltinEntry: ${b.name} → ${entry}`)
    return entry
  }

  /** 服务端应用 entry：开发环境优先读环境变量，回退到服务端配置 */
  function getServerAppEntry(app: MicroAppConfig): string {
    if (import.meta.env.DEV && DEV_ENTRIES[app.name]) {
      return DEV_ENTRIES[app.name]
    }
    return app.url
  }

  /** 构建子应用 props（统一通信契约） */
  function buildProps(appName: string): SubAppProps {
    if (!globalStateActions) {
      throw new Error('[microApp] globalStateActions not injected. Call setGlobalStateActions() in main.ts first.')
    }
    const props = createSubAppProps(appName, globalStateActions)
    console.log(`[microApp] buildProps: ${appName}, keys=${Object.keys(props)}`)
    return props
  }

  /** 注册内置子应用到 qiankun（应用名与子应用 qiankun 插件一致） */
  function registerBuiltin(): void {
    if (builtinRegistered.value) {
      console.log('[microApp] registerBuiltin: already registered, skip')
      return
    }
    console.log(`[microApp] registerBuiltin: registering ${BUILTIN_APPS.length} apps`)

    const registrations = BUILTIN_APPS.map(b => ({
      name: b.name,
      entry: getBuiltinEntry(b),
      container: '#micro-container',
      activeRule: buildActiveRule(b.name),
      props: buildProps(b.name),
    }))

    console.table(registrations.map(r => ({ name: r.name, entry: r.entry, container: r.container, propsKeys: Object.keys(r.props) })))
    registerMicroApps(registrations)
    console.log(`[microApp] builtin registered: ${registrations.length} apps`)
    builtinRegistered.value = true
  }

  /** 从后端拉取配置并合并注册 */
  async function fetchApps(): Promise<void> {
    console.log('[microApp] fetchApps: start')
    try {
      error.value = null
      const serverApps = await fetchActiveMicroApps()
      console.log(`[microApp] fetchApps: server returned ${serverApps.length} apps`)
      apps.value = serverApps
      serverLoaded.value = true

      // 服务端返回的非内置应用需要追加注册到 qiankun
      const newApps = serverApps.filter(
        s => !BUILTIN_APPS.some(b => b.name === s.name),
      )

      if (newApps.length > 0) {
        console.table(newApps.map(app => ({
          name: app.name,
          entry: getServerAppEntry(app),
          layout: app.layout,
          displayName: app.displayName,
        })))
        console.log(`[microApp] server registered: ${newApps.length} apps`)
        registerMicroApps(
          newApps.map(app => ({
            name: app.name,
            entry: getServerAppEntry(app),
            container: '#micro-container',
            activeRule: buildActiveRule(app.name, app.activeRule),
            props: buildProps(app.name),
          })),
        )
      }
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : '加载子应用配置失败'
      console.error('[microApp] fetchApps failed:', error.value, err)
    }

    console.log(`[microApp] allApps total: ${allApps.value.length}`)
    console.table(allApps.value.map(a => ({ name: a.name, displayName: a.displayName, layout: a.layout, status: a.status, sort: a.sort })))
    console.log('[microApp] fetchApps: done')
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
