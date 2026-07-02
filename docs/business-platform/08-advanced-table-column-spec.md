# 08 — 高级表格列能力规范（Tooltip / 标签 / 按钮 / 筛选）

> 业务模块 **80+ 列表页** 中，约 **90% 依赖 `advanced-table`**。  
> 本文对照 **真实代码**（`FgAdvancedTable.vue`、`AdvancedColumnsEditor.vue`），说明：**已有什么、怎么用、缺什么要扩展**。

## 1. 结论先行

| 能力 | 设计器 UI | 运行时 | 业务模块常用度 | 状态 |
|------|-----------|--------|----------------|------|
| 文本列 | ✅ | ✅ | 高 | **可用** |
| 溢出省略 tooltip | ✅ showTooltip | ✅ el-table overflow | 高 | **可用** |
| 独立 tooltip 列 | ✅ render=tooltip | ✅ | 中 | **可用** |
| 标签 tag | ✅ + colorMap | ✅ | **极高**（状态/假别/审批） | **可用** |
| 徽章 badge | ✅ | ✅ | 中 | **可用** |
| 链接 link | ✅ | ✅ + 事件 | 高 | **可用** |
| 行内按钮组 | ✅ | ✅ + 条件/确认 | **极高** | **可用** |
| 工具栏按钮 | ✅ | ✅（无图标渲染） | **极高** | **半残** |
| 列排序 | ✅ | ✅ 服务端 sort 传参 | 高 | **可用** |
| 列筛选 filter | ✅ 开关 | ❌ **未接 filters** | **极高** | **残缺** |
| 分页 | ✅ | ✅ | **极高** | **可用** |
| 多选 + 批量 | ✅ | ✅ | 高 | **可用** |
| 字典着色 tag | 仅 JSON/API | 手动 options | **极高** | **需扩展** |
| 嵌套字段 `data.xxx` | ✅ prop 可填 | ❌ 未解析路径 | **极高** | **需扩展** |
| 顶部搜索区 | 无 | 需另配 Widget | **极高** | **需扩展** |
| 服务端列筛选 | 无 | 无 | 高 | **需扩展** |
| 自定义 renderFn | ✅ 配置 | ❌ 未实现 | 低 | **占位** |

**原则：** 模块文档里写的「台账列」必须映射到上表；标记为 **残缺/需扩展** 的，在 Editor 扩展完成前不能宣称可交付。

---

## 2. Advanced Table 配置结构

### 2.1 Widget 级（propertyPanel）

| 属性 | 说明 |
|------|------|
| `columns` | 列数组 → `AdvancedColumnsEditor` |
| `toolbar` | 工具栏按钮 → `ActionButtonsEditor` |
| `api` | 列表数据源（Widget 级 API 面板） |
| `pagination` | enabled / pageSize / pageSizes |
| `selection` | 多选 |
| `stripe` / `border` / `height` | 样式 |
| `sortable` | 全局开启列排序 |

### 2.2 列级（AdvancedTableColumn）

```typescript
interface AdvancedTableColumn {
  prop: string           // 字段路径 — 当前仅支持一级 key
  label: string
  width?: number | 'auto'
  minWidth?: number
  fixed?: 'left' | 'right'
  align?: 'left' | 'center' | 'right'
  sortable?: boolean | 'custom'
  render?: 'text' | 'link' | 'tag' | 'badge' | 'image' | 'buttons' | 'tooltip' | 'custom'

  // Tooltip
  showTooltip?: boolean      // 溢出省略 + native tooltip
  tooltipField?: string      // render=tooltip 或 tooltip 内容字段

  // Tag / Badge
  colorMap?: Record<string, string>   // 值 → el-tag type
  options?: Array<{ label, value }> // 显示文案映射
  api?: SchemaApiConfig               // 动态 options

  // Link
  linkEvent?: string         // 事件 target: link-{prop}

  // Buttons
  buttons?: ActionButton[]   // render=buttons

  // Filter — 运行时只看 filters，filterable 开关无效！
  filterable?: boolean       // ⚠️ 当前未接入 runtime
  filters?: Array<{ text: string; value: unknown }>
  filterMethod?: Function

  // Custom — 未实现
  renderFn?: string
}
```

