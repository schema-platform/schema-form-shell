# schema-form-shell

`@schema-form/shell` — 主宿主应用，qiankun 微前端容器。

## 项目规则

### 技术栈
- Vue 3.5 + `<script setup>` + TypeScript
- Element Plus + Pinia
- qiankun 微前端框架

### 架构规则
- **唯一容器**：所有子应用（editor、flow、ai）通过 qiankun 加载
- **动态菜单**：`useMenu` + `useMenuStore` + API `/api/menus/route`
- **布局切换**：`ClassicSidebarLayout` / `TopNavLayout`，通过 `useLayoutStore` 管理
- **属性面板**：`PropertyPanel.vue` 根据 Widget 的 `propertyPanel` 声明动态渲染

### 分层规范
1. 全局状态 → Pinia Store（`src/stores/`）
2. 公共逻辑 → 组合式 API（`src/composables/`）
3. API 接口 → `src/api/`（禁止组件直接 fetch）
4. 布局组件 → `src/layouts/`
5. UI 组件 → 只做渲染，不写复杂业务逻辑

## 迭代规则

- **禁止回滚 git**，渐进式推进
- 新增布局需同时支持菜单系统和属性面板
- 子应用注册变更需同步更新 qiankun 配置

## 常用命令

```bash
pnpm dev      # vite dev server
pnpm build    # vue-tsc + vite build
```
