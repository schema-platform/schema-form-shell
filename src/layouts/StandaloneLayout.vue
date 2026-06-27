/**
 * StandaloneLayout — 不带菜单的微应用容器
 *
 * 职责：
 * - 提供 #micro-container 给 qiankun 挂载子应用
 * - 全屏无 chrome
 * - onMounted 时调用 start() 启动 qiankun
 */
<script setup lang="ts">
</script>

<template>
  <div :class="$style.standalone">
    <div id="micro-container" :class="$style.microContainer"></div>
  </div>
</template>

<style module>
.standalone {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: var(--bg-color-page);
}

.microContainer {
  width: 100%;
  height: 100%;
}
</style>
