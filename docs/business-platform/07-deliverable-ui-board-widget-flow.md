# 07 — 可交付 UI 规范：Board → Widget → Flow

> **目标：** 不是「能跑起来的 Demo」，而是 **可配置、可发布、可审批、可台账回写** 的完整业务界面。  
> 本文基于 schema-form-editor **真实代码**（Board 存储、68 个 Widget、eventEngine、PublishView、Flow embed）编写。

## 1. 核心模型：Board 是什么

一页业务界面 = **一个已发布 Schema**，持久化为：

```json
{
  "widgets": [ /* Widget 树，绝对定位 */ ],
  "board": {
    "canvas": { "width": 1920, "height": 1080, "widthUnit": "px", "backgroundColor": "...", "padding": "16px" },
    "variables": [ { "name": "submissionId", "type": "string", "defaultValue": "" } ],
    "events": [ { "trigger": "mount", "actions": [...] } ]
  }
}
```

| 概念 | Store | 职责 |
|------|-------|------|
| **Board** | `useBoardStore` | 画布尺寸、背景、**页面变量**、**页面级事件** |
| **Widget 树** | `useWidgetStore` | 所有可见组件，`position: { x,y,w,h,zIndex }` |
| **运行时** | `PublishView` | 加载 `{ widgets, board }` → `WidgetRenderer layout="absolute"` |

**Editor 是自由布局画布**（非流式 Bootstrap 栅格）：每个 Widget 有 `position`，容器类 Widget 通过 `children` + `formId` / `tabKey` / `colIndex` 组织内部结构。

---

## 2. Widget 体系：怎么选、怎么嵌

### 2.1 分组与选用原则

| 分组 | 可交付用途 | 选用规则 |
|------|------------|----------|
| **layout** | 页面骨架 | `card` 分区；`tabs` 详情多 Tab；`double-col` 表单两列 |
| **container** | 表单/弹窗/嵌入 | **`form` 必包可提交字段**；`dialog` 弹窗编辑；`iframe` 嵌 Flow |
| **form** | 数据采集 | 有 `field` 的控件必须挂在 `form` 容器下（通过 `formId`） |
| **table** | 台账列表 | 业务数据用 **`advanced-table`**（工具栏/行按钮/分页/事件） |
| **static** | 标题/KPI/只读 | `title` + `statistic` + `descriptions` |
| **chart** | 统计/大屏 | 绑定 API 或 receivableEvents `refresh` |
| **action** | 操作 | `button` / `toolbar-buttons` 绑事件链 |
| **business** | 系统/审批 | `user-management` 等 **自带 CRUD**；审批字段用 `approval-comment` |

### 2.2 容器嵌套规则（强制）

```
✅ 允许
  card → form → double-col → input/select
  card → tabs → [tab1: descriptions] [tab2: iframe]
  root → advanced-table（全宽业务块）

❌ 禁止（会被 sanitizeContainerNesting 提升为 root）
  form → dialog → form
  card → card（容器套容器）
```

### 2.3 字段绑定三件套

| 属性 | 作用 |
|------|------|
| `field` | 表单字段名，进入 `FgForm` 的 `formModel` |
| `formId` | 指向 `type: form` 的 Widget id |
| `validationRules` | Element Plus 校验规则 |

**可交付表单必须：** 所有可编辑字段在一个 `form` 容器内，且提交走 **form 校验 → 事件链**，不能散落裸 `input`。

---

## 3. 画布规格（按页面类型）

业务平台嵌入 Shell 侧边栏时，内容区宽度约 **1200–1600px**。推荐画布：

| 页面类型 | canvas.width | canvas.height | 说明 |
|----------|--------------|---------------|------|
| **列表页** | 1440px 或 100% | 900px | 上标题 + 下表格 |
| **表单页** | 960px | 1200px | 居中窄版，易读 |
| **详情+审批** | 1440px | 1400px | Tabs + iframe 区要高 |
| **仪表盘** | 1920px | 1080px | 统计/大屏；可 `_blank` 全屏 |
| **嵌入 Flow** | iframe 高度 | 600–800px | 单独 card 预留 |

