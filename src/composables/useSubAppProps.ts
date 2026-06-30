/**
 * useSubAppProps — 子应用注册 props 工厂
 *
 * 集中管理 shell 向子应用下发的 props 契约。
 * 子应用通过这些 props 与 shell 及其他子应用通信。
 *
 * Props 契约：
 * - token: string                    — 认证令牌
 * - getRouteBase: () => string       — 动态前缀地址
 * - onGlobalStateChange: (fn) => void — 监听 qiankun 全局状态
 * - setGlobalState: (state) => void  — 修改全局状态
 * - emitEvent: (event, data) => void — 向其他子应用广播事件
 * - onEvent: (event, fn) => void     — 监听其他子应用事件
 * - offEvent: (event, fn) => void    — 移除事件监听
 * - navigateTo: (path) => void       — shell 路由导航
 * - getSharedState: () => object     — 获取 shell 共享状态（用户、菜单等）
 */
import type { Router } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useMenuStore } from '@/stores/menu'
import { useMicroAppStore } from '@/stores/microApp'
import { APP_CONFIGS } from '@schema-platform/platform-shared/qiankun/config'

const BASE_PATH = APP_CONFIGS.shell.basePath

// ── Router 引用（由 main.ts 通过 setRouter() 注入，避免在 setup 外调用 useRouter） ──

let routerRef: Router | null = null

/**
 * 注入 router 实例，供 createSubAppProps 在 setup 外使用。
 * 应在 main.ts 中 app.use(router) 之后调用。
 */
export function setRouter(router: Router): void {
  routerRef = router
}

// ── 事件总线（shell 级别，不经过 Worker） ──

type EventHandler = (data: unknown) => void

const eventBus = new Map<string, Set<EventHandler>>()

function emitShellEvent(event: string, data: unknown): void {
  eventBus.get(event)?.forEach(fn => fn(data))
}

function onShellEvent(event: string, handler: EventHandler): void {
  if (!eventBus.has(event)) {
    eventBus.set(event, new Set())
  }
  eventBus.get(event)!.add(handler)
}

function offShellEvent(event: string, handler: EventHandler): void {
  eventBus.get(event)?.delete(handler)
}

// ── Props 工厂 ──

export interface SubAppProps {
  /** 认证令牌 */
  token: string
  /** 动态获取认证令牌（子应用 mount 时调用，确保获取最新值） */
  getToken: () => string
  /** 动态前缀地址回调 */
  getRouteBase: () => string
  /** 监听 qiankun 全局状态变化 */
  onGlobalStateChange: (callback: (state: Record<string, unknown>, prev: Record<string, unknown>) => void) => void
  /** 修改 qiankun 全局状态 */
  setGlobalState: (state: Record<string, unknown>) => void
  /** 向其他子应用广播事件 */
  emitEvent: (event: string, data: unknown) => void
  /** 监听其他子应用事件 */
  onEvent: (event: string, handler: EventHandler) => void
  /** 移除事件监听 */
  offEvent: (event: string, handler: EventHandler) => void
  /** shell 路由导航 */
  navigateTo: (path: string, query?: Record<string, string>) => void
  /** 在新窗口打开路由 */
  openInNewTab: (path: string) => void
  /** 获取 shell 共享状态 */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getSharedState: () => {
    user: any
    menus: any
    apps: any
  }
  /** 获取子应用基础路径前缀 */
  getBasePath: () => string
}

/**
 * 创建子应用 props
 * @param appName - 子应用名称
 * @param globalStateActions - qiankun globalState actions（来自 initGlobalState）
 */
export function createSubAppProps(
  appName: string,
  globalStateActions: {
    onGlobalStateChange: (callback: (state: Record<string, unknown>, prev: Record<string, unknown>) => void) => void
    setGlobalState: (state: Record<string, unknown>) => void
  },
): SubAppProps {
  const authStore = useAuthStore()
  const menuStore = useMenuStore()
  const microAppStore = useMicroAppStore()
  if (!routerRef) {
    throw new Error('[useSubAppProps] router not initialized. Call setRouter() in main.ts after app.use(router).')
  }
  const router = routerRef

  return {
    token: authStore.accessToken ?? '',
    getToken: () => authStore.accessToken ?? '',

    getRouteBase() {
      const p = window.location.pathname
      // 同时匹配 /app/appName 和 /standalone/appName 两种路径
      const appBase = `${BASE_PATH}app/${appName}`
      const standaloneBase = `${BASE_PATH}standalone/${appName}`
      if (p.startsWith(appBase)) return appBase
      if (p.startsWith(standaloneBase)) return standaloneBase
      return ''
    },

    getBasePath() {
      const p = window.location.pathname
      const appBase = `${BASE_PATH}app/${appName}/`
      const standaloneBase = `${BASE_PATH}standalone/${appName}/`
      if (p.startsWith(appBase)) return appBase
      if (p.startsWith(standaloneBase)) return standaloneBase
      return `${BASE_PATH}app/${appName}/`
    },

    onGlobalStateChange: globalStateActions.onGlobalStateChange,

    setGlobalState: globalStateActions.setGlobalState,

    emitEvent(event: string, data: unknown) {
      emitShellEvent(event, data)
    },

    onEvent(event: string, handler: EventHandler) {
      onShellEvent(event, handler)
    },

    offEvent(event: string, handler: EventHandler) {
      offShellEvent(event, handler)
    },

    navigateTo(path: string, query?: Record<string, string>) {
      router.push({ path, query })
    },

    openInNewTab(path: string) {
      const resolved = router.resolve(path)
      window.open(resolved.href, '_blank')
    },

    getSharedState() {
      return {
        user: authStore.user,
        menus: menuStore.menuTree,
        apps: microAppStore.allApps,
      }
    },
  }
}

export { emitShellEvent, onShellEvent, offShellEvent }
