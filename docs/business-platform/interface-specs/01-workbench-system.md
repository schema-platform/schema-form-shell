# 01 — 工作台 + 系统管理 · 全量界面落地规格

> 规范：[16-oss-ui-deconstruction](../16-oss-ui-deconstruction-and-editor-evolution.md) · 索引：[00-index](./00-index.md)  
> 每个界面：**开源参照 → 区域布局 → 功能点 → Editor 组件树 → API → 缺口**

---

## W-01 工作台首页 `dashboard-workbench`

**Page Pattern**：`StatsDashboard`（门户 KPI + 快捷入口）  
**开源参照**：O2OA 办公中心首页；JeecgBoot 首页 Dashboard；RuoYi 首页统计卡片

### 区域布局

```
┌─ A 标题区 ─────────────────────────────────────────────┐
│ FgTitle「工作台」+ 欢迎语(变量 userName) + 日期          │
├─ B KPI 行 (4×FgStatistic) ────────────────────────────┤
│ 待我审批 | 我发起的 | 本月申请数 | 公告/消息未读        │
├─ C 快捷入口 Card ─────────────────────────────────────┤
│ FgButton×N → navigate 各 apply Schema                  │
├─ D 双列 ──────────────────────────────────────────────┤
│ FgBarChart 本周审批趋势 | FgAdvancedTable 最新公告 Top5 │
├─ E AI 摘要 Card ──────────────────────────────────────┤
│ FgBanner / Richtext ← A-06 Agent API                   │
└───────────────────────────────────────────────────────┘
```

### 功能点

| # | 功能 | 规则 | 来源 |
|---|------|------|------|
| F1 | 待办 KPI | 与 `/app/flow/tasks` 数量一致 | O2OA 待办区 |
| F2 | 我发起 KPI | flow instances starter=me count | JeecgBoot 我的流程 |
| F3 | 本月申请 | submissions 当月 count | 通用 |
| F4 | 快捷入口 | 请假/报销/出差/公告/知识库 navigate | O2OA 新建流程 |
| F5 | 趋势图 | 7 日 flow complete 统计 | Flow stats |
| F6 | 公告 Top5 | Notice API 或 submissions | O2OA 信息栏目 |
| F7 | AI 摘要 | 页面 mount 调 Agent | A-06 |

### Editor 组件树

```
FgTitle
FgStatistic×4 (apiUrl → S-07 dashboard)
Card → FgButton×5 (events: navigate)
DoubleCol → FgBarChart | FgAdvancedTable(mini)
Card → FgBanner (apiUrl → A-06)
```

### API

| 指标 | GET |
|------|-----|
| 聚合 | `/api/dashboard` 或分项 |
| 公告 | `/api/business/notifications` / Notice |
| AI | `/api/ai/runtime/daily-summary` |

### 缺口

| ID | 说明 |
|----|------|
| S-07 | dashboard 聚合 API 增强 |
| SH-01 | Shell HomeView → 本 Schema |
| A-06 | 每日摘要 Agent runtime |
| E-45 | 可选：Dashboard 复合 Widget |

---

## W-04 消息中心 `workbench-messages`

**Page Pattern**：`CrudList`（只读列表 + 详情 Drawer）  
**开源参照**：O2OA 消息中心；RuoYi 站内信

### 区域布局

```
[A SearchBar: 类型|已读|日期] [B 全部已读]
[C Table: 标题|类型|时间|已读] [D 行: 查看]
[E Drawer/Dialog: 消息正文]
```

### 功能点

| # | 功能 | 来源 |
|---|------|------|
| F1 | 分页列表 | RuoYi 通知 |
| F2 | 未读筛选 | O2OA |
| F3 | 标记已读/全部已读 | RuoYi |
| F4 | 流程通知 + 公告聚合 | S-04 |

### Editor 组件树

```
FgAdvancedTable
  searchBar: type, unreadOnly, dateRange
  columns: title, type, createdAt, readFlag
  row: view → open-dialog
FgDialog → Descriptions / Richtext
Toolbar: mark-all-read → api PUT
```

### API

`GET/PUT /api/business/notifications` · `PUT .../read-all`

### 缺口

E-45 CrudList · E-08 NotificationBell（Header 铃铛 SH-03）

---

## W-02 我的待办 · micro-app `/app/flow/tasks`

**Page Pattern**：Flow 子应用（不建 Schema）  
**开源参照**：JeecgBoot 待办任务；Flowable TaskInbox

### 功能点

| # | 功能 | 来源 |
|---|------|------|
| F1 | 待办列表分页 | JeecgBoot |
| F2 | 认领/通过/驳回/委派 | Flow 已有 |
| F3 | 批量审批 | Flow |
| F4 | 详情抽屉 + AI 建议 A-01 | RuoYi |

### Editor

不经过 Editor；Shell 菜单 `routeType: micro-app`, `microAppId: flow`

---

## W-03 我的发起 · `/app/flow/instances`

**功能点**：我发起的实例、状态筛选 running/completed、跳转详情 — JeecgBoot 我的流程

---

## SA-02 用户管理 `sys-user-mgmt`

**Page Pattern**：`DomainWidget` → **FgUserManagement**（已实现）  
**开源参照**：RuoYi `sys_user` CRUD + 导入导出 + 重置密码

### 区域布局

```
[A 搜索 username/displayName] [B 新增|导入|导出]
[C Table + 多选] [D 编辑|删除|重置密码|更多▼]
[F 新增/编辑 Dialog Form] [G 重置密码 Dialog]
```

### 功能点

