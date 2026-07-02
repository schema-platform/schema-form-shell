# 05 — 搭建模式与规范

## 1. 四类页面模式

### 1.1 列表页（台账）

**用途：** 业务数据查询、筛选、导出、跳转详情。

**Widget 组合：**

```
Card
└── AdvancedTable
    ├── columns: 业务字段 + flowStatus + createdAt
    ├── toolbar: 新建、导出、刷新
    ├── filters: 状态、日期范围、关键词
    └── rowActions: 查看、编辑、撤回、删除
```

**数据逻辑：**

| 项 | 说明 |
|----|------|
| 数据源 | `GET /api/submissions?schemaId=xxx` 或业务 API |
| 分页 | page / pageSize 标准参数 |
| 权限 | 数据范围 all/dept/self 由 Server 中间件过滤 |
| 状态列 | 映射 submission.status 或 flowInstance.status |

**Flow 关联：** 列表每行可带 `flowInstanceId`，操作「查看审批」跳转详情 Schema 或 Flow embed。

**AI 增强：** 列表页可选挂载 AI Sidebar，支持「分析本月请假趋势」等自然语言查询（Phase 3）。

---

### 1.2 表单页（申请/登记）

**用途：** 数据采集、提交、触发流程。

**Widget 组合：**

```
Form (formId: leave-apply)
├── 基础字段 (Input/Select/Date/Textarea)
├── 组织人员 (UserSelector / TreeSelect)
├── 附件 (Upload)
└── ToolbarButtons [提交] [保存草稿]
```

**数据逻辑：**

| 步骤 | API | 说明 |
|------|-----|------|
| 校验 | 前端 Form rules + Server Zod | 必填、格式 |
| 提交 | `POST /api/submissions` | body: schemaId, data |
| 事件 | `submission.created` | EventBus |
| 启动流程 | Webhook 或显式 API | 见 1.5 |

**Flow 关联：** 一表单对应一 FlowDefinition（通过 Webhook 或 formSchemaId 配置）。

**AI 增强：**

- 填表时：制度 RAG 问答（「年假还剩几天？」）
- 提交前：合规检查 Agent

---

### 1.3 详情页（查看/审批）

**用途：** 展示单条数据、审批操作、流程轨迹。

**Widget 组合：**

```
Tabs
├── Tab「申请信息」→ Descriptions / 只读 Form
├── Tab「审批记录」→ FgFlowTimeline（扩展 E-01）或 Iframe /embed
└── Tab「附件」→ FileList

Card「审批操作」(仅待办人可见)
├── ApprovalComment
└── FgFlowTaskActions（扩展 E-02）
```

**数据逻辑：**

| 项 | 说明 |
|----|------|
| 入口 | 列表带 `?submissionId=` 或 `?taskId=` |
| 权限 | 发起人可看；当前 task assignee 可审 |
| 审批 | `POST /api/flow-tasks/:id/complete` |

**AI 增强：** 调用 `approval-suggestion`，展示建议意见（可采纳填入 ApprovalComment）。

---

### 1.4 统计页 / 大屏

**用途：** KPI、图表分析、领导驾驶舱。

**统计页 Widget 组合：**

```
TripleCol
├── Statistic (本月申请数)
├── Statistic (待审批数)
└── Statistic (通过率)

DoubleCol
├── BarChart (部门对比)
└── PieChart (类型分布)
```

**大屏组合：**

```
fullscreen layout + 深色主题
├── Title + 时钟
├── Row: Statistic x 4
├── Row: LineChart (趋势) + Gauge (完成率)
└── Heatmap (部门 x 日期)
```

**数据逻辑：**

| 项 | 说明 |
|----|------|
| 数据源 | `GET /api/dashboard/*` 或 submissions 聚合 |
| 刷新 | 扩展 E-09：定时 refreshInterval |

**AI 增强：** 生成文字报告 Agent，导出 PDF（Phase 4）。

---

## 2. 表单 ↔ 流程绑定模式

### 模式 A：Webhook 自动启动（推荐）

```
1. 创建 Webhook: event=submission.created, schemaId=请假Schema
2. 配置 flowDefinitionId=请假流程ID
3. 可选：字段映射 variables
```

Server 已有：`webhookDispatcher` 监听 `submission.created`。

**优点：** 表单无感、配置化  
**缺点：** 需在 Server 配置 Webhook 记录

### 模式 B：表单提交后 API 显式启动

Form 提交成功事件 → 调用：

```
POST /api/flow-instances
{ "definitionId": "xxx", "variables": { ...submission.data } }
```

**优点：** 前端可控  
**缺点：** 需 Editor 扩展 E-04 提交 Action

### 模式 C：Flow 表单节点

Flow UserTask 绑定 `formSchemaId`，打开任务时渲染 Schema。

**优点：** 多步采集  
**缺点：** 需 Flow 扩展 F-01/F-04

---

## 3. AI 嵌入模式

### 3.1 RAG 知识库（制度/政策）

```
1. AI 平台上传文档 → /app/ai/rag
2. OA 知识库菜单 → 同 RAG 或 Schema 嵌入 iframe
3. 业务表单旁 → AiSidebar iframe /ai/sidebar?context=leave
```

### 3.2 Agent 工作流

| 模板 | 触发 | 输入 | 输出 |
|------|------|------|------|
| 审批摘要 | Webhook / 手动 | submissionId + taskId | 建议意见 |
| 每日工作台 | Cron | userId | 待办摘要文本 |
| 会议纪要 | 表单提交 | 会议录音/笔记 | 结构化纪要 |
| 发票 OCR | 表单 Upload 事件 | 文件 URL | 金额/日期字段 |

### 3.3 对话式搭建

管理员在 AI 对话中说「做一个请假申请表」→ Editor Agent 生成 Schema → 人工微调 → 发布 → 绑定菜单。

---

## 4. Schema 命名与版本规范

| 字段 | 规范 | 示例 |
|------|------|------|
| name | 中文业务名 | 请假申请 |
| code | 模块-功能 | `hr-leave-apply` |
| 版本 | 发布后递增 | v1, v2 |
| 菜单 | 一菜单一项 schemaId | 不共用 |

---

## 5. 测试验收清单（每个界面）

| # | 检查项 |
|---|--------|
| 1 | 菜单可见且图标正确 |
| 2 | 页面加载无 404/权限错误 |
| 3 | 列表分页、筛选正常 |
| 4 | 表单校验与提交成功 |
| 5 | 流程实例创建（如适用） |
| 6 | 待办可见且可审批 |
| 7 | 审批后列表状态更新 |
| 8 | 统计数字与数据一致 |
| 9 | AI 功能可触发（如适用） |
| 10 | 文档「实施状态」已更新 |

---

详见 [07-可交付 UI 规范（Board→Widget→Flow）](./07-deliverable-ui-board-widget-flow.md) — 含画布尺寸、Widget 树、事件链、Flow 三种集成模式及 **交付 Checklist**。

## 6. 反模式（禁止）

| 反模式 | 正确做法 |
|--------|----------|
| 建设独立 Admin 微应用 | 系统管理用 Schema + UserManagement 等 Widget |
| 在 Shell 写业务 Vue 页 | 用 Schema + 菜单 |
| 在 Shell 直接 fetch 业务 API | API 聚合在 editor/api，Widget 绑定 |
| 硬编码审批逻辑 | Flow 引擎 |
| 编造 AppIcon 名 | 注册 iconRegistry |
| 跨项目改 server 接口（前端便利） | 适配已有 API 或提 server 需求 |
| 能力不够写兜底组件 | 扩展 Editor/Flow/AI |

---

模块文档：[modules/](./modules/)
