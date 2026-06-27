/**
 * Micro-app communication Worker
 *
 * 负责子应用间消息路由、状态同步、事件广播。
 * 运行在独立线程，不阻塞主线程。
 *
 * 消息协议：
 * - `event:emit`    → 广播事件给所有监听者
 * - `state:sync`    → 同步全局状态到所有子应用
 * - `state:get`     → 获取当前全局状态
 * - `state:patch`   → 增量更新全局状态
 * - `app:register`  → 子应用注册自己（标记在线）
 * - `app:unregister`→ 子应用注销
 * - `app:list`      → 获取在线子应用列表
 */

interface WorkerMessage<T = unknown> {
  id: string
  type: string
  payload: T
  timestamp: number
  /** 消息来源标识（子应用名称） */
  source?: string
}

// ── 状态管理 ──

/** 全局共享状态 */
const globalState: Record<string, unknown> = {
  theme: 'light',
  locale: 'zh-CN',
}

/** 在线子应用注册表 */
const registeredApps = new Map<string, { registeredAt: number; lastPing: number }>()

/** 事件监听表：eventType → Set of source app names */
const eventListeners = new Map<string, Set<string>>()

// ── 消息处理 ──

self.addEventListener('message', (event: MessageEvent<WorkerMessage>) => {
  const { id, type, payload, source } = event.data

  switch (type) {
    case 'event:emit':
      handleEventEmit(id, payload as { event: string; data: unknown }, source)
      break

    case 'event:listen':
      handleEventListen(id, payload as { event: string }, source)
      break

    case 'event:unlisten':
      handleEventUnlisten(id, payload as { event: string }, source)
      break

    case 'state:sync':
      handleStateSync(id, payload as Record<string, unknown>)
      break

    case 'state:get':
      handleStateGet(id)
      break

    case 'state:patch':
      handleStatePatch(id, payload as Record<string, unknown>)
      break

    case 'app:register':
      handleAppRegister(id, payload as { name: string })
      break

    case 'app:unregister':
      handleAppUnregister(id, payload as { name: string })
      break

    case 'app:list':
      handleAppList(id)
      break

    case 'ping':
      handlePing(id, source)
      break

    default:
      respond(id, 'error', { message: `Unknown message type: ${type}` })
  }
})

// ── 事件广播 ──

function handleEventEmit(id: string, payload: { event: string; data: unknown }, source?: string): void {
  const { event, data } = payload
  const listeners = eventListeners.get(event)

  // 广播给所有监听此事件的子应用
  self.postMessage({
    id: `evt-${Date.now()}`,
    type: 'event:broadcast',
    payload: { event, data, source },
    timestamp: Date.now(),
  })

  respond(id, 'event:emit:response', { success: true, listeners: listeners?.size ?? 0 })
}

function handleEventListen(id: string, payload: { event: string }, source?: string): void {
  if (!source) {
    respond(id, 'event:listen:response', { success: false, error: 'source required' })
    return
  }

  if (!eventListeners.has(payload.event)) {
    eventListeners.set(payload.event, new Set())
  }
  eventListeners.get(payload.event)!.add(source)

  respond(id, 'event:listen:response', { success: true })
}

function handleEventUnlisten(id: string, payload: { event: string }, source?: string): void {
  eventListeners.get(payload.event)?.delete(source ?? '')
  respond(id, 'event:unlisten:response', { success: true })
}

// ── 状态同步 ──

function handleStateSync(id: string, payload: Record<string, unknown>): void {
  Object.assign(globalState, payload)

  // 广播状态变更
  self.postMessage({
    id: `state-${Date.now()}`,
    type: 'state:changed',
    payload: { ...globalState },
    timestamp: Date.now(),
  })

  respond(id, 'state:sync:response', { success: true, state: { ...globalState } })
}

function handleStateGet(id: string): void {
  respond(id, 'state:get:response', { ...globalState })
}

function handleStatePatch(id: string, payload: Record<string, unknown>): void {
  // 增量更新：只合并存在的 key
  for (const [key, value] of Object.entries(payload)) {
    if (value === null) {
      delete globalState[key]
    } else {
      globalState[key] = value
    }
  }

  // 广播状态变更
  self.postMessage({
    id: `state-${Date.now()}`,
    type: 'state:changed',
    payload: { ...globalState },
    timestamp: Date.now(),
  })

  respond(id, 'state:patch:response', { success: true, state: { ...globalState } })
}

// ── 应用注册 ──

function handleAppRegister(id: string, payload: { name: string }): void {
  registeredApps.set(payload.name, { registeredAt: Date.now(), lastPing: Date.now() })

  // 广播应用上线
  self.postMessage({
    id: `app-${Date.now()}`,
    type: 'app:status',
    payload: { name: payload.name, status: 'online', apps: getAppList() },
    timestamp: Date.now(),
  })

  respond(id, 'app:register:response', { success: true, apps: getAppList() })
}

function handleAppUnregister(id: string, payload: { name: string }): void {
  registeredApps.delete(payload.name)

  // 清理事件监听
  for (const [event, listeners] of eventListeners) {
    listeners.delete(payload.name)
    if (listeners.size === 0) eventListeners.delete(event)
  }

  // 广播应用下线
  self.postMessage({
    id: `app-${Date.now()}`,
    type: 'app:status',
    payload: { name: payload.name, status: 'offline', apps: getAppList() },
    timestamp: Date.now(),
  })

  respond(id, 'app:unregister:response', { success: true, apps: getAppList() })
}

function handleAppList(id: string): void {
  respond(id, 'app:list:response', getAppList())
}

function handlePing(id: string, source?: string): void {
  if (source && registeredApps.has(source)) {
    registeredApps.get(source)!.lastPing = Date.now()
  }
  respond(id, 'pong', { timestamp: Date.now() })
}

// ── 工具函数 ──

function respond(id: string, type: string, payload: unknown): void {
  self.postMessage({ id, type, payload, timestamp: Date.now() })
}

function getAppList(): Array<{ name: string; registeredAt: number; lastPing: number }> {
  return Array.from(registeredApps.entries()).map(([name, info]) => ({
    name,
    ...info,
  }))
}

export {} // 使文件成为模块
