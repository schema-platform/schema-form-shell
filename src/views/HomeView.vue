/**
 * HomeView — 首页
 *
 * 展示平台概览信息。
 * 子应用入口由菜单系统驱动（/api/menus/route），不在此页面硬编码。
 */
<script setup lang="ts">
</script>

<template>
  <div :class="$style.container">
    <h1 :class="$style.title">Schema 业务平台</h1>
    <p :class="$style.subtitle">低代码表单引擎与流程引擎，请从左侧菜单进入各功能模块。</p>
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
  margin: 0;
}
</style>
