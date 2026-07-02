# 模块落地 — 系统管理

> 优先级：**P0** | Phase：**1–2**  
> 架构决策：**不建 Admin 微应用**，本模块全部 Schema 页 → [06-Schema-First 架构决策](../06-schema-first-architecture.md)

## 1. 模块概述

系统管理提供 RBAC、组织架构、菜单、字典、审计等基础能力。Server 端 API 已完整。

**落地方式：** 100% 通过 **Editor Schema + 业务 Widget** 暴露到 Shell 菜单（`routeType: schema`）。与 OA、人事模块使用相同的搭建路径，无独立 Admin 壳。

## 2. 界面清单

| # | 界面 | 类型 | Schema code | 核心 Widget | Phase |
|---|------|------|-------------|-------------|-------|
| SA-01 | 菜单管理 | schema | `sys-menu-manage` | AdvancedTable + Tree | P0 |
| SA-02 | 用户管理 | schema | `sys-user-manage` | **UserManagement** | P0 |
| SA-03 | 角色管理 | schema | `sys-role-manage` | **RoleManagement** | P0 |
| SA-04 | 部门管理 | schema | `sys-dept-manage` | TreeLayout + Form | P0 |
| SA-05 | 岗位管理 | schema | `sys-post-manage` | AdvancedTable | P1 |
| SA-06 | 字典管理 | schema | `sys-dict-manage` | 主从 Table | P1 |
| SA-07 | 系统参数 | schema | `sys-config-manage` | AdvancedTable | P1 |
| SA-08 | 操作审计 | schema | `sys-audit-log` | AdvancedTable | P1 |
| SA-09 | 登录日志 | schema | `sys-login-log` | AdvancedTable | P1 |
| SA-10 | 在线用户 | schema | `sys-online-users` | AdvancedTable | P2 |
| SA-11 | 微应用管理 | schema（目标） | `sys-micro-app-manage` | 待扩展 Widget | P2 |
| SA-12 | 租户管理 | schema | `sys-tenant-manage` | AdvancedTable | P2 |

**说明：** SA-11 当前仍走 Shell 内置 `/admin/micro-apps`，为 Schema-First 原则下的**唯一过渡页**；Phase 2 可扩展 `FgMicroAppManage` Widget 后迁移。

## 3. 界面逻辑详解

### SA-02 用户管理

**功能：** 用户 CRUD、重置密码、分配角色、导入导出 Excel、启用/禁用。

**Widget：** `FgUserManagement`（已注册，group: business）

**数据 API（Server 已有）：**

| 操作 | API |
|------|-----|
| 列表 | `GET /api/users` |
| 创建 | `POST /api/users` |
| 更新 | `PUT /api/users/:id` |
| 删除 | `DELETE /api/users/:id` |
| 导入 | `POST /api/users/import` |
| 导出 | `GET /api/users/export` |

**逻辑规则：**

- 用户名租户内唯一
- 至少保留一个管理员账号（admin 不可删）
- 密码需符合密码策略
- 角色变更后权限缓存 5min TTL 刷新

**Flow：** 一般无审批；可选「用户创建需 HR 审批」扩展流程（P2）。

**AI：** 导入前 AI 校验 Excel 格式；异常账号检测（P2）。

### SA-03 角色管理

**Widget：** `FgRoleManagement` + `FgPermissionTree`

**逻辑：**

- 角色绑定 permission 码
- 菜单可见性由角色-菜单关联控制
- 预置角色：管理员、部门经理、普通员工、HR、财务

### SA-04 部门管理

**Widget：** `TreeLayout`（左树）+ `Form`（右详情）

**API：** `GET/POST/PUT/DELETE /api/departments`

**逻辑：**

- 树形结构，支持 drag 移动
- 移动时 Server 做循环检测
- 部门删除前检查子部门与用户

**扩展 E-11：** Select/Cascader 绑定 `dept://tree` 供人事模块引用。

### SA-01 菜单管理

**Widget：** AdvancedTable + 树形父级选择

