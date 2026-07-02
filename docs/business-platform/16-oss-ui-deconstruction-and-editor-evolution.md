# 16 — 开源 UI 解构 × Editor 能力演进（业务实现方法论）

> **本文目的**：不是再列一张功能清单，而是回答三个问题：  
> 1. 成熟 OA 的**界面长什么样、怎么分层、组件怎么协作**  
> 2. 我们 Editor **现在有什么、缺什么、为什么 seed 页面像死的**  
> 3. 能力平台**下一步要造什么 Widget/机制**，业务才能按开源水准迭代  

最后更新：2026-07-02

---

## 0. 诊断：为什么现在的 deliverable「像死的」

| 现象 | 根因 | 开源产品怎么做 |
|------|------|----------------|
| 128 页只有 title + 5 列 Table | Server 用 `list()` 工厂吐同构 JSON | JeecgBoot **代码生成器**按实体生成 4 文件完整 CRUD 页 |
| 申请表单只有 title + reason | `apply()` 工厂 + `DEFAULT_FORM_FIELDS` | O2OA **表单设计器**按业务拖 10+ 字段 + 校验 + 联动 |
| 有 Dialog 但要手写 20 条 events | 只有**原子 Widget**，没有**页面级复合件** | JeecgBoot `useListPage` **一个 hook 绑定** 搜索+表格+弹窗+导入导出 |
| 设计器里搜不到 searchBar 字段配置 | PropertyPanel 只有 `searchBar.enabled` 开关 | JeecgBoot `searchFormSchema` 在 `.data.ts` **可视化 schema 数组** |
| 用户管理能用、业务台账不能用 | **FgUserManagement** 是完整 Vue 页，AdvancedTable 只是表格 | 开源：**ListPage = 组合组件**；我们：**ListPage = 手工拼图** |

**结论**：问题不在「业务字段写没写对」，而在 **Editor 缺少与 JeecgBoot `useListPage` / O2OA「表单+门户」同级别的页面复合能力**。  
Server 端 `buildCrudSubmissionListPage` 只是在 JSON 里模拟，**设计器无法配置、无法复用、无法迭代**。

---

## 1. 三家开源产品的 UI 体系解构

### 1.1 JeecgBoot Vue3 — CRUD 列表页（最贴近「台账」）

