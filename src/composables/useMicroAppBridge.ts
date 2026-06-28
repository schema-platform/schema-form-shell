/**
 * useMicroAppBridge — 子应用间通信桥接
 *
 * 基于 WorkerBridge 的微应用通信层。
 * Shell 使用此 composable 管理子应用间的事件广播、状态同步、在线管理。
 *
 * 用法：
 * ```ts
 * const bridge = useMicroAppBridge()
 *
 * // 监听子应用发来的事件
 * bridge.on('schema:save', (data) => { ... })
 *
 * // 向所有子应用广播事件
 * bridge.emit('theme:change', { theme: 'dark' })
 *
 * // 同步全局状态
 * bridge.patchState({ locale: 'en' })
 *
 * // 获取在线子应用
 * bridge.apps  // reactive
 * ```
 */
import { onUnmounted, ref, readonly } from 'vue'
import { WorkerBridge } from '@/workers/WorkerBridge'

// ── 单例 WorkerBridge ──

let bridgeInstance: WorkerBridge | null = null
let refCount = 0

function getBridge(): WorkerBridge {
  if (!bridgeInstance) {
    bridgeInstance = new WorkerBridge({
      workerUrl: new URL('../workers/microApp.worker.ts', import.meta.url),
      name: 'micro-app-bridge',
      autoStart: true,
    })
  }
  refCount++
  return bridgeInstance
}

function releaseBridge(): void {
  refCount--
  if (refCount <= 0 && bridgeInstance) {
    bridgeInstance.terminate()
    bridgeInstance = null
    refCount = 0
  }
}

// ── 类型定义 ──

export interface OnlineApp {
  name: string
  registeredAt: number
  lastPing: number
}

export interface AppStatusEvent {
  name: string
  status: 'online' | 'offline'
  apps: OnlineApp[]
}

export interface BroadcastEvent<T = unknown> {
  event: string
  data: T
  source?: string
}

export type StateChangeHandler = (state: Record<string, unknown>) => void
export type AppStatusHandler = (event: AppStatusEvent) => void

// ── Composable ──

export function useMicroAppBridge() {
  const bridge = getBridge()
  const apps = ref<OnlineApp[]>([])
  const globalState = ref<Record<string, unknown>>({})

  // 监听应用状态变更
  bridge.on('app:status', (payload) => {
    const event = payload as AppStatusEvent
    apps.value = event.apps
  })

  // 监听状态变更广播
  bridge.on('state:changed', (payload) => {
    globalState.value = payload as Record<string, unknown>
  })

  // ── 事件通信 ──

  /**
   * 广播事件给所有子应用
   * @param event - 事件名称
   * @param data - 事件数据
   * @param source - 来源标识（默认 'shell'）
   */
  function emit<T = unknown>(event: string, data: T, source = 'shell'): void {
    bridge.post('event:emit', { event, data, source })
  }

  /**
   * 监听子应用发来的事件
   * @param event - 事件名称
   * @param handler - 处理函数
   */
  function on<T = unknown>(event: string, handler: (payload: BroadcastEvent<T>) => void): void {
    bridge.on('event:broadcast', (payload) => {
      const broadcast = payload as BroadcastEvent<T>
      if (broadcast.event === event) {
        handler(broadcast)
      }
    })
  }

  /**
   * 移除事件监听
   * @param _event - 事件名称
   * @param handler - 处理函数
   */
  function off(_event: string, handler: (payload: BroadcastEvent) => void): void {
    bridge.off('event:broadcast', handler as (payload: unknown) => void)
  }

  // ── 状态同步 ──

  /**
   * 增量更新全局状态
   * @param patch - 要更新的状态字段
   */
  async function patchState(patch: Record<string, unknown>): Promise<void> {
    await bridge.request('state:patch', patch)
  }

  /**
   * 全量替换全局状态
   * @param state - 新状态
   */
  async function syncState(state: Record<string, unknown>): Promise<void> {
    await bridge.request('state:sync', state)
  }

  /**
   * 获取当前全局状态
   */
  async function fetchState(): Promise<Record<string, unknown>> {
    const state = await bridge.request('state:get', undefined)
    globalState.value = state as Record<string, unknown>
    return state as Record<string, unknown>
  }

  // ── 应用管理 ──

  /**
   * 注册子应用（标记为在线）
   * @param name - 子应用名称
   */
  async function registerApp(name: string): Promise<void> {
    const result = await bridge.request<{ name: string }, { apps: OnlineApp[] }>('app:register', { name })
    apps.value = result.apps
  }

  /**
   * 注销子应用
   * @param name - 子应用名称
   */
  async function unregisterApp(name: string): Promise<void> {
    const result = await bridge.request<{ name: string }, { apps: OnlineApp[] }>('app:unregister', { name })
    apps.value = result.apps
  }

  /**
   * 获取在线子应用列表
   */
  async function fetchApps(): Promise<OnlineApp[]> {
    const result = await bridge.request<void, OnlineApp[]>('app:list', undefined)
    apps.value = result
    return result
  }

  /**
   * 心跳保活
   * @param name - 子应用名称
   */
  function ping(name: string): void {
    bridge.post('ping', { name })
  }

  // ── 监听注册 ──

  /**
   * 注册事件监听（通知 Worker）
   * @param event - 事件名称
   * @param source - 来源标识
   */
  function listen(event: string, source = 'shell'): void {
    bridge.post('event:listen', { event, source })
  }

  /**
   * 取消事件监听
   * @param event - 事件名称
   * @param source - 来源标识
   */
  function unlisten(event: string, source = 'shell'): void {
    bridge.post('event:unlisten', { event, source })
  }

  // ── 生命周期 ──

  onUnmounted(() => {
    releaseBridge()
  })

  return {
    /** 在线子应用列表 */
    apps: readonly(apps),
    /** 全局共享状态 */
    globalState: readonly(globalState),
    /** 广播事件 */
    emit,
    /** 监听事件 */
    on,
    /** 移除监听 */
    off,
    /** 增量更新状态 */
    patchState,
    /** 全量同步状态 */
    syncState,
    /** 获取状态 */
    fetchState,
    /** 注册子应用 */
    registerApp,
    /** 注销子应用 */
    unregisterApp,
    /** 获取在线应用 */
    fetchApps,
    /** 心跳 */
    ping,
    /** 注册事件监听 */
    listen,
    /** 取消事件监听 */
    unlisten,
  }
}
