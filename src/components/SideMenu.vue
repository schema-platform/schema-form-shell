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
import {
  findNodeByPath,
  menuItemIndex,
  navigateMenuNode,
  resolveActiveMenuIndex,
} from '@/utils/menuRoute'
import AppIcon from '@schema-platform/platform-shared/components/common/AppIcon.vue'

/** 数据库中的图标名 → ICON_MAP 中实际存在的 kebab-case 名称 */
const ICON_FIX: Record<string, string> = {
  editpen: 'edit',
  editpenicon: 'edit',
  homefilled: 'home-filled',
  userfilled: 'user-filled',
  infofilled: 'info-filled',
  successfilled: 'success-filled',
  circlecheckfilled: 'circle-check-filled',
  circleclosefilled: 'circle-close-filled',
  questionfilled: 'question-filled',
  picturefilled: 'picture-filled',
  morefilled: 'more-filled',
  chatdotround: 'chat-dot-round',
}

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
  if (!name) return 'document'
  const fixed = ICON_FIX[name.toLowerCase()]
  if (fixed) return fixed
  return resolveIconName(name)
}

/** 计算 el-menu 的 default-active（菜单 path 唯一，与加载参数分离） */
const activeIndex = computed(() =>
  resolveActiveMenuIndex(route.path, route.query, menuTree.value),
)

/** 菜单点击导航 */
function navigateTo(node: MenuTreeNode): void {
  navigateMenuNode(router, node)
}

function handleSelect(index: string): void {
  const node = findNodeByPath(menuTree.value, index)
  if (node) {
    navigateTo(node)
    return
  }
  const byId = menuTree.value.flatMap(collectNodes).find((n) => n.id === index)
  if (byId) navigateTo(byId)
}

function collectNodes(node: MenuTreeNode): MenuTreeNode[] {
  return [node, ...(node.children?.flatMap(collectNodes) ?? [])]
}

defineExpose({ resetMenu: () => {} })
</script>

<template>
  <aside :class="[$style.sidebar, { [$style.sidebarCollapsed]: collapsed }]">
    <!-- Logo -->
    <div :class="$style.sidebarHeader">
      <router-link to="/" :class="$style.logoArea">
        <div :class="$style.logoIcon">S</div>
        <span v-show="!collapsed" :class="$style.logoText">Schema 业务平台</span>
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
      :key="activeIndex"
      :default-active="activeIndex"
      :collapse="collapsed"
      :collapse-transition="false"
      class="shell-side-menu"
      :class="$style.menuNav"
      @select="handleSelect"
    >
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
            :index="menuItemIndex(child)"
          >
            {{ child.name }}
          </el-menu-item>
        </el-sub-menu>
        <el-menu-item
          v-else
          :index="menuItemIndex(node)"
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

<!-- EP 菜单覆盖：用 scoped + :deep 确保穿透到 EP 内部元素 -->
<style scoped>
.shell-side-menu :deep(.el-menu-item),
.shell-side-menu :deep(.el-sub-menu__title) {
  gap: 10px !important;
}

.shell-side-menu :deep(.el-menu-item svg),
.shell-side-menu :deep(.el-sub-menu__title svg) {
  width: 18px !important;
  height: 18px !important;
  flex-shrink: 0;
}
</style>