### 2.3 行内/工具栏按钮（ActionButton）

```typescript
interface ActionButton {
  key: string
  label: string
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'text'
  icon?: string              // ⚠️ toolbar 未渲染 icon
  size?: 'small' | 'default'
  confirm?: string           // 原生 confirm（非 ElMessageBox）
  visibleCondition?: string  // 表达式，如 row.status === 'submitted'
  events?: ButtonEventConfig[]  // 行内按钮可配动作链
}
```

**事件绑定方式：**

| 来源 | eventTarget | 配置位置 |
|------|-------------|----------|
| 工具栏按钮 | `toolbar-{key}` | Widget events 面板 |
| 行内按钮 | `row-{key}` | 列 buttons 内 ActionListEditor 或 Widget events |
| 链接列 | `link-{prop}` | Widget events 面板 |
| 行点击 | `row-click` | Widget events 面板 |
| 翻页 | `page-change` | Widget events 面板 |

---

## 3. 列渲染模式 — 业务用法

### 3.1 文本 + 溢出 Tooltip（事由、备注、标题）

**场景：** 请假事由、审计问题描述、合同名称

```json
{
  "prop": "reason",
  "label": "事由",
  "minWidth": 200,
  "showTooltip": true,
  "render": "text"
}
```

长文本列建议 `minWidth ≥ 180`，`showTooltip: true` 避免撑破布局。

---

### 3.2 标签 Tag（状态、类型、优先级）

**场景：** 全模块「状态」列 — 提交/审批中/已通过/已驳回

```json
{
  "prop": "status",
  "label": "状态",
  "width": 100,
  "render": "tag",
  "align": "center",
  "colorMap": {
    "submitted": "warning",
    "approved": "success",
    "rejected": "danger"
  },
  "options": [
    { "label": "审批中", "value": "submitted" },
    { "label": "已通过", "value": "approved" },
    { "label": "已驳回", "value": "rejected" }
  ]
}
```

**Flow 实例状态扩展（E-13）：** `running` / `completed` / `cancelled` 等，colorMap 统一维护在模块文档。

**假别/费用类型 — 应对接字典（E-28）：**

```json
{
  "prop": "data.leaveType",
  "label": "假别",
  "render": "tag",
  "dictCode": "leave_type"
}
```

> `dictCode` 为 **待扩展**；当前只能手写 `options` JSON。

---

### 3.3 徽章 Badge（数量、预警）

**场景：** 整改超期天数、待办数、到期天数

```json
{
  "prop": "overdueDays",
  "label": "逾期",
  "width": 80,
  "render": "badge",
  "colorMap": { "0": "success", "3": "warning", "7": "danger" }
}
```

计装到期预警见 [08-metrology-equipment](./modules/08-metrology-equipment.md) — 需 **E-18 日期预警列** 更贴合业务。

---

### 3.4 链接 Link（单号、标题进详情）

**场景：** 请假单号、报告标题、项目名称

```json
{
  "prop": "_id",
  "label": "单号",
  "width": 120,
  "render": "link",
  "linkEvent": "view"
}
```

Widget events → `link-_id` 或 `row-view`：

```json
{
  "trigger": "click",
  "eventTarget": "link-_id",
  "actions": [{
    "type": "navigate",
    "navigatePath": "/app/editor/view",
    "navigateQuery": {
      "id": "{DETAIL_SCHEMA_ID}",
      "recordId": "row._id"
    }
  }]
}
```

> `navigateQuery` 引用 row 字段 — 需 **E-29 事件上下文 row 变量解析**（当前需验证是否支持 `row._id` 表达式）。

---

### 3.5 行内按钮组（查看 / 编辑 / 撤回 / 删除）

**场景：** 所有台账操作列，`fixed: "right"`

