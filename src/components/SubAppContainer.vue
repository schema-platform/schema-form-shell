/**
 * SubAppContainer — 子应用渲染容器
 *
 * 双容器策略：
 * - qiankun 挂载点（#micro-container）
 * - Loading overlay 仅覆盖子应用区域，不遮挡 shell header/sidebar
 * - 子应用内部 loading 由子应用自己管理，此组件只处理 qiankun 加载阶段
 *
 * 设计原则：
 * - 全局 loading 仅在子应用区域显示（qiankun mount 阶段）
 * - 子应用内部数据加载由子应用自己的 loading 组件处理
 * - 两种 loading 不重叠
 */
<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import AppIcon from '@schema-form/platform-shared/components/common/AppIcon.vue'

const props = withDefaults(defineProps<{
  /** 是否正在加载子应用（qiankun mount 阶段） */
  loading?: boolean
  /** 加载超时时间（ms），超时后显示重试 */
  timeout?: number
}>(), {
  loading: false,
  timeout: 15000,
})

const emit = defineEmits<{
  retry: []
}>()

const showLoading = ref(false)
const timedOut = ref(false)
let timer: ReturnType<typeof setTimeout> | null = null

watch(() => props.loading, (val) => {
  if (val) {
    showLoading.value = true
    timedOut.value = false
    timer = setTimeout(() => {
      timedOut.value = true
    }, props.timeout)
  } else {
    showLoading.value = false
    timedOut.value = false
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }
}, { immediate: true })

onMounted(() => {
  if (timer) clearTimeout(timer)
})

function handleRetry() {
  timedOut.value = false
  emit('retry')
}
</script>

<template>
  <div :class="$style.container">
    <!-- qiankun 挂载点 -->
    <div id="micro-container" :class="$style.mountPoint" />

    <!-- Shell 级 loading（仅 qiankun mount 阶段，子应用内部 loading 不触发此层） -->
    <Transition name="subapp-fade">
      <div v-if="showLoading" :class="$style.overlay">
        <div :class="$style.loadingContent">
          <AppIcon name="loading" :size="32" :class="$style.spinIcon" />
          <span :class="$style.loadingText">加载子应用...</span>
          <el-button
            v-if="timedOut"
            type="primary"
            size="small"
            :class="$style.retryBtn"
            @click="handleRetry"
          >
            加载超时，点击重试
          </el-button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style module>
.container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.mountPoint {
  width: 100%;
  height: 100%;
}

.overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-color-page, #f5f7fa);
  z-index: 100;
  pointer-events: auto;
}

.loadingContent {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.spinIcon {
  animation: subapp-spin 1s linear infinite;
  color: var(--el-color-primary);
}

@keyframes subapp-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.loadingText {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.retryBtn {
  margin-top: 8px;
}
</style>

<style scoped>
.subapp-fade-enter-active,
.subapp-fade-leave-active {
  transition: opacity 0.3s ease;
}
.subapp-fade-enter-from,
.subapp-fade-leave-to {
  opacity: 0;
}
</style>
