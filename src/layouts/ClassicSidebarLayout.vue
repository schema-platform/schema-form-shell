/**
 * ClassicSidebarLayout — 带侧边菜单的统一布局
 *
 * #micro-container 始终存在于 DOM（qiankun 需要），通过 CSS 显隐切换。
 * - 子应用路由（/app/*）→ 显示 #micro-container
 * - 其他路由 → 显示 <router-view />
 */
<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useLayoutStore } from '@schema-form/business-shared/stores/layout'
import { useMicroAppStore } from '@/stores/microApp'
import SideMenu from '@/components/SideMenu.vue'
import Breadcrumb from '@/components/Breadcrumb.vue'
import UserDropdown from '@/components/UserDropdown.vue'
import GlobalSearch from '@/components/GlobalSearch.vue'
import AppIcon from '@schema-platform/platform-shared/components/common/AppIcon.vue'
import { Loading } from '@element-plus/icons-vue'
import { APP_CONFIGS } from '@schema-platform/platform-shared/qiankun/config'
import { start as qiankunStart } from 'qiankun'
import { shellLog } from '@schema-platform/platform-shared/utils/logger'
import { onShellEvent, offShellEvent } from '@/composables/useSubAppProps'

const route = useRoute()
const layoutStore = useLayoutStore()
const microAppStore = useMicroAppStore()
layoutStore.restoreCollapsed()

const BASE = APP_CONFIGS.shell.basePath

const isMicroApp = computed(() => {
  const p = `${BASE.replace(/\/$/, '')}${route.path}`
  return microAppStore.allApps.some(app => {
    const raw = Array.isArray(app.activeRule)
      ? app.activeRule
      : app.activeRule.split(',').map(s => s.trim()).filter(Boolean)
    return raw.some(r => {
      const full = r.startsWith('/') ? r : `${BASE.replace(/\/$/, '')}${r}`
      return p.startsWith(full)
    })
  })
})

const loading = ref(false)
let loadingTimer: ReturnType<typeof setTimeout> | null = null

function clearLoadingTimer() {
  if (loadingTimer) {
    clearTimeout(loadingTimer)
    loadingTimer = null
  }
}

function startLoadingTimer() {
  clearLoadingTimer()
  loadingTimer = setTimeout(() => {
    if (loading.value) {
      shellLog.warn('loading timeout (10s), auto-hiding')
      loading.value = false
    }
  }, 10000)
}

function toggleCollapse() {
  layoutStore.toggleCollapse()
}

function handleSubAppMounted() {
  shellLog.info('sub-app mounted via event')
  loading.value = false
  clearLoadingTimer()
}

// 进入子应用路由时显示 loading，离开时隐藏
watch(isMicroApp, (isApp) => {
  if (isApp) {
    loading.value = true
    startLoadingTimer()
  } else {
    loading.value = false
    clearLoadingTimer()
  }
}, { immediate: true })

// 用 MutationObserver 检测子应用是否已渲染（兜底：qiankun 可能不触发事件）
let observer: MutationObserver | null = null

function startContainerObserver() {
  const container = document.getElementById('micro-container')
  if (!container || observer) return
  observer = new MutationObserver(() => {
    if (loading.value && container.childElementCount > 0) {
      shellLog.info('sub-app detected via DOM mutation, hiding loading')
      loading.value = false
      clearLoadingTimer()
    }
  })
  observer.observe(container, { childList: true })
}

function stopContainerObserver() {
  observer?.disconnect()
  observer = null
}

function tryStartQiankun() {
  if (!(window as any).__qiankun_started__ && microAppStore.registered) {
    (window as any).__qiankun_started__ = true
    qiankunStart()
    shellLog.info('qiankun started')
  }
}

onMounted(() => {
  shellLog.info('ClassicSidebarLayout mounted')
  onShellEvent('shell:sub-app-mounted', handleSubAppMounted)
  startContainerObserver()

  tryStartQiankun()
  if (!(window as any).__qiankun_started__) {
    const stop = watch(() => microAppStore.registered, (val) => {
      if (val) {
        tryStartQiankun()
        stop()
      }
    })
  }
})

onUnmounted(() => {
  offShellEvent('shell:sub-app-mounted', handleSubAppMounted)
  clearLoadingTimer()
  stopContainerObserver()
})
</script>

<template>
  <div :class="$style.layout">
    <SideMenu
      :collapsed="layoutStore.collapsed"
      @toggle-collapse="toggleCollapse"
    />

    <div :class="$style.contentArea">
      <header :class="$style.header">
        <div :class="$style.headerLeft">
          <el-button
            :class="$style.mobileMenuBtn"
            text
            @click="toggleCollapse"
          >
            <AppIcon name="menu" :size="18" />
          </el-button>
          <Breadcrumb />
        </div>

        <div :class="$style.headerRight">
          <GlobalSearch />
          <UserDropdown />
        </div>
      </header>

      <main :class="$style.main">
        <!-- 普通页面 -->
        <router-view v-show="!isMicroApp" />
        <!-- 子应用容器（始终存在于 DOM，qiankun 需要） -->
        <div v-show="isMicroApp" :class="$style.microWrapper">
          <div v-if="loading" :class="$style.loadingOverlay">
            <el-icon :class="$style.loadingIcon" :size="32"><Loading /></el-icon>
            <span>加载中...</span>
          </div>
          <div id="micro-container" :class="$style.container" />
        </div>
      </main>
    </div>
  </div>
</template>

<style module>
.layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: var(--bg-color-page);
}

.contentArea {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}

.header {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background: var(--bg-color-white);
  border-bottom: 1px solid var(--border-color-base);
  flex-shrink: 0;
}

.headerLeft {
  display: flex;
  align-items: center;
  gap: 8px;
}

.headerRight {
  display: flex;
  align-items: center;
  gap: 16px;
}

.mobileMenuBtn {
  display: none;
}

.main {
  flex: 1;
  position: relative;
  overflow: hidden;
  background: var(--bg-color-page);
}

.microWrapper {
  position: absolute;
  inset: 0;
}

.container {
  width: 100%;
  height: 100%;
}

.loadingOverlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: var(--bg-color-page);
  color: var(--text-color-secondary);
  font-size: 14px;
  z-index: 10;
}

.loadingIcon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 900px) {
  .mobileMenuBtn {
    display: flex;
  }
}
</style>

<!-- 全局：隐藏子应用 index.html 的 #loading -->
<style>
#micro-container #loading {
  display: none !important;
}
</style>
