# schema-form-shell

`@schema-form/shell` — 主宿主应用，qiankun 微前端容器。

## ⚡ 自动专家模式（强制）

**每次对话开始或收到新任务时，必须自动执行以下流程：**

1. 读取 `.claude/experts/frontend-expert.md` 获取完整项目知识库
2. 以前端专家身份分析任务、制定方案、执行开发
3. 遵守专家文件中的所有约束和分层规范

无需用户显式要求，所有任务默认走专家流程。

## 项目规则

### 技术栈
- Vue 3.5 + `<script setup>` + TypeScript
- Element Plus + Pinia
- qiankun 微前端框架
- Web Worker 通信

### 架构规则
- **唯一容器**：所有子应用（editor、flow、ai）通过 qiankun 加载
- **双容器**：`ClassicSidebarLayout`（带菜单）/ `StandaloneLayout`（全屏）
- **动态菜单**：`useMenu` + `useMenuStore` + API `/api/menus/route`
- **子应用注册**：内置静态 + 服务端拉取，通过 `createSubAppProps()` 统一下发通信 props
- **Worker 通信**：`WorkerBridge` + `microApp.worker` 处理子应用间事件广播和状态同步

### 分层规范
1. 全局状态 → Pinia Store（`src/stores/`）
2. 公共逻辑 → 组合式 API（`src/composables/`）
3. API 接口 → `src/api/`（禁止组件直接 fetch）
4. 布局组件 → `src/layouts/`
5. UI 组件 → 只做渲染，不写复杂业务逻辑

### 子应用通信契约
注册时下发 props：`token` / `getRouteBase` / `getBasePath` / `onGlobalStateChange` / `setGlobalState` / `emitEvent` / `onEvent` / `offEvent` / `navigateTo` / `openInNewTab` / `getSharedState`

### 公共包规则
- **修改公共包必须发包并拉取**：修改 `@schema-platform/platform-shared` 等公共包源码后，必须发包（更新版本号 → `pnpm publish`），然后在本项目执行 `pnpm update` 拉取新版本。仅修改源码不发包 = 改动不生效。

### 环境规则
- **gh CLI 已认证**：`gh` 已登录、`GITHUB_TOKEN` 环境变量已就绪，禁止检查 token、禁止询问用户设置

### 代码质量规则
- **禁止跳过问题**：遇到任何报错、警告、异常，必须找到根因并修复，不能以"预存问题""之前就有""不影响运行"为由跳过。每个问题都要记录原因和修复方式

### 项目隔离规则
- **shell 只能改 shell**：只允许修改 `schema-form-shell/` 目录下的文件。禁止修改 `schema-form-editor/`、`schema-form-flow/`、`schema-form-ai/`、`schema-form-server/`、`schema-form-platform-shared/`、`schema-form-flow-shared/` 等任何其他项目的代码。子应用的问题在子应用里修，不能从 shell 里改。

## 迭代规则

- **禁止回滚 git**，渐进式推进
- **禁止兜底冗余代码**，错误及时暴露
- **能力不够就扩展，不绕过**
- 新增布局需同时支持菜单系统和属性面板
- 子应用注册变更需同步更新 qiankun 配置

## 常用命令

```bash
pnpm dev      # vite dev server (port 5050)
pnpm build    # vue-tsc + vite build
```
