# 04 — 菜单与路由设计

## 1. 菜单配置规范

### 1.1 字段说明

与 `MenuTreeNode`（`schema-form-shell/src/types/menu.ts`）及 Server Menu 模型一致：

| 字段 | 必填 | 说明 |
|------|------|------|
| name | 是 | 菜单显示名 |
| path | 是 | 路由路径；目录可为空 |
| icon | 是 | AppIcon 注册名（kebab-case） |
| parentId | 否 | 父菜单 ID |
| sort | 是 | 排序，越小越前 |
| routeType | 是 | `schema` / `micro-app` / `link` |
| schemaId | schema 时 | 已发布 Schema 的 ID |
| microAppId | micro-app 时 | `editor` / `flow` / `ai` |
| target | 否 | `_self`（默认）/ `_blank` |
| layout | 是 | `with-menu` / `without-menu` |
| app | 否 | 菜单分组标记：`shell` / `admin`（**非独立应用壳**，见 [06-Schema-First](../06-schema-first-architecture.md)） |
| permission | 否 | RBAC 权限码 |

### 1.2 路径约定

| 场景 | path 格式 | 示例 |
|------|-----------|------|
| Shell 内置页 | 绝对路径 | `/`, `/admin/micro-apps` |
| Schema 业务页 | `/app/editor/view` + query | `?id={schemaId}` |
| Editor 子应用 | `/app/editor/{route}` | `/app/editor/instances` |
| Flow 子应用 | `/app/flow/{route}` | `/app/flow/tasks` |
| AI 子应用 | `/app/ai/{route}` | `/app/ai/workflows` |
| 设计器全屏 | `/standalone/{app}/{route}` | `/standalone/editor`, `/standalone/flow/designer` |
| 外部链接 | url 字段 | — |

**注意：** Schema 菜单的 `path` 统一为 `/app/editor/view`，实际 schemaId 存 `schemaId` 字段；SideMenu 拼接 query。

### 1.3 图标规范

使用 `@schema-platform/platform-shared` 的 `AppIcon`，名称必须在 `iconRegistry.ts` 注册。业务菜单常用：

`home-filled`, `setting`, `menu`, `monitor`, `edit`, `connection`, `chat-dot-round`, `user`, `document`, `calendar`, `bell`, `data-analysis`, `money`, `office-building`, `ticket`, `files`, `reading`, `cpu`, `operation`

缺图标时：**先注册再使用**。

---

## 2. 完整菜单树（目标态）

以下为 Phase 4 目标菜单；Phase 1 实现 **加粗** 项。

```
首页                                    /                           [shell, micro-app]
**工作台**                              /dashboard                  [schema, P0]

流程中心                                (目录)
  **我的待办**                          /app/flow/tasks               [micro-app, flow]
  我的发起                              /app/flow/instances           [micro-app, flow]
  流程监控                              /app/flow/monitor             [micro-app, flow]

OA 办公                                 (目录)
  公告通知                              /app/editor/view              [schema]
  会议管理                              /app/editor/view              [schema]
  出差申请                              /app/editor/view              [schema]
  用印申请                              /app/editor/view              [schema]
  知识库                                /app/ai/rag                   [micro-app, ai]

人事管理                                (目录)
  **请假申请**                          /app/editor/view              [schema, P0]
  **请假台账**                          /app/editor/view              [schema, P0]
  加班管理                              /app/editor/view              [schema]
  入职管理                              /app/editor/view              [schema]
  离职管理                              /app/editor/view              [schema]
  员工档案                              /app/editor/view              [schema]
  考勤统计                              /app/editor/view              [schema]

财务采购                                (目录) → 见「财务管理」
  （已扩展为财务管理模块，见 modules/05-finance-management.md）

财务管理                                (目录)
  费用报销 / 采购 / 合同 / 预算 / 付款 / 发票 / 核算

审计监督                                (目录)
  审计计划 / 项目实施 / 问题整改 / 合规检查 / 审计报告 / 统计分析

计装管理                                (目录)
  计量管理（器具/检定/证书/预警）
  装备装具（台账/领用/盘点/报废）

报表中心                                (目录)
  综合仪表盘 / 人事·财务·流程·OA·审计·计装报表 / 导出 / 驾驶舱

报告管理                                (目录)
  报告台账 / 编制 / 模板 / 定期任务 / 年报 / 专题分析

行政审批                                (目录)
  事项受理                              /app/editor/view              [schema]
  并联审批                              /app/editor/view              [schema]
  证照管理                              /app/editor/view              [schema]
  督查督办                              /app/editor/view              [schema]

**系统管理**                            (目录)                        [app=admin 分组，全非 schema]
  菜单管理                              /app/editor/view              [schema]
  **用户管理**                          /app/editor/view              [schema, P0]
  **角色管理**                          /app/editor/view              [schema, P0]
  **部门管理**                          /app/editor/view              [schema, P0]
  岗位管理                              /app/editor/view              [schema]
  字典管理                              /app/editor/view              [schema]
  系统参数                              /app/editor/view              [schema]
  操作审计                              /app/editor/view              [schema]
  登录日志                              /app/editor/view              [schema]
  微应用管理                            /admin/micro-apps             [shell 过渡，P2→schema]

能力平台                                (目录)
  **表单设计器**                        /standalone/editor            [_blank, without-menu]
  **流程设计器**                        /standalone/flow/designer     [_blank, without-menu]
  **AI 应用**                           /standalone/ai                [_blank, without-menu]
  **Schema 管理**                       /app/editor/instances         [micro-app, editor]
  表单数据                              /app/editor/submissions       [micro-app, editor]
  流程定义                              /app/flow/list                [micro-app, flow]
  流程模板                              /app/flow/templates           [micro-app, flow]
  Agent 编排                            /app/ai/workflows             [micro-app, ai]
  AI 监控                               /app/ai/monitor               [micro-app, ai]
```

