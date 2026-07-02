/**
 * Shell router
 *
 * Route structure:
 * - /login                    → LoginView (public)
 * - /sso/callback             → SSOCallbackView (public)
 * - /                         → ClassicSidebarLayout
 *   ├── ''                    → HomeView (首页)
 *   ├── admin/micro-apps      → MicroAppManageView (管理页)
 *   └── app/:pathMatch(.*)*   → 子应用容器（qiankun #micro-container）
 * - /standalone/:pathMatch(.*)* → StandaloneLayout (不带菜单)
 *
 * 关键：/app/* 是 / 的子路由，保证 ClassicSidebarLayout 在首页和子应用之间
 * 不会销毁重建，避免菜单重复渲染和 qiankun 容器闪烁。
 */
import { createRouter, createWebHistory } from 'vue-router'
import { APP_CONFIGS } from '@schema-platform/platform-shared/qiankun/config'
import { useAuthStore } from '@schema-platform/platform-shared/utils/stores/authStore'

const PUBLIC_ROUTE_NAMES = new Set(['login', 'sso-callback', 'app', 'standalone'])
const base = APP_CONFIGS.shell.basePath

const router = createRouter({
  history: createWebHistory(base),
  routes: [
    // ---- Login ----
    {
      path: '/login',
      name: 'login',
      component: () => import('@schema-platform/platform-shared/components/auth/LoginView.vue'),
      props: { title: 'Schema 业务平台', subtitle: '基础容器' },
      meta: { public: true },
    },

    // ---- SSO callback ----
    {
      path: '/sso/callback',
      name: 'sso-callback',
      component: () => import('@/views/SSOCallbackView.vue'),
      meta: { public: true },
    },

    // ---- ClassicSidebarLayout 统一壳（首页 + 管理页 + 子应用） ----
    {
      path: '/',
      component: () => import('@/layouts/ClassicSidebarLayout.vue'),
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('@/views/HomeView.vue'),
        },
        {
          path: 'admin/micro-apps',
          name: 'micro-app-manage',
          component: () => import('@/views/MicroAppManageView.vue'),
          meta: { admin: true },
        },
        // 子应用容器 —— 渲染空节点，实际内容由 ClassicSidebarLayout 的 #micro-container 接管
        {
          path: 'app/:pathMatch(.*)*',
          name: 'app',
          component: { render: () => null },
        },
      ],
    },

    // ---- 不带菜单的微应用容器 ----
    {
      path: '/standalone/:pathMatch(.*)*',
      name: 'standalone',
      component: () => import('@/layouts/StandaloneLayout.vue'),
    },

    // ---- Catch-all ----
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

// Global navigation guard
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()
  const isPublic = to.meta?.public === true || PUBLIC_ROUTE_NAMES.has(to.name as string)

  if (!authStore.accessToken) {
    if (isPublic) { next() } else { next({ path: '/login', query: { redirect: to.fullPath } }) }
    return
  }

  if (to.path === '/login') {
    if (authStore.accessToken && authStore.user) {
      next({ path: '/' })
    } else {
      if (authStore.accessToken && !authStore.user) {
        authStore.reset()
      }
      next()
    }
    return
  }

  next()
})

export default router
