/**
 * Shell router
 *
 * Route structure:
 * - /                         → MainLayout → HomeView (首页)
 * - /admin/micro-apps         → MainLayout → MicroAppManageView (微应用管理)
 * - /app/:pathMatch(.*)*      → ClassicSidebarLayout (带菜单的微应用容器)
 * - /standalone/:pathMatch(.*)* → StandaloneLayout (不带菜单的微应用容器)
 * - /login                    → LoginView (public)
 * - /sso/callback             → SSOCallbackView (public)
 */
import { createRouter, createWebHistory } from 'vue-router'
import { APP_CONFIGS } from '@schema-form/platform-shared/qiankun/config'
import { useAuthStore } from '@/stores/auth'

const PUBLIC_ROUTES = new Set(['/login', '/sso/callback'])
const base = APP_CONFIGS.shell.basePath

const router = createRouter({
  history: createWebHistory(base),
  routes: [
    // ---- Login ----
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { public: true },
    },

    // ---- SSO callback ----
    {
      path: '/sso/callback',
      name: 'sso-callback',
      component: () => import('@/views/SSOCallbackView.vue'),
      meta: { public: true },
    },

    // ---- 首页（带菜单布局） ----
    {
      path: '/',
      name: 'home',
      component: () => import('@/layouts/MainLayout.vue'),
    },

    // ---- 微应用管理（带菜单布局） ----
    {
      path: '/admin/micro-apps',
      name: 'micro-app-manage',
      component: () => import('@/layouts/MainLayout.vue'),
      meta: { admin: true },
    },

    // ---- 带菜单的微应用容器 ----
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
  const isPublic = to.meta?.public === true || PUBLIC_ROUTES.has(to.path)

  if (!authStore.token) {
    if (isPublic) { next() } else { next({ path: '/login', query: { redirect: to.fullPath } }) }
    return
  }

  if (to.path === '/login') { next({ path: '/' }); return }

  next()
})

export default router
