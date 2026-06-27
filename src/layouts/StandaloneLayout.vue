/**
 * StandaloneLayout — 不带菜单的微应用容器
 *
 * 全屏无 chrome，仅子应用区域 loading
 */
<script setup lang="ts">
import { ref } from 'vue'
import SubAppContainer from '@/components/SubAppContainer.vue'

const subAppLoading = ref(true)
</script>

<template>
  <div :class="$style.standalone">
    <SubAppContainer
      :loading="subAppLoading"
      @retry="subAppLoading = true"
    />
  </div>
</template>

<style module>
.standalone {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: var(--bg-color-page);
}
</style>
