/**
 * Micro-app store
 *
 * Fetches micro-app configs from backend, registers with qiankun.
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { registerMicroApps } from 'qiankun'
import { APP_CONFIGS } from '@schema-form/platform-shared/qiankun/config'
import { fetchActiveMicroApps, type MicroAppConfig } from '@/api/microAppApi'
import { ensureStarted } from '@/utils/qiankunStarted'
import { useAuthStore } from '@/stores/auth'

const BASE_PATH = APP_CONFIGS.shell.basePath  // '/schema-platform/'

export const useMicroAppStore = defineStore('microApp', () => {
  const apps = ref<MicroAppConfig[]>([])
  const loaded = ref(false)

  const DEV_PORT_MAP: Record<string, number> = {
    editor: 5100,
    flow: 5200,
    ai: 5300,
  }

  function getEntry(app: MicroAppConfig): string {
    const isDev = import.meta.env.DEV
    if (isDev) {
      const port = DEV_PORT_MAP[app.name]
      return port ? `http://localhost:${port}/` : app.url
    }
    return app.url
  }

  async function fetchApps(): Promise<void> {
    apps.value = await fetchActiveMicroApps()
    loaded.value = true

    const authStore = useAuthStore()
    registerMicroApps(
      apps.value.map((app) => ({
        name: app.name,
        entry: getEntry(app),
        container: '#micro-container',
        activeRule: (location: Location) => {
          const p = location.pathname
          return p.startsWith(`${BASE_PATH}standalone/${app.name}`) ||
                 p.startsWith(`${BASE_PATH}app/${app.name}`)
        },
        props: {
          token: authStore.token,
          // 子应用调用此函数获取当前 routeBase（去掉 shell base path 前缀）
          getRouteBase: () => {
            const p = window.location.pathname
            const base = BASE_PATH + app.name  // /schema-platform/editor
            return p.startsWith(base) ? base : ''
          },
        },
      })),
    )
    ensureStarted()
  }

  function getApp(name: string): MicroAppConfig | undefined {
    return apps.value.find((a) => a.name === name || a.activeRule === `/${name}`)
  }

  return { apps, loaded, fetchApps, getApp }
})