```json
{
  "prop": "action",
  "label": "操作",
  "width": 200,
  "fixed": "right",
  "render": "buttons",
  "buttons": [
    {
      "key": "view",
      "label": "查看",
      "type": "primary",
      "size": "small"
    },
    {
      "key": "withdraw",
      "label": "撤回",
      "type": "warning",
      "size": "small",
      "visibleCondition": "row.status === 'submitted'",
      "confirm": "确认撤回该申请？"
    },
    {
      "key": "delete",
      "label": "删除",
      "type": "danger",
      "size": "small",
      "visibleCondition": "row.status === 'draft'",
      "confirm": "确认删除？"
    }
  ]
}
```

事件在 Widget 级绑定 `row-view` / `row-withdraw` / `row-delete` 动作链。

---

### 3.6 Tooltip 列（独立图标提示）

**场景：** 列显示摘要，hover 显示完整说明/法规条款

```json
{
  "prop": "summary",
  "label": "摘要",
  "render": "tooltip",
  "tooltipField": "fullDescription",
  "minWidth": 120
}
```

---

### 3.7 列筛选 Filter

**设计意图：** 表头漏斗筛选（如按状态、假别）

**现状 BUG：**

- 设计器有「列筛选」开关 → 写入 `filterable: true`
- 运行时 **只读取 `col.filters` 数组**，`filterable` **完全被忽略**
- 设计器 **没有** 配置 `filters` 列表的 UI

**临时方案（可交付前）：**

1. 手动在 JSON 中加 filters（不友好）
2. 顶部用 **select + button** 搜索区，`set-search-params` 事件刷新表格（推荐过渡）

**必修扩展 E-27：**

```
filterable=true → 设计器展示 filters 编辑器
              → 或 dictCode 自动生成 filters
              → runtime: filterable && filters 生效
```

**服务端筛选 E-30：** 表头筛选变更 → `setSearchParams` → API 带 `status=xxx` 重新请求（业务台账必须，否则仅筛当前页）。

---

## 4. 工具栏标准配置

### 4.1 通用工具栏

```json
"toolbar": [
  { "key": "add", "label": "新建", "type": "primary", "icon": "plus" },
  { "key": "export", "label": "导出", "type": "default", "icon": "download" },
  { "key": "batchDelete", "label": "批量删除", "type": "danger",
    "visibleCondition": "selectedCount > 0", "confirm": "确认删除选中项？" }
]
```

| 按钮 | 典型事件 |
|------|----------|
| add | navigate → 申请 Schema |
| export | api GET `/submissions/{id}/export?format=xlsx` |
| batchDelete | api POST batch/delete + refresh |

**缺口 E-31：** toolbar `icon` 字段已配置但 **FgAdvancedTable 未渲染 AppIcon**。

---

## 5. 列表页完整排布（可交付模板）

```
Board 1440×900
├── title「请假台账」                    y=0
├── card「搜索区」                       y=48, h=72
│     double-col
│       select field=status  (假别/状态)
│       input  field=keyword (申请人/单号)
│     toolbar-buttons [查询] [重置]
│       → 查询: trigger-event advanced-table.set-search-params
│       → 重置: 清空 + refresh
└── card                                 y=128, h=760
      advanced-table (height: 680)
        api + columns + toolbar + pagination
```

**搜索区不是表格内置能力**，需在 Board 上 **额外摆 Form 字段 + 按钮**，通过 `receivableEvents`:

| 事件 | 作用 |
|------|------|
| `refresh` | 重新 fetchData |
| `set-search-params` | 合并查询参数后 fetch |

**扩展 E-32（可选）：** `search-bar` 容器 Widget，与 advanced-table 声明式绑定，减少手工事件。

---

## 6. 各模块常用列配方

### 6.1 人事 / 请假台账

| 列 | render | 要点 |
|----|--------|------|
| 单号 | link | → 详情 Schema |
| 申请人 | text | prop 需 flatten 或 E-03 |
| 假别 | tag | dict leave_type |
| 天数 | text | align center |
| 申请时间 | text | sortable |
| 状态 | tag | submission.status colorMap |
| 流程状态 | tag | E-13 flowStatus |
| 操作 | buttons | view / withdraw |