`board.variables` 建议每页统一定义：

| 变量名 | 类型 | 用途 |
|--------|------|------|
| `pageMode` | string | `create` / `view` / `edit` |
| `recordId` | string | submissionId，来自 URL query |
| `flowInstanceId` | string | 流程实例 id |
| `taskId` | string | 当前审批任务 id |

> **缺口（必修）：** `PublishView` 当前 **未注入** `board.variables` 与 **未执行** `board.events`。可交付前需在 editor 修复（见 §8）。

---

## 4. 五种可交付页面 Blueprint

### 4.1 列表页（台账）

**适用：** 请假台账、报销台账、审计问题清单、报表导出中心。

**视觉排布（1440×900）：**

```
y=0   ┌─ title ──────────────────────────────── [导出] ─┐  h=48
y=56  ├─ card ──────────────────────────────────────────┤
      │  advanced-table                          h=780  │
      │  [工具栏: 新建 | 批量删除]                         │
      │  [列: 单号 | 业务字段... | 状态tag | 操作按钮]    │
      └───────────────────────────────────────────────────┘
```

**Widget 树：**

```
title          (y:0, w:800)
button「导出」  (y:0, x:1200) → events: api GET export
card           (y:56, w:100%, h:820)
└── advanced-table
    api: GET /submissions/{applySchemaId}
         dataPath: data.items
         extraParams: { page, pageSize }
    columns:
      - { prop: "_id", label: "单号", render: "link", linkEvent: "open-detail" }
      - { prop: "data.leaveType", label: "假别", render: "tag", colorMap: {...} }
      - { prop: "data.days", label: "天数" }
      - { prop: "status", label: "状态", render: "tag" }
      - { prop: "createdAt", label: "申请时间" }
      - { prop: "action", render: "buttons", buttons: [view, withdraw] }
    toolbar:
      - { key: "add", label: "新建", type: "primary" }
    events:
      - toolbar-add → navigate /app/editor/view?id={applySchemaId}
      - row-view → navigate + query recordId=row._id
      - link-open-detail → 同上
```

**数据注意：** submission 业务字段在 `row.data.*` — 见 [08-高级表格列能力规范](./08-advanced-table-column-spec.md) §3.2、§7（**E-03 嵌套 prop** 完成前需 API flatten 或冗余字段）。

**列配置详见：** [08-advanced-table-column-spec.md](./08-advanced-table-column-spec.md) §6.1 请假台账配方。

---

### 4.2 申请表单页

**适用：** 请假申请、报销申请、审计计划编制。

**视觉排布（960×1200）：**

```
y=0    title「请假申请」
y=56   card
       ├── form (labelWidth: 120px)
       │     double-col
       │       col0: leaveType, startTime
       │       col1: endTime, days
       │     textarea reason
       │     user-selector agentUser
       │     upload attachments
       └── toolbar-buttons [提交] [重置]  (y: bottom)
```

**Widget 树要点：**

```
form (id: form_main, formId 子组件指向此 id)
├── select   field: leaveType    formId: form_main
├── date     field: startTime
├── date     field: endTime
├── number   field: days
├── textarea field: reason
├── user-selector field: agentUser
└── upload   field: attachments

button「提交」events:
  1. trigger form_main → submit  (校验)
  2. api POST /submissions/{schemaId}  body: { data: formData }   ← 见 §5.1
  3. startFlow definitionId={leaveFlowId} variables: { days: formData.days, ... }
  4. navigate 列表页 + toast
```

---

### 4.3 详情页（只读）

**适用：** 查看申请、合同详情、报告预览。

```
tabs (activeKey: info)
├── Tab「申请信息」
│     descriptions 或 form(mode=view) + readonlyFields
├── Tab「审批记录」
│     iframe → /app/flow/embed/approval-log?instanceId={{flowInstanceId}}
└── Tab「附件」
      file-list / upload(readonly)
```