**参照**：[代码生成 List 模板](https://github.com/shingle2302/jeecg-skills/blob/main/jeecg-codegen/codegen-reference.md) · [请假案例](http://www.jeecgboot.com/leave/)

#### 文件结构（一个业务实体 = 4 前端文件）

```
views/biz/leave/
├── leave.api.ts          # list/add/edit/delete/export/import API
├── leave.data.ts         # columns + searchFormSchema + formSchema + superQuerySchema
├── LeaveList.vue         # 列表主页面
└── components/
    └── LeaveModal.vue    # 新增/编辑弹窗（BasicModal + BasicForm）
```

#### 页面区域划分（LeaveList.vue）

```
┌─────────────────────────────────────────────────────────────┐
│ 【A】查询区  BasicTable 内嵌 Form（searchFormSchema）         │
│     关键词 | 状态下拉 | 日期范围 | [查询][重置][展开]         │
│     + superQuery 高级查询（superQuerySchema）                 │
├─────────────────────────────────────────────────────────────┤
│ 【B】工具栏  tableTitle + 按钮组                              │
│     [新增] [导出] [导入] [批量删除]  （权限 v-auth 控制）      │
├─────────────────────────────────────────────────────────────┤
│ 【C】数据区  BasicTable                                       │
│     多选列 | 业务列... | 【D】操作列 TableAction              │
│     查看 | 编辑 | 删除 | 更多▼(dropdown)                      │
├─────────────────────────────────────────────────────────────┤
│ 【E】分页  内置 pagination                                    │
└─────────────────────────────────────────────────────────────┘
        ↕ openModal(record) / handleSuccess → reload()
┌─────────────────────────────────────────────────────────────┐
│ 【F】LeaveModal  BasicModal                                   │
│     BasicForm（formSchema）                                   │
│     [确定] → API add/edit → emit success → reload table      │
└─────────────────────────────────────────────────────────────┘
```

#### 核心 hook：`useListPage`

一次配置绑定：

| 能力 | 配置项 |
|------|--------|
| 列表 API | `tableProps.api` |
| 列 | `tableProps.columns` |
| 搜索表单 | `tableProps.formConfig.schemas` |
| 导出 | `exportConfig.url` |
| 导入 | `importConfig.url` |
| 行选择 | `tableContext.rowSelection` |
| 刷新 | `reload()` |

**数据流**：`searchForm → beforeFetch merge queryParam → API → table`；`Modal success → reload()`。

#### `.data.ts` 里有什么（设计器应对标的数据模型）

```typescript
// columns — 表格列（含 dict 渲染、slot 自定义）
export const columns: BasicColumn[] = [
  { title: '假别', dataIndex: 'leaveType', customRender: ({ text }) => renderDict(text, 'leave_type') },
  ...
];

// searchFormSchema — 查询区（不是表格 props 里的开关）
export const searchFormSchema: FormSchema[] = [
  { field: 'keyword', component: 'Input', colProps: { span: 6 } },
  { field: 'status', component: 'JDictSelectTag', componentProps: { dictCode: 'leave_status' } },
  { field: 'dateRange', component: 'RangePicker', fieldMapToTime: [['dateFrom','dateTo']] },
];

// formSchema — 弹窗表单
export const formSchema: FormSchema[] = [ ... ];

// superQuerySchema — 高级查询
export const superQuerySchema = { ... };
```

---

### 1.2 O2OA — 流程表单 + 门户（最贴近「申请/审批/内容」）

**参照**：[表单设计器](https://www.o2oa.net/cms/workflow/634.html) · [数据表格](https://www.o2oa.net/cms/workflow/150.html) · [门户组件](https://www.o2oa.net/cms/portal/512.html) · [CMS 信息发布](https://www.o2oa.net/cms/train/59.html)

#### 设计器四区（与我们的 Editor 对照）

| O2OA 区域 | 作用 | 我们 Editor 对标 |
|-----------|------|------------------|
| 元素区 | 拖拽组件库 | Widget 面板（79 个） |
| 设计区 | 可视化排版 | Board 绝对定位 canvas |
| 元素列表 | 层级树 | 左侧 Widget 树 ✅ |
| 属性区 | 基本/样式/事件/JSON | PropertyPanel ✅ |

#### O2OA 表单 vs 阅读表单（双态）

| 态 | 用途 | 我们的对标 |
|----|------|------------|
| **编辑表单** | 拟稿、申请、发布 | P-02 申请页 `FgForm` |
| **阅读表单** | 发布后查看、审批只读 | P-03 `FgDescriptions` 或只读 Form |
| **提交表单** | 审批意见、手写签批 | `FgApprovalComment` + Flow 提交配置 |

CMS 公告：**编辑表单**（标题、范围、Richtext）→ 发布 → **阅读表单**展示。  
我们目前 `oa-notice-publish` 和 `oa-notice-detail` **没有区分双态**，只有单页。

#### O2OA 数据表格（明细行 / 报销明细）

- 多行编辑、列内拖入基础组件（文本/数字/下拉）
- 支持 Excel 导入导出、列合计
- 区段：多人处理时按关键字拆分数据

**对标**：我们 `dynamic-detail-table`（E-15）已有 Widget，但 **PropertyPanel 未纳入标准报销模板**，deliverable 未用。

#### O2OA 门户页面组件分类

| 大类 | 组件 | 业务用途 |
|------|------|----------|
| 布局 | 容器、Tab | 页面骨架 |
| 表单 | 人员组织、日期、下拉 | 申请字段 |
| 数据 | **数据表格**、**嵌入视图**、**嵌入统计** | 台账、列表、图表 |
| 功能 | 平台应用、Iframe | 嵌入子系统 |

**关键**：O2OA 列表不是「一个 Table Widget」，而是 **嵌入视图（View）** — 绑定数据视图配置，带筛选、列、分页。  
等价于 JeecgBoot 的 **ListPage 整体**。

#### O2OA 表单事件体系（比我们 eventEngine 更细）

| 事件 | 时机 |
|------|------|
| beforeLoad / afterLoad | 表单载入 |
| beforeSave / afterSave | 保存草稿 |
| beforeProcess / afterProcess | 流转审批 |
| beforeRetract / afterRetract | **撤回** |
| submit / beforeProcessWork | 提交前校验 |

我们 `eventEngine` 有 navigate/submitSubmission/open-dialog，但 **缺 beforeLoad 级页面生命周期、缺撤回/撤销一等 action**。

---

### 1.3 RuoYi Office — 业务域复合模块

**参照**：[全景介绍](http://ruoyioffice.com/blog/default/ruoyi-office-all-in-one-enterprise-platform) · [假期余额](https://jishuzhan.net/article/2051826065543331841)

特点：**不是通用 CRUD，而是域模块自带 UI 体系**。

| 模块 | UI 结构 | 数据层 |
|------|---------|--------|
| 请假 | 申请单 + 台账 + **余额卡片** | LeaveBalanceService 账户/流水/预占 |
| 用印 | **印章台账** + 申请 + **用印记录追溯** | 主数据 + 流程 |
| 合同 | **起草单** + **台账** 双表同 ID 镜像 | contract_info / contract_ledger |
| 会议室 | **资源日历** + 预定 + 冲突检测 | 资源 + 时间轴 |

**启示**：复杂业务不能只用 submission 一张表 + 通用 Table，需要 **域 API + 域 Widget（或域 ListPage 配置）**。

---

## 2. 标杆对照：请假台账一页的「逐层映射」

### 2.1 JeecgBoot 请假台账（应有）

| 层级 | 内容 |
|------|------|
| L0 路由 | `/hr/leave/list` |
| L1 页面 | `LeaveList.vue` |
| L2 区域 | 查询区 / 工具栏 / 表格 / 分页 / Modal |
| L3 组件 | BasicTable, TableAction, BasicModal, BasicForm |
| L4 配置 | columns, searchFormSchema, formSchema（`.data.ts`） |
| L5 数据 | `list(params)` REST |

### 2.2 我们 `hr-leave-list`（现状）

| 层级 | 内容 | 差距 |
|------|------|------|
| L0 | `/app/editor/view/hr-leave-list` | ✅ |
| L1 | 一个 Schema JSON | ❌ 无「页面」抽象，只有 Board |
| L2 | FgTitle + FgAdvancedTable + FgDialog | ⚠️ 区域有，但 **Dialog 与 Table 靠 events 硬连** |
| L3 | 原子 Widget 拼图 | ❌ 无 ListPage 复合件 |
| L4 | columns/searchBar 写在 server TS | ❌ **设计器不可配** searchBar.fields |
| L5 | `/submissions/{schemaId}` | ✅ |

### 2.3 我们 `FgUserManagement`（做对了什么）

路径：`schema-form-editor/src/widgets/user-management/FgUserManagement.vue`

**一个 Widget 内聚了 JeecgBoot 整个 ListPage：**

| 内聚能力 | 代码位置 |
|----------|----------|
| 搜索框 | `searchQuery` + `handleSearch` |
| 表格+分页 | `loadData` + `el-table` + `el-pagination` |
| 新增/编辑 Dialog | `dialogVisible` + `formData` + `formRules` |
| 重置密码 Dialog | 第二个 modal |
| 批量选择 | `selectedRows` |
| API | 直接调 `userApi` |

**PropertyPanel 只暴露**：`tableColumns`, `pageSize`, `searchable` — 仍然比 AdvancedTable 好用，因为 **行为在 Widget 内部，不在 JSON events 里**。

**问题**：硬编码 `userApi`，无法配置到其他实体 → 需要 **可配置版 UserManagement**。

---

## 3. Editor 现状：原子能力 vs 页面能力

### 3.1 已有原子 Widget（79 个）— 足够拼，不够「造页」

| 分组 | 数量 | 能做什么 | 不能做什么 |
|------|------|----------|------------|
| form | 26 | 字段采集 | 不会自己组成「申请页模板」 |
| table | 3 | 展示+分页+部分搜索 | 不含 Modal CRUD 闭环 |
| business | 14 | UserMgmt、Flow、Kanban… | 仅 2 个 CRUD（user/role） |
| layout/container | 14 | 骨架 | 无「ListPage 布局模板」 |

### 3.2 AdvancedTable 真实能力边界

文件：`FgAdvancedTable.vue`

| 已有 | 缺失（JeecgBoot 有） |
|------|----------------------|
| searchBar input/select | dateRange、cascader、dict 组件、**PropertyPanel 编辑 fields** |
| toolbar 按钮 → events | 导入、批量删除、**权限码** |
| row buttons → events | dropdown 更多、**动态显示条件** |
| exportData action | 与 searchParams **自动合并** |
| serverSideFilter | superQuery 级联条件 |

### 3.3 eventEngine 真实能力

文件：`eventEngine.ts`

| action | 用途 |
|--------|------|
| submitSubmission | 申请提交 |
| open-dialog / set-variable | 台账弹窗 |
| exportData | 导出 |
| navigate | 跳全屏审批 |
| refresh / trigger-event | 刷表 |

**缺失**：importData、batchDelete、flowRetract、flowCancel、openDrawer、**modal CRUD 标准链**（open→submit API→close→refresh 模板）

### 3.4 PropertyPanel 配置缺口（阻塞设计器造页）

| Widget | 设计器可配 | 必须改 JSON 才能配 |
|--------|------------|-------------------|
| advanced-table columns | ✅ advanced-columns 编辑器 | |
| advanced-table toolbar | ✅ action-buttons 编辑器 | |
| advanced-table searchBar | ❌ 仅 enabled 开关 | **fields 数组** |
| dialog children | ✅ 拖子 Widget | |
| dialog ↔ table 事件 | ⚠️ EventConfigDialog | 整条链手动 |
| adhoc-query fields | ❌ JSON | targetTableId |

---

## 4. 能力平台演进：要造什么（不是再写 JSON 工厂）

### 4.1 核心：新增「页面复合 Widget」层

在 **atomic widgets** 之上增加 **page patterns**（设计器里单独分组 `page-pattern`）：

```
┌─────────────────────────────────────────┐
│  Page Pattern Widgets（新建）            │
│  ├─ FgCrudListPage    ← 对标 useListPage │
│  ├─ FgFlowApplyPage   ← 对标 O2OA 编辑表单│
│  ├─ FgFlowDetailPage  ← 对标 阅读+审批    │
│  ├─ FgMasterDetail    ← 对标 左树右表     │
│  ├─ FgContentPublish  ← 对标 CMS 双表单   │
│  └─ FgStatsDashboard  ← 对标 门户统计     │
└─────────────────────────────────────────┘
           ↓ 内部组合
┌─────────────────────────────────────────┐
│  Atomic Widgets（现有 79）               │
└─────────────────────────────────────────┘
```

### 4.2 E-45 `FgCrudListPage` — 规格（应对标 JeecgBoot useListPage）

**一个 Widget，PropertyPanel 配置整页：**

```typescript
interface CrudListPageProps {
  title: string
  listApi: { url: string; dataPath?: string }
  detailApi?: { url: string }           // 弹窗 Descriptions
  exportApi?: { url: string; filename: string }
  importApi?: { url: string }
  columns: AdvancedTableColumn[]
  searchSchemas: FormFieldSchema[]        // 对标 searchFormSchema
  toolbar: ToolbarAction[]              // add | export | import | batchDelete
  rowActions: RowAction[]               // view | edit | delete | approve | dropdown
  formSchemas?: FormFieldSchema[]       // Modal 新增/编辑（可选）
  dialogs: {
    detail?: { title: string; mode: 'descriptions' | 'form' }
    form?: { title: string; width: string }
  }
  flow?: {
    applySchemaCode?: string            // 工具栏「发起」跳转
    detailSchemaCode?: string           // 「审批」跳全屏
  }
  permissions?: Record<string, string> // 按钮 → permission 码
}
```

**内部实现（Editor）：**

| 子区域 | 实现方式 |
|--------|----------|
| 查询区 | 内嵌 `searchSchemas` 渲染（复用 Form 字段组件） |
| 表格 | 内调 AdvancedTable 逻辑或提取 `useCrudTable` composable |
| 详情弹窗 | 内嵌 Dialog + Descriptions（detailApi） |
| 表单弹窗 | 内嵌 Dialog + Form（formSchemas + CRUD API） |
| 行为 | **Widget 内部 TypeScript**，不是 board.events JSON |

**Server deliverable 变为：**

```typescript
// 不再是 200 行 widgets JSON，而是：
buildCrudListPage({ ...config }) // → 单个 FgCrudListPage widget 的 props
```

**设计器体验**：选「CRUD 台账模板」→ 配 API/列/搜索/按钮 → 发布。与 JeecgBoot 代码生成 **同信息量**。

### 4.3 E-46 SearchSchema 编辑器（PropertyPanel）

对标 JeecgBoot `searchFormSchema`：

- 在 PropertyPanel 增加 **`search-schemas` 编辑器**（复用 Form 字段类型：Input/Select/DateRange/Dict/Cascader）
- AdvancedTable 的 `searchBar.fields` 改用同一编辑器
- 运行时 `FgAdvancedTable` 补齐 date/dateRange/cascader 渲染

### 4.4 E-47 `FgFlowApplyPage` — 对标 O2OA 编辑表单

**Props 模型：**

```typescript
interface FlowApplyPageProps {
  title: string
  formSchemas: FormFieldSchema[]
  submitSchemaId: string
  successNavigate?: string
  linkages?: LinkageRule[]
  sidebarAi?: { context: string }      // RAG 差旅制度
  draftEnabled?: boolean               // O2OA beforeSave
}
```

内聚：FgForm + 校验 + submitSubmission + 跳转 + 可选 AI Sidebar iframe。

### 4.5 E-48 `FgFlowDetailPage` — 对标 O2OA 阅读+审批

Tabs 结构（O2OA/Jeecg 详情常见）：

```
Tabs
├── 申请信息  → Descriptions（detailApi）
├── 审批记录  → FgFlowTimeline
├── 附件      → FgFileList
└── 审批操作  → ApprovalComment + FlowTaskActions（条件显示 assignee）
```

### 4.6 E-49 `FgContentPublishPage` — 对标 O2OA CMS

双 Schema 配置：

- `editSchemas` — 发布表单
- `readSchemas` — 阅读态（或使用 readTemplateId）
- `publishApi` / `scopeField`（读者控件）

### 4.7 E-50 域 Widget 扩展路线（RuoYi 式）

| 域 | Widget | 说明 |
|----|--------|------|
| 印章 | `FgSealManagement` | 台账+申请+记录，配置 sealApi |
| 合同 | `FgContractLifecycle` | 起草/台账双态 |
| 假期 | `FgLeaveBalanceCard` | 余额展示+预占（RuoYi） |
| 会议室 | `FgMeetingCalendar` | 已有 calendar，需资源+冲突 API |

**原则**：域 Widget 继承 **FgCrudListPage 的可配置模式**，而非再写 `list()` 工厂。

---

## 5. 业务落地新范式（禁止再堆 JSON）

### 5.1 旧范式（已证明失败）

```
modules/extended.ts → list() / apply() → 同构 JSON → seed → 「有菜单无业务」
```

### 5.2 新范式

```
① 读 16 本文 + interface-specs 某页
② 确定 Page Pattern（CrudList / FlowApply / FlowDetail / ContentPublish）
③ 若 Pattern 不满足 → 先扩 Editor（E-45~50）再写业务
④ Server 只生成 Pattern props + 域 API
⑤ 设计器可打开、可改、可发布
⑥ 验收对照 JeecgBoot/O2OA 同源功能点
```

### 5.3 迁移优先级

| 阶段 | Editor | 业务 | 验收标准 |
|------|--------|------|----------|
| **P0** | 实现 E-45 CrudListPage + E-46 SearchSchema 编辑器 | HR 请假台账、OA 出差台账 | 设计器可配搜索字段，无需改 JSON |
| **P1** | E-47 FlowApplyPage、E-48 FlowDetailPage | 请假/出差 apply+detail | 对标 JeecgBoot 请假案例全流程 |
| **P1** | E-15 明细行接入 PropertyPanel 模板 | 报销/采购 apply | 对标 O2OA 数据表格 |
| **P2** | E-49 ContentPublish | 公告三页 | 对标 O2OA CMS 双表单 |
| **P2** | S-05 Notice API、S-10 LeaveBalance | 公告、请假余额 | 对标 RuoYi 域服务 |
| **P3** | 批量把 ~40 个 list() 页迁到 CrudListPage config | 全模块台账 | 无 DEFAULT_LIST_COLUMNS |

---

## 6. 与 interface-specs 的关系（修正）

| 文档 | 职责 |
|------|------|
| **16 本文** | **怎么造页、Editor 怎么扩**（主文档） |
| `15-open-source-benchmarks.md` | 功能点来源索引 |
| `interface-specs/*.md` | 每页 **Pattern 选型 + props 草案 + API**（需按 16 重写，不是列字段名） |
| `07-deliverable-ui-board-widget-flow.md` | Board JSON 技术规范（Pattern 内部仍遵守） |

**interface-specs 每一页必须增加：**

1. **Page Pattern**（CrudList / FlowApply / …）  
2. **props 配置草案**（可直接 feed E-45）  
3. **JeecgBoot/O2OA 截图级布局描述**（区域 A~F）  
4. **Editor 缺口 ticket**（E-xx）  

---

## 7. 立即行动项（能力平台）

| 优先级 | 任务 | 项目 | 产出 |
|--------|------|------|------|
| P0 | **E-45 FgCrudListPage** | editor | 可配置 CRUD 台账 Widget |
| P0 | **E-46 SearchSchema 编辑器** | editor | PropertyPanel 配搜索区 |
| P0 | CrudListPage props builder | server | 替代 `buildCrudSubmissionListPage` 吐 JSON |
| P1 | E-47/E-48 Flow 申请/详情 Page | editor | 替代手写 Form+Dialog 链 |
| P1 | flowRetract / flowCancel actions | editor+flow | 对标 JeecgBoot 撤回/撤销 |
| P2 | E-49 ContentPublish | editor+server S-05 | OA 公告 |

---

## 8. 参考链接

- JeecgBoot 代码生成 List 模板：https://github.com/shingle2302/jeecg-skills/blob/main/jeecg-codegen/codegen-reference.md  
- JeecgBoot 请假案例：http://www.jeecgboot.com/leave/  
- O2OA 表单设计：https://www.o2oa.net/cms/workflow/634.html  
- O2OA 数据表格：https://www.o2oa.net/cms/workflow/150.html  
- O2OA 信息发布：https://www.o2oa.net/cms/train/59.html  
- O2OA 门户组件：https://www.o2oa.net/cms/portal/512.html  
- RuoYi Office 全景：http://ruoyioffice.com/blog/default/ruoyi-office-all-in-one-enterprise-platform  
- 本平台 UserManagement 参考实现：`schema-form-editor/src/widgets/user-management/FgUserManagement.vue`  
- 本平台 AdvancedTable：`schema-form-editor/src/widgets/advanced-table/FgAdvancedTable.vue`  
