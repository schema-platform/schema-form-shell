/**
 * WorkerBridge — Web Worker 通信桥接
 *
 * Shell 与 Worker 线程之间的消息通信。
 * 支持：
 * - 发送消息到 Worker
 * - 监听 Worker 回复
 * - 请求-响应模式（request/response）
 * - Worker 生命周期管理
 */

export interface WorkerMessage<T = unknown> {
  id: string
  type: string
  payload: T
  timestamp: number
}

export interface WorkerBridgeOptions {
  /** Worker 脚本路径 */
  workerUrl: string | URL
  /** Worker 名称（用于日志） */
  name?: string
  /** 是否立即启动 */
  autoStart?: boolean
}

type MessageHandler = (payload: unknown) => void

export class WorkerBridge {
  private worker: Worker | null = null
  private handlers = new Map<string, Set<MessageHandler>>()
  private pendingRequests = new Map<string, { resolve: (value: unknown) => void; reject: (reason: unknown) => void }>()
  private name: string
  private workerUrl: string | URL
  private requestId = 0

  constructor(options: WorkerBridgeOptions) {
    this.name = options.name ?? 'worker'
    this.workerUrl = options.workerUrl
    if (options.autoStart !== false) {
      this.start()
    }
  }

  // ── 生命周期 ──

  /** 启动 Worker */
  start(): void {
    if (this.worker) return

    this.worker = new Worker(this.workerUrl, { type: 'module' })
    this.worker.addEventListener('message', this.handleMessage.bind(this))
    this.worker.addEventListener('error', this.handleError.bind(this))
    console.log(`[${this.name}] Worker started`)
  }

  /** 终止 Worker */
  terminate(): void {
    if (this.worker) {
      this.worker.terminate()
      this.worker = null
      this.pendingRequests.forEach(({ reject }) => reject(new Error('Worker terminated')))
      this.pendingRequests.clear()
      console.log(`[${this.name}] Worker terminated`)
    }
  }

  /** Worker 是否正在运行 */
  get running(): boolean {
    return this.worker !== null
  }

  // ── 发送消息 ──

  /**
   * 发送消息（单向，不等待回复）
   * @param type - 消息类型
   * @param payload - 消息数据
   */
  post<T = unknown>(type: string, payload?: T): void {
    if (!this.worker) throw new Error('Worker not started')

    const message: WorkerMessage<T> = {
      id: `msg-${++this.requestId}`,
      type,
      payload: payload as T,
      timestamp: Date.now(),
    }

    this.worker.postMessage(message)
  }

  /**
   * 发送请求并等待回复
   * @param type - 消息类型
   * @param payload - 请求数据
   * @param timeout - 超时时间（ms），默认 30000
   * @returns Worker 的回复数据
   */
  request<T = unknown, R = unknown>(type: string, payload?: T, timeout = 30000): Promise<R> {
    if (!this.worker) return Promise.reject(new Error('Worker not started'))

    return new Promise<R>((resolve, reject) => {
      const id = `req-${++this.requestId}`

      const timer = setTimeout(() => {
        this.pendingRequests.delete(id)
        reject(new Error(`Worker request timeout: ${type}`))
      }, timeout)

      this.pendingRequests.set(id, {
        resolve: (value) => {
          clearTimeout(timer)
          resolve(value as R)
        },
        reject: (reason) => {
          clearTimeout(timer)
          reject(reason)
        },
      })

      const message: WorkerMessage<T> = {
        id,
        type,
        payload: payload as T,
        timestamp: Date.now(),
      }

      this.worker!.postMessage(message)
    })
  }

  // ── 监听消息 ──

  /**
   * 监听指定类型的消息
   * @param type - 消息类型
   * @param handler - 回调函数
   */
  on(type: string, handler: MessageHandler): void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set())
    }
    this.handlers.get(type)!.add(handler)
  }

  /**
   * 移除监听
   * @param type - 消息类型
   * @param handler - 回调函数
   */
  off(type: string, handler: MessageHandler): void {
    this.handlers.get(type)?.delete(handler)
  }

  /**
   * 一次性监听
   * @param type - 消息类型
   * @param handler - 回调函数
   */
  once(type: string, handler: MessageHandler): void {
    const wrapped: MessageHandler = (payload) => {
      handler(payload)
      this.off(type, wrapped)
    }
    this.on(type, wrapped)
  }

  // ── 内部方法 ──

  private handleMessage(event: MessageEvent<WorkerMessage>): void {
    const { id, type, payload } = event.data

    // 检查是否是 request 的回复
    if (id && this.pendingRequests.has(id)) {
      const pending = this.pendingRequests.get(id)!
      this.pendingRequests.delete(id)
      pending.resolve(payload)
      return
    }

    // 分发到普通 handler
    const typeHandlers = this.handlers.get(type)
    if (typeHandlers) {
      for (const handler of typeHandlers) {
        handler(payload)
      }
    }
  }

  private handleError(error: ErrorEvent): void {
    console.error(`[${this.name}] Worker error:`, error.message)
    // 拒绝所有 pending requests
    this.pendingRequests.forEach(({ reject }) => reject(error))
    this.pendingRequests.clear()
  }
}

/**
 * 创建 WorkerBridge 实例
 * @param options - 配置项
 * @returns WorkerBridge 实例
 */
export function createWorkerBridge(options: WorkerBridgeOptions): WorkerBridge {
  return new WorkerBridge(options)
}