| # | 功能 | 来源 |
|---|------|------|
| F1 | 用户 CRUD | RuoYi |
| F2 | 重置密码 | RuoYi |
| F3 | 分配角色（编辑表单内） | RuoYi |
| F4 | 导入/导出 Excel | JeecgBoot |
| F5 | 启用/禁用 | RuoYi |
| F6 | admin 不可删 | RuoYi 安全 |

### Editor 组件树

```
FgUserManagement (单 Widget 内聚)
  props: tableColumns, pageSize, searchable
  内部: el-table + 2×Dialog + userApi
```

### API

`/api/users` CRUD · import · export · reset-password

### 缺口

E-50 泛化 UserManagement → **FgCrudListPage** 可配置 entity

---

## SA-03 角色管理 `sys-role-mgmt`

**Page Pattern**：`DomainWidget` → **FgRoleManagement**  
**开源参照**：RuoYi `sys_role` + 菜单权限树

### 功能点

CRUD · 权限树勾选 · 数据权限范围 · 预置角色 seed

### Editor

```
FgRoleManagement + FgPermissionTree
```

---

## SA-04 部门管理 `sys-dept-mgmt`

**Page Pattern**：`MasterDetail`（左树右表单）  
**开源参照**：RuoYi `sys_dept` tree + drag

### 区域布局

```
┌ TreeLayout ─┬─ Form 部门详情 ─────────┐
│ 部门树       │ name, parent, sort, leader │
│ drag 排序    │ [保存][删除]              │
└─────────────┴──────────────────────────┘
```

### Editor

```
FgTreeLayout
  left: dept tree API /depts/tree
  right: FgForm fields
  events: drag → PUT move, 循环检测 server
```

### 缺口

E-07 TreeTable drag · tree→form 联动 composable

---

## SA-01 菜单管理 `sys-menu-manage`

**Page Pattern**：`MasterDetail` + TreeTable  
**开源参照**：RuoYi `sys_menu`

### 功能点

| # | 功能 | 来源 |
|---|------|------|
| F1 | 树形菜单 CRUD | RuoYi |
| F2 | routeType/schemaCode/microAppId/layout | 本平台 |
| F3 | 图标 AppIcon 选择 | 本平台 |
| F4 | 排序 | RuoYi |

### Editor

```
FgTreeTable 或 TreeLayout + AdvancedTable
  API: /api/menus
  Dialog: 菜单表单（path, schemaCode, permission...）
```

### 缺口

当前 C 级占位 · 需 FgMenuManage 或 E-45 配置 `/menus`

---

## SA-06 字典管理 `sys-dict-manage`

**Page Pattern**：`MasterDetail`  
**开源参照**：RuoYi dict_type + dict_data 主从

### 区域布局

```
┌ 字典类型 Table ─┬─ 字典项 AdvancedTable ─┐
│ typeCode,name  │ label,value,sort,status │
└────────────────┴─────────────────────────┘
```

### Editor

```
DoubleCol / 自定义 FgDictManage
  左: /dict-types  右: /dict-data?typeId=
  联动: 选类型刷新右表
```

### API

`/api/dict-types` · `/api/dict-data` · 表单 `dict://` E-11

---

## SA-07 系统参数 `sys-config-manage`

**Page Pattern**：`CrudList`  
**开源参照**：RuoYi `sys_config`

### 功能点

键值对 CRUD · 缓存刷新 · 系统内置项只读

### Editor（目标 E-45）

```
searchSchemas: configName, configKey
columns: configName, configKey, configValue, remark
rowActions: edit
formSchemas: key, value, remark
listApi: /sys/config (或已有 API)
```

---

## SA-08 操作审计 `sys-audit-log`

**Page Pattern**：`CrudList` 只读  
**开源参照**：RuoYi `sys_oper_log`

### 功能点

列：操作人|模块|动作|IP|时间|请求摘要 · 时间范围筛选 · 导出 · 不可编辑

### Editor

```
FgAdvancedTable 或 E-45
  searchSchemas: dateRange, module, operator
  columns: ...
  无 row edit，仅 view
  API: GET /audit-logs
```

---

## SA-09 登录日志 `sys-login-log`

**Page Pattern**：`CrudList` 只读  
**开源参照**：RuoYi `sys_logininfor`

列：用户|IP|地点|浏览器|状态|时间 · 筛选日期/状态

---

## SA-10 在线用户 `sys-online-users`

**Page Pattern**：`CrudList` + 强退  
**开源参照**：RuoYi 在线用户监控

行操作：**强退** → API kick session

---

## SA-11 微应用管理 `sys-micro-app-manage`

**Page Pattern**：`DomainWidget`  
**开源参照**：qiankun 微应用注册

### 功能点

CRUD microApp entry/activeRule · 健康检查 · 与 Shell microApps 同步

### Editor

```
FgMicroAppManage (E-14 待建)
  或 CrudList + formSchemas
```

---

## SA-12 租户管理 `sys-tenant-manage`

**Page Pattern**：`CrudList`  
**开源参照**：JeecgBoot 多租户

列：租户名|编码|状态|过期时间 · CRUD · 套餐关联(P2)

---

## SA-05 岗位管理 `sys-post-manage`

**Page Pattern**：`CrudList`  
**开源参照**：RuoYi `sys_post`

CRUD postCode, postName, sort, status · 关联用户计数

---

## 本模块能力汇总

| Pattern | 界面 | 现状 Widget | 目标 |
|---------|------|-------------|------|
| DomainWidget | SA-02/03 | User/Role Mgmt ✅ | E-50 泛化 |
| MasterDetail | SA-04/06/01 | 部分 | TreeLayout + E-45 |
| CrudList | SA-07~10,12,05 | 占位/简表 | **E-45** |
| StatsDashboard | W-01 | 部分 ✅ | S-07 |
| micro-app | W-02/03 | Flow ✅ | — |