**URL 约定：** `/app/editor/view?id={detailSchemaId}&recordId=xxx&flowInstanceId=yyy`

详情页 `mount` 事件（board.events，待 runtime 支持）：

```json
{
  "trigger": "mount",
  "actions": [{
    "type": "api",
    "apiMethod": "get",
    "apiUrl": "/submissions/{applySchemaId}/{{recordId}}",
    "onSuccess": [{ "type": "set-value", "target": "form_main", ... }]
  }]
}
```

**过渡方案：** `form.api` 配 loadApi：`GET /submissions/{schemaId}/{id}`，用 `route.query.recordId` 需在 **E-23 URL 参数注入** 中支持。

---

### 4.4 审批页（Flow 集成）

**两种可交付路径：**

#### 路径 A — 待办在 Flow 子应用（推荐 Phase 1）

| 入口 | 路径 |
|------|------|
| 菜单 | `/app/flow/tasks` |
| 处理 | Flow 内置 `TaskDetailView`：表单 Schema + 通过/驳回/委派 + 审批日志 |

Flow 已支持 `task.formSchemaId` + `SchemaPreview` + 审批按钮 — **这是最完整、可交付的审批 UI**，无需在 Editor 重写。

#### 路径 B — Schema 详情页 + iframe 嵌入（业务台账点进）

```
Schema 详情页
├── descriptions（申请数据，来自 submission）
├── iframe (h:400) embed/approval-log?instanceId=
├── iframe (h:600) embed/task-detail?taskId=   ← 需补 embed 路由
└── approval-comment（仅当 task 可编辑字段）
```

Flow 现有 embed：

| 路由 | 用途 |
|------|------|
| `/embed/approval-log?instanceId=` | 审批时间线 ✅ |
| `/embed/preview?instanceId=` | 流程迷你图 ✅ |
| `/embed/task-list` | 任务列表 ✅ |
| `/embed/task/:taskId` | 单任务审批（表单 + 通过/驳回/委派 + AI 建议）✅ |

**F-08 embed URL 契约：**

| 路由 | 必填参数 | 可选 query | 说明 |
|------|----------|------------|------|
| `/embed/task/:taskId` | `taskId`（path 或 `?taskId=`） | `instanceId` | 复用 `TaskDetailView`，`meta.embedded: true` |
| `/embed/approval-log` | `instanceId` | — | 审批时间线 |
| `/embed/preview` | `instanceId` | — | 流程迷你图 |

Shell iframe 示例：`/app/flow/embed/task/{{variables.taskId}}?instanceId={{variables.flowInstanceId}}`

**可交付组合（当前即可）：** 列表 → 详情 Schema（只读）+ approval-log iframe；审批操作跳转 `/app/flow/tasks?taskId=`。

---

### 4.5 仪表盘 / 报表页

**适用：** 工作台、财务预算执行、审计统计、领导驾驶舱。

```
y=0     title
y=56    triple-col → statistic × 3
y=180   double-col → bar-chart | pie-chart
y=520   advanced-table（Top N 明细，可选）
```

每个 chart 配置 `widget.api` + `receivableEvents: refresh`；board mount 或 button「刷新」触发 `trigger-event → refresh`。

---

## 5. Flow 集成：三种可交付模式

### 5.1 模式一：提交 + startFlow（同一按钮事件链）

**顺序必须：**

```
校验(form.submit) → 保存(submission) → 启动流程(startFlow) → 跳转(navigate)
```

**事件配置示例（提交按钮）：**

