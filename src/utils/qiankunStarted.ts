/**
 * Qiankun start guard
 */
import { start } from 'qiankun'

let started = false

export function ensureStarted(): void {
  if (!started) {
    started = true
    start({ sandbox: false })
  }
}
