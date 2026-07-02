# 06 — Schema-First 架构决策

> **决策状态：已采纳** | 日期：2026-07-02

## 1. 决策摘要

**不建设独立 Admin 微应用。** 业务平台的所有界面（含系统管理、OA、人事、政务、财务、能力运营浏览态）统一通过 **可视化编辑器（Schema）** 搭建，经菜单 `routeType: schema` 挂载到 Shell。

```
Shell = 薄壳（登录 + 菜单 + 容器 + 鉴权）
Editor Schema = 全部业务界面
Flow = 审批与待办（子应用路由或 Schema 嵌入）
AI = 智能增强（子应用或 Sidebar 嵌入）
```

## 2. 背景

早期规划中存在「admin 独立壳应用」，用于系统管理（用户、角色、部门等）。实际落地发现：

1. Editor 已提供 **UserManagement、RoleManagement、PermissionTree** 等业务 Widget
2. **AdvancedTable + Form** 可覆盖字典、审计、参数等 CRUD
3. 再建 Admin 微应用会造成 **双轨 UI、重复 API 对接、菜单体系分裂**
4. 低代码平台的核心价值是 **一切界面皆可配置**，Admin 不应成为例外

## 3. 决策内容

### 3.1 做什么

| 项 | 做法 |
|----|------|
| 系统管理 | 全部 Schema 页 + 业务 Widget |
| 业务模块 | Schema 页（列表 / 表单 / 统计 / 大屏） |
| 菜单绑定 | `routeType: schema` + `schemaId` |
| 能力缺口 | 扩展 Editor Widget，而非新建微应用 |

### 3.2 不做什么

| 项 | 说明 |
|----|------|
| ❌ admin 微应用 | 不注册 qiankun admin 子应用 |
| ❌ Shell 业务 Vue 页 | 不在 Shell 新增业务 CRUD 页面 |
| ❌ `microAppId: admin` | 菜单不绑定 admin 微应用 |

### 3.3 Shell 保留的最小内置页

仅 **平台基础设施** 保留 Shell 原生 Vue 页，且应持续收缩：

| 页面 | 路径 | 保留理由 | 迁移方向 |
|------|------|----------|----------|
| 登录 / SSO | `/login`, `/sso/callback` | 鉴权入口，不适合 Schema | 永久保留 |
| 布局容器 | ClassicSidebarLayout, StandaloneLayout | 微前端宿主 | 永久保留 |
| 首页 | `/` | 可重定向到 dashboard Schema | → Schema（SH-01） |
| 微应用管理 | `/admin/micro-apps` | 当前唯一 Shell CRUD | → Schema + MicroAppManagement Widget（可选） |

除上表外，**新增界面一律禁止在 Shell 写 Vue 业务页**。

## 4. 界面分层模型

```
┌─────────────────────────────────────────────────────────┐
│ Layer 0  Shell 基础设施                                  │
│   登录、布局、菜单渲染、qiankun 注册、路由守卫            │
├─────────────────────────────────────────────────────────┤
│ Layer 1  Schema 业务界面（Editor PublishView）  ← 主路径  │
│   系统管理 / OA / 人事 / 政务 / 财务 / 工作台 / 大屏      │
├─────────────────────────────────────────────────────────┤
│ Layer 2  子应用专业界面（micro-app 嵌入或 _blank）        │
│   设计器全屏 / 流程设计器 / AI 设计器 / 待办收件箱        │
│   理由：设计态复杂、BPMN/Agent 画布不适合用 Schema 重做   │
├─────────────────────────────────────────────────────────┤
│ Layer 3  AI / Flow 能力嵌入 Schema                       │
│   FgFlowTimeline / AI Sidebar / iframe embed             │
└─────────────────────────────────────────────────────────┘
```

**关键区分：**

- **浏览态 / 管理态 / CRUD** → Schema（Layer 1）
- **设计态 / 画布 / 专业引擎 UI** → 子应用（Layer 2）
- **能力嵌入** → Widget 扩展（Layer 3）

## 5. 系统管理落地方式

不再等待 Admin 微应用，直接使用 Editor 已有能力：

| 界面 | Schema code | Widget |
|------|-------------|--------|
| 用户管理 | `sys-user-manage` | FgUserManagement |
| 角色管理 | `sys-role-manage` | FgRoleManagement + FgPermissionTree |
| 部门管理 | `sys-dept-manage` | FgTreeLayout + Form |
| 菜单管理 | `sys-menu-manage` | AdvancedTable + Tree |
| 字典管理 | `sys-dict-manage` | 主从 AdvancedTable |
| 审计 / 日志 | `sys-audit-log` | AdvancedTable |

详见 [modules/01-system-admin.md](./modules/01-system-admin.md)。

## 6. 菜单字段 `app` 的语义调整

`Menu.app` 字段 **不再表示独立应用壳**，仅作菜单分组 / 权限域标记：

| app 值 | 含义（新） | 示例 |
|--------|------------|------|
| `shell` | 平台级入口 | 首页、设计器跳转 |
| `admin` | 系统管理分组（仍是 Schema 页） | 用户管理、角色管理 |
| 空 | 通用业务 | OA、人事 |

**渲染路径统一：** `app=admin` 的菜单项同样走 `/app/editor/view?id=xxx`，与业务模块无区别。

## 7. 能力平台扩展策略

当 Schema 无法满足界面需求时：

```
需求 → Editor 新 Widget / 数据源绑定 / Action
     → 仍不行 → Flow embed / AI embed
     → 仍不行 → 子应用 micro-app 路由（仅设计态或引擎 UI）
     ✗ 禁止 → 新建 Admin 或 Shell 业务页
```

扩展项登记：[02-能力缺口与扩展清单](./02-capability-gap-and-extensions.md)

## 8. 对实施路线图的影响

| 原规划 | 调整后 |
|--------|--------|
| 等待 Admin 微应用 | **取消**，Phase 1 直接 Schema 落地系统管理 |
| 系统管理分两套 UI | **统一** Editor Widget + AdvancedTable |
| Shell 持续膨胀 | **冻结** Shell 业务页，仅保留基础设施 |

## 9. 验收口径

- [ ] 系统管理 8+ 界面均为 Schema，无 admin 微应用路由
- [ ] 菜单中无 `microAppId: admin`
- [ ] 新增界面评审：优先 Schema，说明为何不 Schema 才可走 micro-app

---

相关：[01-架构分析](./01-architecture-analysis.md) | [01-系统管理模块](./modules/01-system-admin.md)
