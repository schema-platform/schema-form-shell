/**
 * MicroAppManageView — 微前端子应用管理界面
 *
 * 分页列表展示，支持 CRUD、启停用、跳转
 */
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useMicroAppStore, BUILTIN_APPS } from '@/stores/microApp'
import {
  fetchAllMicroApps,
  deleteMicroApp,
  toggleMicroAppStatus,
  type MicroAppConfig,
} from '@/api/microAppApi'
import MicroAppEditDialog from '@/components/MicroAppEditDialog.vue'
import AppIcon from '@schema-platform/platform-shared/components/common/AppIcon.vue'
import ConfirmDialog from '@schema-platform/platform-shared/components/common/ConfirmDialog.vue'

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

// ── 确认对话框 ──

const confirmVisible = ref(false)
const confirmLoading = ref(false)
const confirmTitle = ref('')
const confirmMessage = ref('')
const confirmType = ref<'warning' | 'danger'>('warning')
let confirmAction: (() => Promise<void>) | null = null

function openConfirm(title: string, message: string, type: 'warning' | 'danger', action: () => Promise<void>) {
  confirmTitle.value = title
  confirmMessage.value = message
  confirmType.value = type
  confirmAction = action
  confirmVisible.value = true
}

async function handleConfirm() {
  if (!confirmAction) return
  confirmLoading.value = true
  try {
    await confirmAction()
    confirmVisible.value = false
  } catch (err: unknown) {
    ElMessage.error(err instanceof Error ? err.message : '操作失败')
  } finally {
    confirmLoading.value = false
    confirmAction = null
  }
}

// ── CRUD 操作 ──

async function refreshServer() {
  try {
    await microAppStore.fetchApps()
    const allApps = await fetchAllMicroApps()
    serverApps.value = allApps
  } catch {
    ElMessage.error('刷新失败')
  }
}

function handleToggleStatus(app: MicroAppConfig & { isBuiltin: boolean }) {
  if (app.isBuiltin) return
  const newStatus = app.status === 'active' ? 'inactive' : 'active'
  const label = newStatus === 'active' ? '启用' : '停用'

  openConfirm(
    '确认操作',
    `确定要${label}「${app.displayName}」吗？`,
    'warning',
    async () => {
      await toggleMicroAppStatus(app.id, newStatus)
      ElMessage.success(`已${label}`)
      await refreshServer()
    },
  )
}

function handleDelete(app: MicroAppConfig & { isBuiltin: boolean }) {
  if (app.isBuiltin) {
    ElMessage.warning('内置应用不可删除')
    return
  }

  openConfirm(
    '确认删除',
    `确定要删除「${app.displayName}」吗？此操作不可恢复。`,
    'danger',
    async () => {
      await deleteMicroApp(app.id)
      ElMessage.success('已删除')
      await refreshServer()
    },
  )
}

function openApp(app: MicroAppConfig & { isBuiltin?: boolean }) {
  const prefix = app.layout === 'without-menu' ? 'standalone' : 'app'
  window.open(`/schema-platform/${prefix}/${app.name}/`, '_blank')
}

// ── 数据源 ──

const serverApps = ref<MicroAppConfig[]>([])

const displayApps = computed(() => {
  const builtinNameSet = builtinNames.value
  const merged = new Map<string, MicroAppConfig & { isBuiltin: boolean }>()

  for (const s of serverApps.value) {
    merged.set(s.name, { ...s, isBuiltin: builtinNameSet.has(s.name) })
  }

  for (const b of BUILTIN_APPS) {
    if (!merged.has(b.name)) {
      merged.set(b.name, {
        id: `builtin-${b.name}`,
        name: b.name,
        displayName: b.name,
        url: '',
        icon: 'box',
        layout: 'without-menu',
        activeRule: `/schema-platform/${b.name}`,
        permissions: [],
        status: 'active',
        sort: 100,
        isBuiltin: true,
      })
    }
  }

  return Array.from(merged.values()).sort((a, b) => a.sort - b.sort)
})

// ── 分页 ──

const currentPage = ref(1)
const pageSize = ref(10)

const pagedApps = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return displayApps.value.slice(start, start + pageSize.value)
})

function handlePageChange(page: number) {
  currentPage.value = page
}

function handleSizeChange(size: number) {
  pageSize.value = size
  currentPage.value = 1
}

// ── 统计 ──

const stats = computed(() => ({
  total: displayApps.value.length,
  builtin: BUILTIN_APPS.length,
  server: serverApps.value.length,
  active: displayApps.value.filter(a => a.status === 'active').length,
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

    <!-- 分页列表 -->
    <el-table :data="pagedApps" :class="$style.table" stripe>
      <el-table-column label="应用" min-width="280">
        <template #default="{ row }">
          <div :class="$style.appCell">
            <AppIcon :name="row.icon || 'box'" :size="20" :class="$style.cellIcon" />
            <div :class="$style.appCellInfo">
              <div :class="$style.appCellName">
                {{ row.displayName }}
                <el-tag v-if="row.isBuiltin" type="success" size="small">内置</el-tag>
                <el-tag v-else type="info" size="small">服务端</el-tag>
              </div>
              <div :class="$style.appCellId">{{ row.name }}</div>
            </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="布局" width="100">
        <template #default="{ row }">
          {{ row.layout === 'with-menu' ? '带菜单' : '独立全屏' }}
        </template>
      </el-table-column>

      <el-table-column label="激活规则" min-width="240">
        <template #default="{ row }">
          <span :class="$style.monoText">{{ row.activeRule }}</span>
        </template>
      </el-table-column>

      <el-table-column label="状态" width="80" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 'active' ? 'success' : 'danger'" size="small">
            {{ row.status === 'active' ? '启用' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="排序" width="70" align="center" prop="sort" />

      <el-table-column label="操作" width="150" align="center" fixed="right">
        <template #default="{ row }">
          <el-button
            type="primary"
            text
            size="small"
            :disabled="row.status !== 'active'"
            @click="openApp(row)"
          >
            打开
          </el-button>
          <el-button
            v-if="!row.isBuiltin"
            type="primary"
            text
            size="small"
            @click="openEdit(row)"
          >
            编辑
          </el-button>
          <el-button
            v-if="!row.isBuiltin"
            :type="row.status === 'active' ? 'warning' : 'success'"
            text
            size="small"
            @click="handleToggleStatus(row)"
          >
            {{ row.status === 'active' ? '停用' : '启用' }}
          </el-button>
          <el-button
            v-if="!row.isBuiltin"
            type="danger"
            text
            size="small"
            @click="handleDelete(row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div :class="$style.pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="displayApps.length"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </div>

    <!-- 编辑对话框 -->
    <MicroAppEditDialog
      v-model:visible="dialogVisible"
      :app="editingApp"
      @saved="handleSaved"
    />

    <!-- 确认对话框 -->
    <ConfirmDialog
      v-model:model-value="confirmVisible"
      :title="confirmTitle"
      :message="confirmMessage"
      :type="confirmType"
      :loading="confirmLoading"
      @confirm="handleConfirm"
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

.table {
  width: 100%;
}

.appCell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cellIcon {
  color: var(--color-primary);
  flex-shrink: 0;
}

.appCellInfo {
  min-width: 0;
}

.appCellName {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-color-primary);
  display: flex;
  align-items: center;
  gap: 6px;
}

.appCellId {
  font-size: 12px;
  color: var(--text-color-secondary);
  font-family: monospace;
}

.monoText {
  font-family: monospace;
  font-size: 12px;
  color: var(--text-color-regular);
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
