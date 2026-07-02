<script setup lang="ts">
/** SH-03 — 顶栏消息铃铛，对接 S-04 /api/business/notifications */
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import AppIcon from '@schema-platform/platform-shared/components/common/AppIcon.vue'
import {
  fetchNotifications,
  fetchUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
  type BusinessNotification,
} from '@/api/notificationApi'

const router = useRouter()
const visible = ref(false)
const unreadCount = ref(0)
const items = ref<BusinessNotification[]>([])
const loading = ref(false)
let pollTimer: ReturnType<typeof setInterval> | null = null

async function refreshCount() {
  try {
    const res = await fetchUnreadCount()
    unreadCount.value = res.count ?? 0
  } catch {
    /* auth not ready */
  }
}

async function loadList() {
  loading.value = true
  try {
    const res = await fetchNotifications({ page: 1, pageSize: 10 })
    items.value = res.items ?? []
    unreadCount.value = res.unreadCount ?? unreadCount.value
  } finally {
    loading.value = false
  }
}

async function onVisibleChange(open: boolean) {
  visible.value = open
  if (open) await loadList()
}

async function onItemClick(item: BusinessNotification) {
  if (!item.isRead) {
    await markNotificationRead(item._id)
    item.isRead = true
    unreadCount.value = Math.max(0, unreadCount.value - 1)
  }
  visible.value = false
  if (item.relatedType === 'task' && item.relatedId) {
    router.push('/app/flow/tasks')
  }
}

async function onReadAll() {
  await markAllNotificationsRead()
  unreadCount.value = 0
  items.value = items.value.map((i) => ({ ...i, isRead: true }))
}

onMounted(() => {
  void refreshCount()
  pollTimer = setInterval(() => { void refreshCount() }, 60_000)
})

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer)
})
</script>

<template>
  <el-popover
    :visible="visible"
    placement="bottom-end"
    :width="320"
    trigger="click"
    @update:visible="onVisibleChange"
  >
    <template #reference>
      <el-badge :value="unreadCount || undefined" :hidden="unreadCount === 0" :class="$style.badge">
        <el-button text size="small" :class="$style.btn">
          <AppIcon name="bell" />
        </el-button>
      </el-badge>
    </template>
    <div :class="$style.panel">
      <div :class="$style.panelHead">
        <span>消息通知</span>
        <el-button link type="primary" size="small" @click="onReadAll">全部已读</el-button>
      </div>
      <div v-if="loading" :class="$style.empty">加载中...</div>
      <ul v-else-if="items.length" :class="$style.list">
        <li
          v-for="item in items"
          :key="item._id"
          :class="[$style.item, !item.isRead && $style.unread]"
          @click="onItemClick(item)"
        >
          <div :class="$style.itemTitle">{{ item.title }}</div>
          <div :class="$style.itemContent">{{ item.content }}</div>
        </li>
      </ul>
      <div v-else :class="$style.empty">暂无消息</div>
    </div>
  </el-popover>
</template>

<style module>
.badge { display: inline-flex; }
.btn { padding: 4px 8px; }
.panel { max-height: 360px; overflow: auto; }
.panelHead {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-weight: 600;
}
.list { list-style: none; margin: 0; padding: 0; }
.item {
  padding: 8px 4px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  cursor: pointer;
}
.item:hover { background: var(--el-fill-color-light); }
.unread { background: var(--el-color-primary-light-9); }
.itemTitle { font-size: 13px; font-weight: 500; }
.itemContent {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.empty {
  padding: 24px;
  text-align: center;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}
</style>