---

## 3. Phase 1 seed 增量清单

在 `seedMenus.ts` 中追加（parentId 用 `__WORKBENCH__` 等占位符模式，与 `__SYSTEM__` 相同）：

| sort | name | path | routeType | microAppId | target | layout |
|------|------|------|-----------|------------|--------|--------|
| 1 | 工作台 | /dashboard | schema | editor | _self | with-menu |
| 5 | 流程中心 | | | | | with-menu |
| 1 | 我的待办 | /app/flow/tasks | micro-app | flow | _self | with-menu |
| 15 | 人事管理 | | | | | with-menu |
| 1 | 请假申请 | /app/editor/view | schema | editor | _self | with-menu |
| 2 | 请假台账 | /app/editor/view | schema | editor | _self | with-menu |
| 3 | 用户管理 | /app/editor/view | schema | editor | _self | with-menu |
| 4 | 角色管理 | /app/editor/view | schema | editor | _self | with-menu |
| 5 | 部门管理 | /app/editor/view | schema | editor | _self | with-menu |
| 50 | 能力平台 | | | | | with-menu |
| 1 | Schema 管理 | /app/editor/instances | micro-app | editor | _self | with-menu |

**修复现有项：**

```diff
- path: '/standalone/flow/design'
+ path: '/standalone/flow/designer'
```

---

## 4. Schema 与菜单绑定流程

```mermaid
flowchart LR
  A[Editor 设计 Schema] --> B[发布 Publish]
  B --> C[获得 schemaId]
  C --> D[菜单管理绑定 schemaId]
  D --> E[GET /api/menus/route 刷新]
  E --> F[SideMenu 点击跳转]
```

### 4.1 推荐：Schema code 稳定标识

为避免 seed 依赖 MongoDB ObjectId，Schema 增加业务 `code` 字段（若尚未有则扩展 Server）：

```
code: 'hr-leave-apply'
code: 'hr-leave-list'
code: 'dashboard-workbench'
```

seed 脚本：`const schema = await FormSchemaModel.findOne({ code: 'hr-leave-apply' })` → 写入 menu.schemaId。

### 4.2 SideMenu 导航逻辑（现状）

`routeType === 'schema'` 时：

```ts
router.push({ path: '/app/editor/view', query: { id: node.schemaId } })
```

---

## 5. 权限与菜单

| 角色 | 可见菜单 |
|------|----------|
| 管理员 | 全部 |
| 部门经理 | 工作台、流程、OA、人事、部分系统 |
| 普通员工 | 工作台、申请类、知识库 |
| 财务 | + 财务采购 |
| HR | + 人事全部 |

Server 端 `/api/menus/route` 已按用户角色过滤；菜单项 `permission` 字段需与 `seedPermissions` 对齐。

---

## 6. 布局选择指南

| layout | 使用场景 |
|--------|----------|
| with-menu | 日常业务浏览、管理、待办 |
| without-menu + _blank | 设计器、大屏投屏 |
| without-menu + _self | 嵌入式全屏业务（少用） |

---

下一篇：[05-搭建模式与规范](./05-build-patterns.md)