```json
{
  "trigger": "click",
  "confirm": "确认提交请假申请？",
  "actions": [
    { "type": "submit" },
    {
      "type": "api",
      "apiMethod": "post",
      "apiUrl": "/submissions/{APPLY_SCHEMA_ID}",
      "apiParams": { "data": "formData" }
    },
    {
      "type": "startFlow",
      "definitionId": "{LEAVE_FLOW_DEF_ID}",
      "variables": {
        "days": "formData.days",
        "leaveType": "formData.leaveType"
      }
    },
    {
      "type": "navigate",
      "navigatePath": "/app/editor/view",
      "navigateQuery": { "id": "{LIST_SCHEMA_ID}" }
    }
  ]
}
```

**⚠️ 平台现状与必修：**

| 问题 | 影响 | 修复 |
|------|------|------|
| `apiParams: "formData"` 直接作 body | Server 要 `{ data: {...} }` | **E-04** `submitSubmission` action |
| `variables` 内 `formData.xxx` 未解析 | startFlow 变量空 | eventEngine 扩展 resolve |
| `submit` 在 absolute 布局 | 未走 el-form | PublishView 传递 formRef / SchemaNode 汇总 formModel |
| 无 submission→flow 事务 | 可能只存未启流程 | 事件链 `onSuccess` 串联或 Server 事务 API |

**可交付最低标准：** 实现 **E-04 `submitSubmission` action**（POST body 正确 + 返回 submissionId 写入变量）。

---

### 5.2 模式二：Webhook 自动启流程（推荐生产）

```
表单 api/submitSubmission → 仅 POST submission
Server eventBus submission.created → Webhook → startInstance
```

**优点：** 解耦、可重试、业务人员可改 Webhook 配置。  
**列表关联流程：** submission 扩展字段 `flowInstanceId`（Server 扩展 S-13）或在 variables 里存 `businessKey=submissionId`。

---

### 5.3 模式三：Flow UserTask 绑定 formSchemaId

**适用：** 审批节点才填表、多级不同表单。

BPMN UserTask 配置：

```json
{
  "formSchemaId": "xxx",
  "formMode": "edit",
  "editableFields": ["approvalComment"]
}
```

运行时 **Flow embed / TaskDetailView** 加载 Schema — 与设计器表单同一套 Widget。

---

## 6. 标杆交付：请假全流程 Blueprint

### 6.1 Schema 清单（4 个发布物）

| code | 类型 | 画布 | 菜单 |
|------|------|------|------|
| `hr-leave-apply` | 申请表单 | 960×1200 | 人事管理 → 请假申请 |
| `hr-leave-list` | 台账列表 | 1440×900 | 人事管理 → 请假台账 |
| `hr-leave-detail` | 详情+轨迹 | 1440×1400 | 从列表跳转（可不挂菜单） |
| `hr-leave-stats` | 统计 | 1920×900 | 人事管理 → 请假统计 |

### 6.2 Flow

- 模板：**请假审批**（部门经理 → HR）
- `formSchemaId` 绑定 `hr-leave-apply`（可选，用于任务节点展示）
- Webhook：`submission.created` + schemaId=hr-leave-apply

### 6.3 用户旅程（可验收）

```
1. 菜单「请假申请」→ apply Schema
2. 填表 → 提交 → submission 创建 → 流程实例启动
3. 部门经理「我的待办」/app/flow/tasks → 通过/驳回
4. HR 待办 → 通过 → 流程结束
5. 「请假台账」列表 status 更新；点「查看」→ detail Schema + approval-log
6. 「请假统计」图表与台账 count 一致
```

### 6.4 apply Schema 字段与字典

| field | Widget | 字典 |
|-------|--------|------|
| leaveType | select | dict://leave_type |
| startTime | date | — |
| endTime | date | — |
| days | number | 联动计算 linkages |
| reason | textarea | required |
| agentUser | user-selector | — |
| attachments | upload | 病假 required 联动 |

**days 联动（用 `linkages` 非 PropertyPanel「联动规则」）：**

```json
{
  "type": "set-value",
  "watchFields": ["startTime", "endTime"],
  "targetField": "days",
  "expression": "/* 工作日差 */"
}
```

---

## 7. 事件 / API / 变量配置速查

