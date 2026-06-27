/**
 * HomeView — 首页
 *
 * 展示所有可用子应用（从 microAppStore.allApps 读取）
 * 支持动态菜单配置
 */
<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useMicroAppStore } from '@/stores/microApp'
import AppIcon from '@schema-form/platform-shared/components/common/AppIcon.vue'

const router = useRouter()
const microAppStore = useMicroAppStore()

function openApp(name: string) {
  router.push(`/app/${name}/`)
}
</script>

<template>
  <div :class="$style.container">
    <h1 :class="$style.title">表单设计器平台</h1>
    <p :class="$style.subtitle">低代码表单引擎与流程引擎</p>

    <div :class="$style.grid">
      <div
        v-for="app in microAppStore.allApps"
        :key="app.name"
        :class="$style.card"
        @click="openApp(app.name)"
      >
        <div :class="$style.icon">
          <AppIcon :name="app.icon || 'box'" :size="48" />
        </div>
        <h3 :class="$style.cardTitle">{{ app.displayName }}</h3>
        <p :class="$style.cardDesc">
          {{ app.name === 'editor' ? '可视化设计表单，支持多种组件和布局' :
             app.name === 'flow' ? 'BPMN 流程编排，支持审批、自动化' :
             app.name === 'ai' ? 'AI 对话式生成表单和流程' :
             `子应用: ${app.name}` }}
        </p>
      </div>
    </div>

    <!-- 管理入口 -->
    <div :class="$style.manageEntry">
      <el-button text type="primary" @click="router.push('/admin/micro-apps')">
        <AppIcon name="setting" :size="16" />
        微应用管理
      </el-button>
    </div>
  </div>
</template>

<style module>
.container {
  padding: 40px;
  max-width: 1200px;
  margin: 0 auto;
}

.title {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-color-primary);
  margin: 0 0 8px 0;
}

.subtitle {
  font-size: 16px;
  color: var(--text-color-secondary);
  margin: 0 0 40px 0;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
}

.card {
  background: var(--bg-color-white);
  border: 1px solid var(--border-color-light);
  border-radius: 12px;
  padding: 24px;
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
  border-color: var(--color-primary);
}

.icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.cardTitle {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-color-primary);
  margin: 0 0 8px 0;
}

.cardDesc {
  font-size: 14px;
  color: var(--text-color-secondary);
  margin: 0;
  line-height: 1.6;
}

.manageEntry {
  margin-top: 32px;
  text-align: center;
}
</style>
