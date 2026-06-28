/**
 * ClassicSidebarLayout — 带菜单的微应用容器
 *
 * 容器 ID: with-menu-container
 */
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useLayoutStore } from '@schema-form/business-shared/stores/layout'
import SideMenu from '@/components/SideMenu.vue'
import Breadcrumb from '@/components/Breadcrumb.vue'
import UserDropdown from '@/components/UserDropdown.vue'
import GlobalSearch from '@/components/GlobalSearch.vue'
import AppIcon from '@schema-platform/platform-shared/components/common/AppIcon.vue'
import { Loading } from '@element-plus/icons-vue'
import { ensureStarted } from '@/utils/qiankunStarted'

const layoutStore = useLayoutStore()
layoutStore.restoreCollapsed()

const loading = ref(true)

function toggleCollapse() {
  layoutStore.toggleCollapse()
}

// 监听子应用挂载完成
let observer: MutationObserver | null = null

onMounted(() => {
  ensureStarted()

  // 通过 MutationObserver 检测 micro-container 内容变化
  const container = document.getElementById('micro-container')
  if (container) {
    observer = new MutationObserver(() => {
      if (container.children.length > 0) {
        loading.value = false
        observer?.disconnect()
      }
    })
    observer.observe(container, { childList: true })
  }
})

onUnmounted(() => {
  observer?.disconnect()
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
        <div v-if="loading" :class="$style.loadingOverlay">
          <el-icon :class="$style.loadingIcon" :size="32"><Loading /></el-icon>
          <span>加载中...</span>
        </div>
        <div id="micro-container" :class="$style.container" />
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