### 7.1 事件动作（eventEngine 已实现）

| type | 可交付用途 |
|------|------------|
| `submit` / `reset` | 表单校验提交 |
| `api` | CRUD、导出 |
| `startFlow` / `endFlow` | 流程启停 |
| `navigate` | 跳其他 Schema 菜单 |
| `open-dialog` / `close-dialog` | 列表页弹窗编辑 |
| `refresh` | 刷新表格 |
| `set-variable` | 页面变量 |
| `trigger-event` | 表格/图表联动 |

### 7.2 AdvancedTable 必配

- **configPanels:** events + api + variables  
- **toolbar/row buttons:** 每个按钮独立 `eventTarget`  
- **分页:** `pagination.enabled: true`, API 传 page/pageSize  
- **导出:** toolbar → api GET `/submissions/{id}/export?format=xlsx`

### 7.3 系统管理快捷路径

| 界面 | 做法 |
|------|------|
| 用户管理 | 单 Widget `user-management` 1440×900，无需手搓表格 |
| 角色管理 | `role-management` + 可选 `permission-tree` 弹窗 |

---

## 8. 可交付前置：平台必修项（非可选）

以下不修复则 **只能做静态原型**，不能算可交付：

| 优先级 | ID | 问题 | 修复归属 |
|--------|-----|------|----------|
| **P0** | E-04 | `submitSubmission`：校验 + POST `{ data }` + 返回 id | editor eventEngine |
| **P0** | E-24 | PublishView 注入 `board.variables` + URL query 映射 | editor PublishView |
| **P0** | E-25 | absolute 布局下 `submit` 聚合所有 formId 表单校验 | editor SchemaNode |
| **P0** | E-03 | AdvancedTable 嵌套字段 `data.xxx` 列 + submission 列表 | editor + 文档约定 |
| **P0** | E-26 | 联动配置：`LinkageConfig.vue` 写入 `linkages`（非死 `rules`） | editor PropertyPanel |
| **P1** | F-08/F-09 | Flow embed `/embed/task/:taskId` 审批操作 | flow ✅ |
| **P1** | S-13 | submission 回写 `flowInstanceId` | server |
| **P1** | E-01/02 | FgFlowTimeline + FgFlowTaskActions 替代 iframe 拼装 | editor widgets |

---

## 9. 页面交付 Checklist（每个 Schema 发布前）

- [ ] 画布尺寸与 Shell 内容区匹配，无横向滚动条
- [ ] 表单字段均在 `form` 容器内，`field` + `validationRules` 完整
- [ ] 提交按钮事件链：校验 → 存盘 →（启流程）→ 反馈 → 跳转
- [ ] 列表 API 分页、空态、loading 可用
- [ ] 行操作/工具栏按钮均配 `confirm`（删除/撤回）
- [ ] 详情页只读：view 模式或 descriptions
- [ ] 流程相关：Webhook 或 startFlow 已测通
- [ ] 菜单已绑 `schemaId`，permission 正确
- [ ] 发布后 PublishView 自测 + 非 admin 角色抽测

---

## 10. 与其他文档关系

| 文档 | 关系 |
|------|------|
| [05-搭建模式与规范](./05-build-patterns.md) | 业务逻辑模式 |
| [06-Schema-First](./06-schema-first-architecture.md) | 全部 Schema 搭建 |
| [03-hr-personnel 请假](./modules/03-hr-personnel.md) | 请假业务字段 |
| [02-能力缺口](./02-capability-gap-and-extensions.md) | 扩展项登记 |
| editor `docs/property-panel.md` | 属性面板细节 |

---

**结论：** 可交付 UI = **Board 画布规范 + Widget 标准组合 + 事件链/API/Flow 闭环**。当前最大缺口在 **表单提交与 PublishView 运行时**；Phase 1 应优先修 E-04/E-24/E-25，同时 **审批操作复用 Flow `/tasks`**，不在 Schema 里重复造轮子。
