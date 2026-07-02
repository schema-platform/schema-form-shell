<script setup lang="ts">
/**
 * SH-02 — GlobalSearch：搜索菜单并跳转
 */
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useMenuStore } from '@/stores/menu'
import type { MenuTreeNode } from '@/types/menu'
import AppIcon from '@schema-platform/platform-shared/components/common/AppIcon.vue'

const router = useRouter()
const menuStore = useMenuStore()
const { menuTree } = storeToRefs(menuStore)

const searchQuery = ref('')
const isExpanded = ref(false)

interface FlatMenuItem {
  id: string
  name: string
  path: string
  routeType?: MenuTreeNode['routeType']
  schemaId?: string | null
  microAppId?: string | null
}

function flattenMenus(nodes: MenuTreeNode[], acc: FlatMenuItem[] = []): FlatMenuItem[] {
  for (const node of nodes) {
    if (node.path && node.type === 'menu') {
      acc.push({
        id: node.id,
        name: node.name,
        path: node.path,
        routeType: node.routeType,
        schemaId: node.schemaId,
        microAppId: node.microAppId,
      })
    }
    if (node.children?.length) flattenMenus(node.children, acc)
  }
  return acc
}

const flatMenus = computed(() => flattenMenus(menuTree.value))

const results = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return []
  return flatMenus.value.filter((m) => {
    const haystack = `${m.name} ${m.path} ${m.microAppId ?? ''}`.toLowerCase()
    return haystack.includes(q)
  }).slice(0, 12)
})

function toggleSearch(): void {
  isExpanded.value = !isExpanded.value
  if (!isExpanded.value) searchQuery.value = ''
}

function navigate(item: FlatMenuItem): void {
  if (item.routeType === 'schema' && item.schemaId) {
    router.push({ path: item.path || '/app/editor/view', query: { id: item.schemaId } })
  } else if (item.microAppId && item.path) {
    router.push(item.path)
  } else if (item.path) {
    router.push(item.path)
  }
  searchQuery.value = ''
  isExpanded.value = false
}

function onSelect(name: string): void {
  const item = results.value.find((r) => r.name === name)
  if (item) navigate(item)
}
</script>

<template>
  <div :class="$style.searchWrapper">
    <el-select
      v-if="isExpanded"
      v-model="searchQuery"
      filterable
      remote
      :remote-method="(q: string) => { searchQuery = q }"
      placeholder="搜索菜单 / 流程 / Schema..."
      :class="$style.searchInput"
      size="small"
      default-first-option
      @change="onSelect"
      @blur="isExpanded = false"
    >
      <el-option
        v-for="item in results"
        :key="item.id"
        :label="item.name"
        :value="item.name"
      />
    </el-select>
    <el-button
      v-else
      text
      size="small"
      @click="toggleSearch"
    >
      <AppIcon name="search" />
    </el-button>
  </div>
</template>

<style module>
.searchWrapper {
  display: flex;
  align-items: center;
}

.searchInput {
  width: 220px;
}
</style>
