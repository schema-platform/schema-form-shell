/**
 * MicroAppManageView — 微前端子应用管理界面
 *
 * 展示所有注册的子应用（内置 + 服务端），支持：
 * - 查看子应用状态、配置
 * - 手动刷新服务端配置
 * - 子应用入口快速跳转
 */
<script setup lang="ts">
import { computed } from 'vue'
import { useMicroAppStore, BUILTIN_APPS } from '@/stores/microApp'
import AppIcon from '@schema-form/platform-shared/components/common/AppIcon.vue'

const microAppStore = useMicroAppStore()

const builtinNames = computed(() => new Set(BUILTIN_APPS.map(b => b.name)))

function refreshServer() {
  microAppStore.fetchApps()
}

function openApp(name: string) {
  window.open(`/schema-platform/app/${name}/`, '_blank')
}
</script>

<template>
  <div :class="$style.container">
    <div :class="$style.header">
      <h1 :class="$style.title">微应用管理</h1>
      <el-button type="primary" :loading="!microAppStore.serverLoaded" @click="refreshServer">
        <AppIcon name="refresh" :size="16" />
        刷新服务端配置
      </el-button>
    </div>

    <p :class="$style.desc">
      子应用注册策略：内置静态配置（启动即用）+ 服务端拉取（动态覆盖）。
      内置应用在无网络时仍可独立访问。
    </p>

    <!-- 统计卡片 -->
    <div :class="$style.stats">
      <div :class="$style.statCard">
        <div :class="$style.statValue">{{ microAppStore.allApps.length }}</div>
        <div :class="$style.statLabel">总子应用</div>
      </div>
      <div :class="$style.statCard">
        <div :class="$style.statValue">{{ BUILTIN_APPS.length }}</div>
        <div :class="$style.statLabel">内置应用</div>
      </div>
      <div :class="$style.statCard">
        <div :class="$style.statValue">{{ microAppStore.serverLoaded ? microAppStore.apps.length : '...' }}</div>
        <div :class="$style.statLabel">服务端配置</div>
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
        v-for="app in microAppStore.allApps"
        :key="app.name"
        :class="$style.appCard"
      >
        <div :class="$style.appHeader">
          <div :class="$style.appIcon">
            <AppIcon :name="app.icon || 'box'" :size="28" />
          </div>
          <div :class="$style.appInfo">
            <div :class="$style.appName">{{ app.displayName }}</div>
            <div :class="$style.appId">{{ app.name }}</div>
          </div>
          <el-tag
            :type="builtinNames.has(app.name) ? 'success' : 'info'"
            size="small"
          >
            {{ builtinNames.has(app.name) ? '内置' : '服务端' }}
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
            <span :class="$style.metaLabel">状态</span>
            <el-tag :type="app.status === 'active' ? 'success' : 'danger'" size="small">
              {{ app.status === 'active' ? '活跃' : '停用' }}
            </el-tag>
          </div>
        </div>

        <div :class="$style.appActions">
          <el-button
            type="primary"
            size="small"
            :disabled="app.status !== 'active'"
            @click="openApp(app.name)"
          >
            打开
          </el-button>
        </div>
      </div>
    </div>
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
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-color-primary);
  margin: 0;
}

.desc {
  font-size: 14px;
  color: var(--text-color-secondary);
  margin: 0 0 24px 0;
  line-height: 1.6;
}

.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
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
}

.appId {
  font-size: 12px;
  color: var(--text-color-secondary);
  font-family: monospace;
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
}

.appActions {
  display: flex;
  justify-content: flex-end;
}
</style>
