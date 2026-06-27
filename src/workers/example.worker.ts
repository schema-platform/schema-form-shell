/**
 * 示例 Worker
 *
 * 演示 WorkerBridge 的使用方式。
 * Worker 接收消息，处理后回复。
 */

interface WorkerMessage {
  id: string
  type: string
  payload: unknown
  timestamp: number
}

// 监听主线程消息
self.addEventListener('message', (event: MessageEvent<WorkerMessage>) => {
  const { id, type, payload } = event.data

  switch (type) {
    case 'echo':
      // 回显消息
      self.postMessage({ id, type: 'echo:response', payload, timestamp: Date.now() })
      break

    case 'compute':
      // 模拟耗时计算
      const result = heavyComputation(payload as number)
      self.postMessage({ id, type: 'compute:response', payload: result, timestamp: Date.now() })
      break

    case 'ping':
      // 心跳响应
      self.postMessage({ id, type: 'pong', payload: null, timestamp: Date.now() })
      break

    default:
      self.postMessage({ id, type: 'error', payload: `Unknown message type: ${type}`, timestamp: Date.now() })
  }
})

/**
 * 模拟耗时计算
 */
function heavyComputation(n: number): number {
  let result = 0
  for (let i = 0; i < n; i++) {
    result += Math.sqrt(i)
  }
  return result
}

export {} // 使文件成为模块
