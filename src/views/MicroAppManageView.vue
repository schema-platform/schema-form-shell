/**
 * MicroAppManageView — 微前端子应用管理界面
 *
 * 功能：
 * - 查看所有子应用（内置 + 服务端）
 * - 创建 / 编辑 / 删除子应用
 * - 启用 / 停用子应用
 * - 刷新服务端配置
 * - 快速跳转到子应用
 */
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useMicroAppStore, BUILTIN_APPS } from '@/stores/microApp'
import {
  fetchAllMicroApps,
  deleteMicroApp,
  toggleMicroAppStatus,
  type MicroAppConfig,
} from '@/api/microAppApi'
import MicroAppEditDialog from '@/components/MicroAppEditDialog.vue'
import AppIcon from '@schema-platform/platform-shared/components/common/AppIcon.vue'

const microAppStore = useMicroAppStore()

const builtinNames = computed(() => new Set(BUILTIN_APPS.map(b => b.name)))

// ── 编辑对话框 ──

const dialogVisible = ref(false)
const editingApp = ref<MicroAppConfig | null>(null)

function openCreate() {
  editingApp.value = null
  dialogVisible.value = true
}

function openEdit(app: MicroAppConfig) {
  editingApp.value = app
  dialogVisible.value = true
}

function handleSaved() {
  refreshServer()
}

// ── CRUD 操作 ──

async function refreshServer() {
  try {
    await microAppStore.fetchApps()
    // 同时拉取全量（含停用）用于管理页展示
    const allApps = await fetchAllMicroApps()
    serverApps.value = allApps
  } catch {
    ElMessage.error('刷新失败')
  }
}

async function handleToggleStatus(app: MicroAppConfig) {
  const newStatus = app.status === 'active' ? 'inactive' : 'active'
  const label = newStatus === 'active' ? '启用' : '停用'

  try {
    await ElMessageBox.confirm(
      `确定要${label}「${app.displayName}」吗？`,
      '确认操作',
      { type: 'warning' },
    )
    await toggleMicroAppStatus(app.id, newStatus)
    ElMessage.success(`已${label}`)
    await refreshServer()
  } catch {
    // 用户取消或操作失败
  }
}