### 6.2 财务 / 报销台账

| 列 | render | 要点 |
|----|--------|------|
| 报销单号 | link | |
| 部门 | text | |
| 金额 | text | align right |
| 费用类型 | tag | |
| 发票数 | badge | |
| 状态 | tag | |
| 操作 | buttons | view / print |

### 6.3 审计 / 问题清单

| 列 | render | 要点 |
|----|--------|------|
| 问题编号 | link | |
| 严重程度 | tag | colorMap 高/中/低 |
| 责任单位 | text | showTooltip |
| 发现日期 | text | sortable |
| 整改状态 | tag | |
| 逾期天数 | badge | E-18 |
| 操作 | buttons | view / urge |

### 6.4 计装 / 器具台账

| 列 | render | 要点 |
|----|--------|------|
| 器具编号 | link | |
| 名称 | text | showTooltip |
| 下次检定日 | text | sortable |
| 状态 | tag | 合格/限用/停用 |
| 预警 | tag/badge | E-18 到期计算 |
| 操作 | buttons | view / calibrate |

### 6.5 系统管理

| 场景 | 建议 |
|------|------|
| 用户/角色 | 直接用 **user-management / role-management** Widget，不必手搓表格 |
| 审计日志 | advanced-table + status tag + 时间 sortable + 详情 link |

---

## 7. 扩展清单（表格专项）

| ID | 扩展项 | 优先级 | 说明 |
|----|--------|--------|------|
| **E-27** | filterable 闭环 | **P0** | filters 编辑器 + runtime 读 filterable |
| **E-03** | 嵌套 prop `data.xxx` | **P0** | get(row, path) 或 API flatten |
| **E-28** | tag 列 dictCode | **P0** | 自动 options + colorMap |
| **E-29** | navigate/action row 表达式 | **P0** | `{{row._id}}` 在事件参数中解析 |
| **E-30** | 服务端列筛选 | **P1** | filter-change → setSearchParams |
| **E-31** | toolbar 图标渲染 | **P1** | AppIcon |
| **E-32** | search-bar 容器 Widget | **P1** | 搜索区 + 表格联动 |
| **E-33** | ElMessageBox 替代 window.confirm | **P1** | 按钮 confirm |
| **E-13** | flowStatus 列类型 | **P0** | 流程状态 tag |
| **E-18** | 日期预警列 | **P1** | 计装/合同到期 |
| **E-34** | custom renderFn 实现 | **P2** | 或禁止配置项 |
| **E-35** | 列模板库 seed | **P1** | 「状态列」「操作列」一键插入 |

归属：**schema-form-editor**（Widget + AdvancedColumnsEditor + eventEngine）

---

## 8. 与设计器配置路径

```
Editor → 选中 advanced-table → 属性面板
  ├── 列配置 (advanced-columns)  → 渲染方式/标签/按钮/筛选开关
  ├── 工具栏按钮 (action-buttons)
  ├── API 面板                   → 列表 URL / dataPath
  └── 事件面板                   → toolbar-*/row-*/link-*
```

**业务实施人员** 按本文 §6 配方在设计器点选；**研发** 按 §7 修残缺能力。

---

## 9. 验收标准（每个列表 Schema）

- [ ] 状态/类型列使用 **tag + colorMap**，非裸文本
- [ ] 长文本列 **showTooltip**
- [ ] 操作列 **buttons + fixed right + visibleCondition**
- [ ] 工具栏：新建、导出（如需要）、批量（如需要）
- [ ] 分页 server-side 总数正确
- [ ] 搜索：搜索区 → set-search-params（或 E-27 列筛选完成后）
- [ ] 行内删除/撤回有 **confirm**
- [ ] 嵌套字段显示正确（E-03 完成后）

---

相关：[07-可交付 UI 规范](./07-deliverable-ui-board-widget-flow.md) | [02-能力缺口](./02-capability-gap-and-extensions.md)
