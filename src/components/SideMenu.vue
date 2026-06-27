/**
 * SideMenu -- sidebar menu component
 *
 * 数据来源：/api/menus/route（后端 Menu 集合）
 * 前端只负责渲染，不拼凑菜单数据
 */
<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMenu } from '@/composables/useMenu'
import { resolveIconName } from '@schema-platform/platform-shared/utils/iconResolver'
import type { MenuTreeNode } from '@/types/menu'
import AppIcon from '@schema-platform/platform-shared/components/common/AppIcon.vue'

defineProps<{
  collapsed: boolean
}>()

const emit = defineEmits<{
  toggleCollapse: []
}>()

const route = useRoute()
const router = useRouter()
const { menuTree, loading: menuLoading, error: menuError, fetchMenus } = useMenu()

fetchMenus()

function resolveIcon(name?: string): string {
  return resolveIconName(name)
}

/** 计算 el-menu 的 default-active */
const activeIndex = computed(() => {
  const p = route.path
  const q = route.query
  if (p.includes('/editor/view') && q.id) {
    const node = findNodeBySchemaId(menuTree.value, q.id as string)
    if (node?.path) return node.path
  }
  return p
})

function findNodeBySchemaId(nodes: MenuTreeNode[], schemaId: string): MenuTreeNode | undefined {
  for (const node of nodes) {
    if (node.schemaId === schemaId) return node
    if (node.children?.length) {
      const found = findNodeBySchemaId(node.children, schemaId)
      if (found) return found
    }
  }
  return undefined
}

/** 菜单点击导航 */
function navigateTo(node: MenuTreeNode): void {
  const routeType = node.routeType || 'micro-app'

  if (routeType === 'schema') {
    if (node.schemaId) {
      router.push(`/app/editor/view?id=${node.schemaId}`)
    }
    return
  }

  if (routeType === 'link') {
    const url = node.url || node.path
    if (!url) return
    if (node.target === '_blank') {
      window.open(url, '_blank')
    } else {
      window.location.href = url
    }
    return
  }

  // micro-app — 路径由服务端直接返回
  if (!node.path) return
  if (node.target === '_blank') {
    const resolved = router.resolve(node.path)
    window.open(resolved.href, '_blank')
  } else {
    router.push(node.path)
  }
}

function handleSelect(index: string): void {
  const node = findNodeByPath(menuTree.value, index)
  if (node) navigateTo(node)
}

function findNodeByPath(nodes: MenuTreeNode[], path: string): MenuTreeNode | undefined {
  for (const node of nodes) {
    if (node.path === path) return node
    if (node.children?.length) {
      const found = findNodeByPath(node.children, path)
      if (found) return found
    }
  }
  return undefined
}

defineExpose({ resetMenu: () => {} })
</script>

<template>
  <aside :class="[$style.sidebar, { [$style.sidebarCollapsed]: collapsed }]">
    <!-- Logo -->
    <div :class="$style.sidebarHeader">
      <router-link to="/" :class="$style.logoArea">
        <div :class="$style.logoIcon">S</div>
        <span v-show="!collapsed" :class="$style.logoText">表单设计器</span>
      </router-link>
    </div>

    <!-- Loading -->
    <div v-if="menuLoading" :class="$style.menuLoading">
      <AppIcon name="loading" :size="20" :class="$style.spinIcon" />
      <span v-show="!collapsed">加载中...</span>
    </div>

    <!-- Error -->
    <div v-else-if="menuError" :class="$style.menuError">
      <span v-show="!collapsed">{{ menuError }}</span>
      <el-button type="primary" text size="small" @click="fetchMenus">重试</el-button>
    </div>

    <!-- Menu -->
    <el-menu
      v-else
      :default-active="activeIndex"
      :collapse="collapsed"
      :collapse-transition="false"
      :class="$style.menuNav"
      @select="handleSelect"
    >
      <!-- 首页 -->
      <el-menu-item index="/">
        <AppIcon name="home-filled" :size="18" />
        <template #title>首页</template>
      </el-menu-item>

      <!-- 动态菜单树（完全来自服务器） -->
      <template v-for="node in menuTree" :key="node.id">
        <el-sub-menu
          v-if="node.children?.length && node.target !== '_blank'"
          :index="node.path || node.id"
        >
          <template #title>
            <AppIcon :name="resolveIcon(node.icon)" :size="18" />
            <span>{{ node.name }}</span>
          </template>
          <el-menu-item
            v-for="child in node.children"
            :key="child.id"
            :index="child.path || child.id"
          >
            {{ child.name }}
          </el-menu-item>
        </el-sub-menu>
        <el-menu-item
          v-else
          :index="node.path || node.id"
        >
          <AppIcon :name="resolveIcon(node.icon)" :size="18" />
          <template #title>{{ node.name }}</template>
        </el-menu-item>
      </template>
    </el-menu>

    <!-- Collapse button -->
    <div :class="$style.sidebarFooter" @click="emit('toggleCollapse')">
      <AppIcon :name="collapsed ? 'expand' : 'fold'" :size="16" />
      <span v-show="!collapsed" :class="$style.collapseText">折叠</span>
    </div>
  </aside>
</template>

<style module>
.sidebar {
  width: 240px;
  height: 100vh;
  background: var(--el-menu-bg-color, var(--el-fill-color-blank));
  display: flex;
  flex-direction: column;
  transition: width 0.25s ease-in-out;
  overflow: hidden;
  flex-shrink: 0;
  border-right: 1px solid var(--el-menu-border-color, var(--el-border-color));
}

.sidebarCollapsed {
  width: 64px;
}

.sidebarHeader {
  height: 56px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  border-bottom: 1px solid var(--el-border-color-light);
  flex-shrink: 0;
}

.logoArea {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  overflow: hidden;
}

.logoIcon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: var(--el-color-primary);
  color: var(--el-color-white, #fff);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
  flex-shrink: 0;
}

.logoText {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  white-space: nowrap;
}

.menuNav {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  border-right: none;
}

.menuNav::-webkit-scrollbar {
  width: 4px;
}

.menuNav::-webkit-scrollbar-thumb {
  background: var(--el-border-color-light);
  border-radius: 2px;
}

.menuLoading,
.menuError {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.spinIcon {
  animation: spin 1s linear infinite;
  color: var(--el-color-primary);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.sidebarFooter {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--el-text-color-secondary);
  cursor: pointer;
  border-top: 1px solid var(--el-border-color-light);
  flex-shrink: 0;
  transition: all 0.15s ease;
}

.sidebarFooter:hover {
  color: var(--el-text-color-primary);
  background: var(--el-fill-color-light);
}

.collapseText {
  font-size: 12px;
  white-space: nowrap;
}
</style>