async function handleDelete(app: MicroAppConfig) {
  if (builtinNames.value.has(app.name)) {
    ElMessage.warning('内置应用不可删除')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除「${app.displayName}」吗？此操作不可恢复。`,
      '确认删除',
      { type: 'error', confirmButtonText: '删除', confirmButtonClass: 'el-button--danger' },
    )
    await deleteMicroApp(app.id)
    ElMessage.success('已删除')
    await refreshServer()
  } catch {
    // 用户取消或操作失败
  }
}

function openApp(name: string) {
  window.open(`/schema-platform/app/${name}/`, '_blank')
}

// ── 服务端应用列表（含停用） ──

const serverApps = ref<MicroAppConfig[]>([])

/** 合并展示列表：内置 + 服务端（去重） */
const displayApps = computed(() => {
  const merged = new Map<string, MicroAppConfig & { isBuiltin: boolean }>()

  // 内置
  for (const b of BUILTIN_APPS) {
    merged.set(b.name, {
      id: `builtin-${b.name}`,
      name: b.name,
      displayName: b.displayName,
      url: '',
      icon: b.icon,
      layout: b.layout,
      activeRule: b.activeRule,
      permissions: [],
      status: 'active',
      sort: b.sort,
      isBuiltin: true,
    })
  }

  // 服务端覆盖
  for (const s of serverApps.value) {
    merged.set(s.name, { ...s, isBuiltin: builtinNames.value.has(s.name) })
  }

  return Array.from(merged.values()).sort((a, b) => a.sort - b.sort)
})

// ── 统计 ──

const stats = computed(() => ({
  total: displayApps.value.length,
  builtin: BUILTIN_APPS.length,
  server: serverApps.value.length,
  active: displayApps.value.filter(a => a.status === 'active').length,
  inactive: displayApps.value.filter(a => a.status === 'inactive').length,
}))

onMounted(() => {
  refreshServer()
})
</script>

<template>
  <div :class="$style.container">
    <!-- 头部 -->
    <div :class="$style.header">
      <div :class="$style.headerLeft">
        <h1 :class="$style.title">微应用管理</h1>
        <p :class="$style.desc">
          管理所有注册的子应用。内置应用启动即用，服务端应用支持动态增删改。
        </p>
      </div>
      <div :class="$style.headerActions">
        <el-button @click="refreshServer">
          <AppIcon name="refresh" :size="16" />
          刷新
        </el-button>
        <el-button type="primary" @click="openCreate">
          <AppIcon name="plus" :size="16" />
          创建子应用
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div :class="$style.stats">
      <div :class="$style.statCard">
        <div :class="$style.statValue">{{ stats.total }}</div>
        <div :class="$style.statLabel">总子应用</div>
      </div>
      <div :class="$style.statCard">
        <div :class="$style.statValue">{{ stats.builtin }}</div>
        <div :class="$style.statLabel">内置应用</div>
      </div>
      <div :class="$style.statCard">
        <div :class="$style.statValue">{{ stats.server }}</div>
        <div :class="$style.statLabel">服务端配置</div>
      </div>
      <div :class="$style.statCard">
        <div :class="$style.statValue">{{ stats.active }}</div>
        <div :class="$style.statLabel">已启用</div>
      </div>
    </div>

    <!-- 错误提示 -->
    <el-alert
      v-if="microAppStore.error"
      type="warning"
      :title="microAppStore.error"
      show-icon
      :closable="false"
      :class="$style.alert"
    />

    <!-- 子应用列表 -->
    <div :class="$style.appGrid">
      <div
        v-for="app in displayApps"
        :key="app.name"
        :class="[$style.appCard, { [$style.appInactive]: app.status === 'inactive' }]"
      >
        <div :class="$style.appHeader">
          <div :class="$style.appIcon">
            <AppIcon :name="app.icon || 'box'" :size="28" />
          </div>
          <div :class="$style.appInfo">
            <div :class="$style.appName">
              {{ app.displayName }}
              <el-tag
                v-if="(app as any).isBuiltin"
                type="success"
                size="small"
                :class="$style.tag"
              >
                内置
              </el-tag>
              <el-tag
                v-else
                type="info"
                size="small"
                :class="$style.tag"
              >
                服务端
              </el-tag>
            </div>
            <div :class="$style.appId">{{ app.name }}</div>
          </div>
          <el-tag
            :type="app.status === 'active' ? 'success' : 'danger'"
            size="small"
          >
            {{ app.status === 'active' ? '启用' : '停用' }}
          </el-tag>
        </div>

        <div :class="$style.appMeta">
          <div :class="$style.metaRow">
            <span :class="$style.metaLabel">布局</span>
            <span>{{ app.layout === 'with-menu' ? '带菜单' : '独立全屏' }}</span>
          </div>
          <div :class="$style.metaRow">
            <span :class="$style.metaLabel">激活规则</span>
            <span :class="$style.monoText">{{ app.activeRule }}</span>
          </div>
          <div :class="$style.metaRow">
            <span :class="$style.metaLabel">排序</span>
            <span>{{ app.sort }}</span>
          </div>
        </div>

        <div :class="$style.appActions">
          <el-button
            type="primary"
            text
            size="small"
            :disabled="app.status !== 'active'"
            @click="openApp(app.name)"
          >
            打开
          </el-button>
          <el-button
            v-if="!(app as any).isBuiltin"
            type="primary"
            text
            size="small"
            @click="openEdit(app)"
          >
            编辑
          </el-button>
          <el-button
            v-if="!(app as any).isBuiltin"
            :type="app.status === 'active' ? 'warning' : 'success'"
            text
            size="small"
            @click="handleToggleStatus(app)"
          >
            {{ app.status === 'active' ? '停用' : '启用' }}
          </el-button>
          <el-button
            v-if="!(app as any).isBuiltin"
            type="danger"
            text
            size="small"
            @click="handleDelete(app)"
          >
            删除
          </el-button>
        </div>
      </div>
    </div>

    <!-- 编辑对话框 -->
    <MicroAppEditDialog
      v-model:visible="dialogVisible"
      :app="editingApp"
      @saved="handleSaved"
    />
  </div>
</template>

<style module>
.container {
  padding: 32px;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
  gap: 16px;
}

.headerLeft {
  flex: 1;
  min-width: 0;
}

.headerActions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-color-primary);
  margin: 0 0 4px 0;
}

.desc {
  font-size: 14px;
  color: var(--text-color-secondary);
  margin: 0;
  line-height: 1.6;
}

.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.statCard {
  background: var(--bg-color-white);
  border: 1px solid var(--border-color-light);
  border-radius: 8px;
  padding: 20px;
  text-align: center;
}

.statValue {
  font-size: 32px;
  font-weight: 700;
  color: var(--color-primary);
}

.statLabel {
  font-size: 13px;
  color: var(--text-color-secondary);
  margin-top: 4px;
}

.alert {
  margin-bottom: 24px;
}

.appGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 16px;
}

.appCard {
  background: var(--bg-color-white);
  border: 1px solid var(--border-color-light);
  border-radius: 12px;
  padding: 20px;
  transition: box-shadow 0.2s ease;
}

.appCard:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.appInactive {
  opacity: 0.65;
}

.appHeader {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.appIcon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: var(--el-fill-color-light);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
  flex-shrink: 0;
}

.appInfo {
  flex: 1;
  min-width: 0;
}

.appName {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-color-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.tag {
  flex-shrink: 0;
}

.appId {
  font-size: 12px;
  color: var(--text-color-secondary);
  font-family: monospace;
  margin-top: 2px;
}

.appMeta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
  padding: 12px;
  background: var(--el-fill-color-lighter);
  border-radius: 8px;
}

.metaRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
}

.metaLabel {
  color: var(--text-color-secondary);
}

.monoText {
  font-family: monospace;
  font-size: 12px;
  color: var(--text-color-regular);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 200px;
}

.appActions {
  display: flex;
  justify-content: flex-end;
  gap: 4px;
  flex-wrap: wrap;
}
</style>
