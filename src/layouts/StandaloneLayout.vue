/**
 * StandaloneLayout — 不带菜单的微应用容器
 *
 * 全屏无 chrome，容器 ID: standalone-container
 */
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Loading } from '@element-plus/icons-vue'
import { ensureStarted } from '@/utils/qiankunStarted'

const loading = ref(true)

// 监听子应用挂载完成
let observer: MutationObserver | null = null

onMounted(() => {
  ensureStarted()

  // 通过 MutationObserver 检测 micro-container 内容变化
  const container = document.getElementById('micro-container')
  if (container) {
    observer = new MutationObserver(() => {
      if (container.children.length > 0) {
        loading.value = false
        observer?.disconnect()
      }
    })
    observer.observe(container, { childList: true })
  }
})

onUnmounted(() => {
  observer?.disconnect()
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
