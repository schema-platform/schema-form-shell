/**
 * useWorker — Web Worker 通信 Composable
 *
 * 在 Vue 组件中使用 WorkerBridge 的便捷方式。
 * 自动管理 Worker 生命周期（组件卸载时自动终止）。
 *
 * 用法：
 * ```ts
 * const { post, request, on, running } = useWorker({
 *   workerUrl: new URL('../workers/example.worker.ts', import.meta.url),
 *   name: 'compute-worker',
 * })
 *
 * // 发送请求并等待回复
 * const result = await request('compute', 1000000)
 *
 * // 监听消息
 * on('progress', (data) => { ... })
 * ```
 */
import { onUnmounted, ref } from 'vue'
import { WorkerBridge, type WorkerBridgeOptions } from '@/workers/WorkerBridge'

export interface UseWorkerOptions extends Omit<WorkerBridgeOptions, 'autoStart'> {}

export function useWorker(options: UseWorkerOptions) {
  const bridge = new WorkerBridge({ ...options, autoStart: true })
  const running = ref(true)

  onUnmounted(() => {
    bridge.terminate()
    running.value = false
  })

  return {
    /** Worker 是否正在运行 */
    running,
    /** 发送消息（单向） */
    post: bridge.post.bind(bridge),
    /** 发送请求并等待回复 */
    request: bridge.request.bind(bridge),
    /** 监听消息 */
    on: bridge.on.bind(bridge),
    /** 移除监听 */
    off: bridge.off.bind(bridge),
    /** 一次性监听 */
    once: bridge.once.bind(bridge),
    /** 终止 Worker */
    terminate: () => {
      bridge.terminate()
      running.value = false
    },
  }
}
