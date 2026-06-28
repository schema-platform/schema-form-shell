/**
 * Shell router
 *
 * Route structure:
 * - /login                    → LoginView (public)
 * - /sso/callback             → SSOCallbackView (public)
 * - /                         → ClassicSidebarLayout → HomeView (首页)
 * - /admin/micro-apps         → ClassicSidebarLayout → MicroAppManageView (管理页)
 * - /app/:pathMatch(.*)*      → ClassicSidebarLayout + qiankun (带菜单的子应用容器)
 * - /standalone/:pathMatch(.*)* → StandaloneLayout (不带菜单)
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

    // ---- 带菜单的页面（首页 + 管理页） ----
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
      ],
    },

    // ---- 带菜单的微应用容器（独立路由） ----
    {
      path: '/app/:pathMatch(.*)*',
      name: 'app',
      component: () => import('@/layouts/ClassicSidebarLayout.vue'),
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

  if (to.path === '/login') { next({ path: '/' }); return }

  next()
})

export default router
