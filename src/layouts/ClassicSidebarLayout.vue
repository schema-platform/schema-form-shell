/**
 * ClassicSidebarLayout — 带菜单的微应用容器
 *
 * 双容器策略：
 * - SubAppContainer 包裹 #micro-container
 * - Shell loading 仅在子应用区域，不遮挡 header/sidebar
 * - 子应用内部 loading 由子应用自己管理
 */
<script setup lang="ts">
import { ref } from 'vue'
import { useLayoutStore } from '@schema-form/business-shared/stores/layout'
import SideMenu from '@/components/SideMenu.vue'
import Breadcrumb from '@/components/Breadcrumb.vue'
import UserDropdown from '@/components/UserDropdown.vue'
import GlobalSearch from '@/components/GlobalSearch.vue'
import SubAppContainer from '@/components/SubAppContainer.vue'
import AppIcon from '@schema-form/platform-shared/components/common/AppIcon.vue'

const layoutStore = useLayoutStore()
layoutStore.restoreCollapsed()

const subAppLoading = ref(true)

// qiankun 子应用挂载完成后关闭 loading
// 通过 MutationObserver 检测 #micro-container 内容变化
function onSubAppMounted() {
  subAppLoading.value = false
}

function toggleCollapse() {
  layoutStore.toggleCollapse()
}
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
        <SubAppContainer
          :loading="subAppLoading"
          @retry="subAppLoading = true"
        />
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

@media (max-width: 900px) {
  .mobileMenuBtn {
    display: flex;
  }
}
</style>
