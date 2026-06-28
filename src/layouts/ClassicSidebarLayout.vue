/**
 * ClassicSidebarLayout — 带侧边菜单的统一布局
 *
 * 根据路由自动切换 main 区域：
 * - 有子路由（/、/admin/*）→ <router-view />
 * - 子应用容器（/app/*）→ #micro-container + qiankun
 */
<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useLayoutStore } from '@schema-form/business-shared/stores/layout'
import SideMenu from '@/components/SideMenu.vue'
import Breadcrumb from '@/components/Breadcrumb.vue'
import UserDropdown from '@/components/UserDropdown.vue'
import GlobalSearch from '@/components/GlobalSearch.vue'
import AppIcon from '@schema-platform/platform-shared/components/common/AppIcon.vue'
import { Loading } from '@element-plus/icons-vue'
import { onShellEvent, offShellEvent } from '@/composables/useSubAppProps'

const route = useRoute()
const layoutStore = useLayoutStore()
layoutStore.restoreCollapsed()

const isMicroApp = computed(() => route.name === 'app')
const loading = ref(true)

function toggleCollapse() {
  layoutStore.toggleCollapse()
}

function handleSubAppMounted() {
  console.log('[ClassicSidebarLayout] sub-app mounted via event')
  loading.value = false
}

onMounted(() => {
  if (isMicroApp.value) {
    console.log('[ClassicSidebarLayout] mounted as micro-app container')
    onShellEvent('shell:sub-app-mounted', handleSubAppMounted)
  }
})

onUnmounted(() => {
  offShellEvent('shell:sub-app-mounted', handleSubAppMounted)
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
        <!-- 子应用容器 -->
        <template v-if="isMicroApp">
          <div v-if="loading" :class="$style.loadingOverlay">
            <el-icon :class="$style.loadingIcon" :size="32"><Loading /></el-icon>
            <span>加载中...</span>
          </div>
          <div id="micro-container" :class="$style.container" />
        </template>
        <!-- 普通页面 -->
        <router-view v-else />
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