**API：** `/api/menus` CRUD

**逻辑：** 配置 `routeType`、`schemaId`、`microAppId`；系统管理自身也通过本页挂载 Schema 菜单。

### SA-06 字典管理

**结构：** 左侧字典类型列表，右侧字典项 Table。

**API：** `/api/dict-types`, `/api/dict-data`

**逻辑：** 字典项 code 唯一；表单 Select 通过 `dict://leave_type` 引用。

### SA-08 操作审计

**API：** `GET /api/audit-logs`

**列：** 操作人、模块、动作、IP、时间、请求摘要

**逻辑：** 只读；管理员可导出；支持时间范围筛选。

## 4. 能力平台扩展依赖

| 扩展 ID | 说明 |
|---------|------|
| E-11 | 字典/部门数据源绑定 |
| E-03 | AdvancedTable REST 绑定标准化 |
| E-14（新增） | FgMicroAppManage Widget — 微应用管理 Schema 化 |
| — | UserManagement/RoleManagement 已存在，需验证 PublishView 运行时 |

## 5. 菜单配置（系统管理目录下）

全部 `routeType: schema`，`layout: with-menu`：

```
系统管理                    app=admin（仅分组标记，非独立应用）
├── 用户管理      → /app/editor/view?id={sys-user-manage}
├── 角色管理      → /app/editor/view?id={sys-role-manage}
├── 部门管理      → /app/editor/view?id={sys-dept-manage}
├── 菜单管理      → /app/editor/view?id={sys-menu-manage}
├── 岗位管理      → ...
├── 字典管理      → ...
├── 系统参数      → ...
├── 操作审计      → ...
├── 登录日志      → ...
└── 微应用管理    → /app/editor/view?id={sys-micro-app-manage}  (P2 迁移)
```

`app=admin` 仅表示菜单分组与权限域，**渲染路径与业务 Schema 完全相同**。

## 6. 默认账号

| 用户名 | 密码 | 角色 |
|--------|------|------|
| admin | admin123456 | 管理员 |

seed: `schema-form-server/src/utils/seedAdmin.ts`

## 7. 实施步骤

1. Editor 创建 SA-02/03/04/01 四个 P0 Schema，发布
2. seedMenus 追加菜单项（routeType: schema + schemaId）
3. 验证 UserManagement Widget 在 PublishView 下 API 带 token
4. Phase 2 补充字典、审计 Schema；微应用管理迁移 Schema
5. 更新本表「实施状态」

## 8. 验收标准

- [ ] 无 `microAppId: admin` 菜单项
- [ ] 系统管理界面均可从 Schema 进入
- [ ] admin 可管理用户/角色/部门
- [ ] 新建用户可登录
- [ ] 角色权限变更后菜单随之变化

## 9. 实施状态

| 界面 | schemaId | 菜单 | 验收 |
|------|----------|------|------|
| SA-02 | `sys-user-mgmt` | ✅ | ✅ A级 |
| SA-03 | `sys-role-mgmt` | ✅ | ✅ A级 |
| SA-04 | `sys-dept-mgmt` | ✅ | ✅ A级 |
| SA-06 | `sys-dict-manage` | ✅ | ✅ A级 |
| SA-07 | `sys-config-manage` | ✅ | ✅ A级 |
| SA-08 | `sys-audit-log` | ✅ | ✅ A级 |
| SA-11 | `sys-micro-app-manage` | ✅ | ✅ seed |
| SA-01 | `sys-menu-manage` | ✅ | 🟡 C级占位 |
| SA-05 | `sys-post-manage` | ✅ | 🟡 C级占位 |
| SA-09 | `sys-login-log` | ✅ | 🟡 C级占位 |
| SA-10 | `sys-online-users` | — | 🟡 C级占位 |
| SA-12 | `sys-tenant-manage` | — | 🟡 C级占位 |

---

相关：[06-Schema-First 架构决策](../06-schema-first-architecture.md) | [04-菜单与路由设计](../04-menu-routing-design.md)
