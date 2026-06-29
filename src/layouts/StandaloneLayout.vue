/**
 * StandaloneLayout — 不带菜单的微应用容器
 *
 * 全屏无 chrome，容器 ID: standalone-container
 */
<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { Loading } from '@element-plus/icons-vue'
import { start as qiankunStart } from 'qiankun'
import { shellLog } from '@schema-platform/platform-shared/utils/logger'
import { useMicroAppStore } from '@/stores/microApp'
import { onShellEvent, offShellEvent } from '@/composables/useSubAppProps'

const loading = ref(true)
const microAppStore = useMicroAppStore()

function handleSubAppMounted() {
  shellLog.info('sub-app mounted via event')
  loading.value = false
}

function tryStartQiankun() {
  if (!(window as any).__qiankun_started__ && microAppStore.registered) {
    (window as any).__qiankun_started__ = true
    qiankunStart()
    shellLog.info('qiankun started')
  }
}

onMounted(() => {
  shellLog.info('StandaloneLayout mounted')
  onShellEvent('shell:sub-app-mounted', handleSubAppMounted)
  tryStartQiankun()
  if (!(window as any).__qiankun_started__) {
    const stop = watch(() => microAppStore.registered, (val) => {
      if (val) {
        tryStartQiankun()
        stop()
      }
    })
  }
})

onUnmounted(() => {
  offShellEvent('shell:sub-app-mounted', handleSubAppMounted)
})
</script>

<template>
  <div :class="$style.standalone">
    <div v-if="loading" :class="$style.loadingOverlay">
      <el-icon :class="$style.loadingIcon" :size="32"><Loading /></el-icon>
      <span>加载中...</span>
    </div>
    <div id="micro-container" :class="$style.container" />
  </div>
</template>

<style module>
.standalone {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: var(--bg-color-page);
}

.container {
  width: 100%;
  height: 100%;
}

.loadingOverlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: var(--bg-color-page);
  color: var(--text-color-secondary);
  font-size: 14px;
  z-index: 10;
}

.loadingIcon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>

<!-- 全局：隐藏子应用 index.html 的 #loading -->
<style>
#micro-container #loading {
  display: none !important;
}
</style>
