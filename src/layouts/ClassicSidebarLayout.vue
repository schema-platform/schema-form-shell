/**
 * ClassicSidebarLayout — 带菜单的微应用容器
 *
 * 职责：
 * - 提供 #micro-container 给 qiankun 挂载子应用
 * - 渲染 SideMenu + Header
 * - onMounted 时调用 start() 启动 qiankun
 */
<script setup lang="ts">
import { useLayoutStore } from '@schema-form/business-shared/stores/layout'
import SideMenu from '@/components/SideMenu.vue'
import Breadcrumb from '@/components/Breadcrumb.vue'
import UserDropdown from '@/components/UserDropdown.vue'
import GlobalSearch from '@/components/GlobalSearch.vue'
import AppIcon from '@schema-form/platform-shared/components/common/AppIcon.vue'

const layoutStore = useLayoutStore()
layoutStore.restoreCollapsed()

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
        <div id="micro-container" :class="$style.microContainer"></div>
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

.microContainer {
  width: 100%;
  height: 100%;
}

@media (max-width: 900px) {
  .mobileMenuBtn {
    display: flex;
  }
}
</style>
