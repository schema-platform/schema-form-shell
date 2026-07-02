# 02 — 能力缺口与扩展清单

> 原则：**业务需求驱动能力扩展**。每项扩展标明归属项目、优先级、触发业务模块。  
> 架构约束：**不建 Admin 微应用**，所有 CRUD 界面优先 Schema → [06-Schema-First 架构决策](./06-schema-first-architecture.md)

## 1. 扩展决策流程

```
业务模块文档定义界面需求
        ↓
对照现有 Widget / Flow 节点 / AI 能力
        ↓
   ┌────┴────┐
   满足      不满足
   ↓          ↓
 Schema    创建扩展项 Issue
 配置       ↓
           在 editor / flow / ai / server / platform-shared 实现
           ↓
           本地 workspace:* 验证 → 发包（shared 包）→ 业务模块继续落地
```

## 2. Editor（schema-form-editor）扩展清单

### 2.1 已有且可直接用于业务

| 能力 | Widget / 功能 | 适用场景 |
|------|----------------|----------|
| 列表台账 | AdvancedTable, Table | 所有业务列表 |
| 表单采集 | Form + form 组 Widget | 申请单、登记 |
| 详情展示 | Descriptions, Card, Tabs | 审批详情、档案 |
| 统计卡片 | Statistic | 工作台 KPI |
| 图表 | bar/line/pie/gauge/heatmap/funnel 等 | 统计页、大屏 |
| 组织人员 | UserSelector, UserManagement, TreeSelect | 人事、审批 |
| 权限管理 | RoleManagement, PermissionTree | 系统管理 |
| 审批 UI | ApprovalComment, ApprovalUserPicker | 审批详情 |
| 嵌入 | Iframe | 临时嵌入 Flow 轨迹 |
| 文件 | Upload, FileList | 附件、材料 |

### 2.2 缺口与扩展项

| ID | 扩展项 | 业务触发模块 | 优先级 | 实现要点 |
|----|--------|--------------|--------|----------|
| E-01 | **Flow 轨迹嵌入 Widget**（FgFlowTimeline） | 所有审批详情 | P0 | 调用 `/api/flow-instances/:id/logs`，替代 Iframe 硬编码 |
| E-02 | **Flow 任务操作 Widget**（FgFlowTaskActions） | 审批详情 | P0 | 封装通过/驳回/委派 API，与 ApprovalComment 联动 |
| E-03 | **数据源绑定 / 嵌套 prop `data.xxx`** | 所有列表/图表 | **P0** | AdvancedTable 列路径解析 + API flatten |
| E-04 | **提交并启动流程 Action** | 所有申请表单 | **P0** | **`submitSubmission`：校验 + POST `{ data }` + 可选 startFlow** |
| E-05 | **日历/日程 Widget**（FgCalendar） | 会议、日程、考勤 | P1 | 月/周视图，事件 CRUD API |
| E-06 | **看板 Widget**（FgKanban） | 招聘 pipeline、督办 | P1 | 列拖拽、状态流转 |
| E-07 | **树形表格 Widget** | 组织架构、公文传阅 | P1 | 部门树 + 行内操作 |
| E-08 | **消息通知 Widget**（FgNotificationBell） | 工作台 | P1 | 对接 Socket.IO / 通知 API |
| E-09 | **大屏布局模板** | 政务大屏、考勤大屏 | P1 | 全屏 Schema 模板 + 自动刷新 |
| E-10 | **FgMicroApp 改为 qiankun 嵌入** | 工作台嵌入待办 | P0 | 当前基于 micro-app，与 Shell qiankun 栈不一致 |
| E-11 | **字典/部门级联数据源** | 全模块表单 | P0 | Select/Cascader 支持 `dataSource: dict://xxx`、`dept://tree` |
| E-12 | **打印/导出模板** | 公文、报表 | P2 | PDF 导出、打印布局 |
| E-13 | **流程状态 Badge 列** | 所有流程台账 | P0 | AdvancedTable 列类型 `flowStatus`，映射实例状态 |
| E-14 | **微应用管理 Widget**（FgMicroAppManage） | 系统管理 SA-11 | P2 | 替代 Shell `/admin/micro-apps`，完成 Schema-First |
| E-15 | **动态明细行 Table** | 财务报销/采购 | P1 | 明细增删行、合计计算 |
| E-16 | **Excel 导入预览 Widget** | 对账、月结 | P3 | 上传 → 预览 → 确认导入 |
| E-17 | **合规检查表 Widget** | 审计 AU-08/09 | P2 | 逐项勾选 + 证据 Upload |
| E-18 | **到期预警 Badge 列** | 计装 ME/EQ | P2 | 日期列绿黄红 |
| E-19 | **扫码/条码输入** | 装备盘点归还 | P3 | 快速录入编号 |
| E-20 | **Adhoc 查询构建器** | 报表 RP-09 | P3 | 可视化筛选条件 |
| E-21 | **报表导出 Action** | 报表 RP-11 | P2 | 批量 CSV/Excel |
| E-22 | **Richtext 报告变量占位** | 报告 RT-02 | P2 | `{{var}}` 数据绑定 |
| E-23 | **URL query 注入变量** | 详情页 load | P0 | `?recordId=` → board.variables |
| E-24 | **PublishView 注入 board.variables** | 全部运行时页 | P0 | 与 E-23 配套 |
| E-25 | **absolute 布局 form 校验/submit 聚合** | 全部表单页 | P0 | SchemaNode 汇总 formModel |
| E-26 | **LinkageConfig 写入 linkages** | 表单联动 | P0 | 修复 PropertyPanel rules 死路径 |
| E-27 | **列筛选 filterable 闭环** | 全部台账 | **P0** | filters 编辑器 + runtime 读 filterable |
| E-28 | **tag 列 dictCode 绑定** | 状态/假别/类型列 | **P0** | 自动 options + colorMap |
| E-29 | **事件参数 row 表达式** | 行按钮 navigate | **P0** | `{{row._id}}` 解析 |
| E-30 | **服务端列筛选** | 大数据台账 | P1 | filter → setSearchParams → API |
| E-31 | **toolbar 按钮图标** | 工具栏 | P1 | 渲染 AppIcon |
| E-32 | **search-bar 容器 Widget** | 列表搜索区 | P1 | 与 advanced-table 联动 |
| E-33 | **confirm 用 ElMessageBox** | 删除/撤回 | P1 | 替代 window.confirm |
| E-35 | **列模板库** | 快速搭建 | P1 | 状态列/操作列一键插入 |

### 2.3 Editor 配置与运行时

| ID | 扩展项 | 说明 | 优先级 |
|----|--------|------|--------|
| E-R01 | Schema 模板库（业务模板） | 预置「请假列表」「报销表单」等可导入模板 | P0 |
| E-R02 | PublishView  URL 参数 | 支持 `?id=&mode=create&flowDef=` 深链 | P1 |
| E-R03 | 页面级权限 meta | Schema 绑定 permission 与菜单一致 | P1 |

## 3. Flow（schema-form-flow + flow-shared）扩展清单

### 3.1 已有

| 能力 | 说明 |
|------|------|
| BPMN 设计器 | 用户任务、网关、定时器、消息事件 |
| 任务收件箱 | 认领、完成、驳回、委派、批量 |
| 内置模板 | 请假、报销、采购、入职、离职 |
| 监控统计 | 概览、瓶颈、趋势 |
| Embed 路由 | 供 Editor iframe 嵌入 |

### 3.2 缺口与扩展项

| ID | 扩展项 | 业务触发 | 优先级 | 实现要点 |
|----|--------|----------|--------|----------|
| F-01 | **Schema 表单节点**（Service Task 绑定 schemaId） | 多步审批表单 | P0 | 节点打开指定 Schema 采集数据 |
| F-02 | **会签/或签/依次审批**配置面板完善 | 公文、并联审批 | P1 | UserTask approvalMode UI 与引擎对齐 |
| F-03 | **子流程** | 复杂政务事项 | P2 | Call Activity 支持 |
| F-04 | **流程与 Schema 绑定配置** | 全模块 | P0 | FlowDefinition 增加 `formSchemaId` 字段 |
| F-05 | **移动端审批 H5 页** | 外出审批 | P2 | 轻量任务页 |
| F-06 | **催办/超时升级** | 督查、政务 | P1 | Timer + 通知 + 自动委派上级 |
| F-07 | **流程变量可视化** | 报销金额网关 | P0 | 设计器展示变量与网关条件编辑 |
| F-08 | **Embed 审批组件标准化** | Editor 详情页 | P0 | `/embed/task/:taskId` 统一 embed 契约 |
| F-09 | **单任务 embed 路由** | Schema 详情审批 | P1 | TaskDetailView embed 版 |

## 4. AI（schema-form-ai + server ai）扩展清单

### 4.1 已有

| 能力 | 说明 |
|------|------|
| 多 Agent 对话 | Router → Editor/Flow/Page Agent |
| Agent 工作流 | 可视化编排、Webhook 触发 |
| RAG | Schema 向量、知识库管理 |
| MCP | Schema/Flow/Widget 三 Server |
| HITL | 人工确认后继续 |

### 4.2 缺口与扩展项

| ID | 扩展项 | 业务触发 | 优先级 | 实现要点 |
|----|--------|----------|--------|----------|
| A-01 | **审批建议 runtime** | 待办详情 | P0 | 实现 `POST /api/ai/runtime/approval-suggestion`，输入表单+流程上下文 |
| A-02 | **智能指派人** | 复杂审批 | P1 | 实现 `recommend-assignee`，结合部门/负载规则+LLM |
| A-03 | **条件表达式评估** | 网关辅助 | P1 | 实现 `evaluate-condition` |
| A-04 | **文档 OCR + 结构化** | 事项受理、发票 | P1 | Agent 节点：文件 → 字段提取 |
| A-05 | **业务 Agent 模板库** | 全模块 | P0 | 预置：制度问答、审批摘要、会议纪要、公文拟稿 |
| A-06 | **工作台每日摘要 Agent** | 首页 | P0 | 定时/Webhook：聚合待办+公告+风险 |
| A-07 | **Submission 分析 Agent** | 统计页 | P1 | 自然语言查数据 |
| A-08 | **AI Sidebar 嵌入 Schema 页** | 所有业务页 | P1 | Editor PublishView 可选加载 `/ai/sidebar` iframe |

## 5. Server（schema-form-server）扩展清单

| ID | 扩展项 | 业务触发 | 优先级 | 说明 |
|----|--------|----------|--------|------|
| S-01 | **业务菜单 seed 扩展** | 全模块 | P0 | `seedMenus.ts` 增加完整菜单树 + schemaId 占位 |
| S-02 | **业务 Schema seed** | Phase 1 | P0 | `seedBusinessSchemas.ts` 预置工作台、请假等 Schema |
| S-03 | **Webhook 标准模板** | 表单→流程 | P0 | submission.created → flowDefinitionId 配置 seed |
| S-04 | **通知中心 API** | 消息中心 | P1 | 聚合流程通知+系统公告 |
| S-05 | **公告 CRUD** | OA 公告 | P1 | 若不用纯 Submission，需独立模型 |
| S-06 | **考勤/日程模型** | 人事 | P2 | 或先用 Submission 模拟 |
| S-07 | **仪表盘聚合 API 增强** | 工作台 | P0 | `/api/dashboard` 返回待办数、流程统计、提交量 |
| S-08 | **Fix Flow 菜单路径** | 设计器入口 | P0 | `/standalone/flow/design` → `/designer` |
| S-09 | **审计项目/问题 API** | 审计模块 | P2 | 或 submission 分 schemaId |
| S-10 | **计装台账回写 API** | 计装 ME/EQ | P2 | 检定/领用后更新主台账 |
| S-11 | **跨模块报表聚合 API** | 报表 RP | P2 | 按 schemaId/维度聚合 |
| S-12 | **预算/付款聚合 API** | 财务 FI | P2 | 预算执行、付款状态 |
| S-13 | **submission 回写 flowInstanceId** | 列表关联流程 | P1 | 台账显示流程状态 |

## 6. Shell（schema-form-shell）扩展清单

| ID | 扩展项 | 业务触发 | 优先级 | 说明 |
|----|--------|----------|--------|------|
| SH-01 | **工作台首页 Schema 化** | 首页 | P0 | HomeView 改为加载默认 dashboard schemaId，或嵌入 Schema |
| SH-02 | **GlobalSearch 实现** | 全平台 | P1 | 搜索菜单、Schema、流程、文档 |
| SH-03 | **消息铃铛** | 工作台 | P1 | Header 接入通知 API |
| SH-04 | **面包屑 Schema 标题** | 业务页 | P1 | 从 Schema meta 或菜单 name 解析 |
| SH-05 | **TopNavLayout 接入** | 政务风格 | P2 | 可选顶栏布局 |
| SH-06 | **更新 routing.md** | 文档 | P0 | 与 `router/index.ts` 一致 |

## 7. platform-shared 扩展清单

| ID | 扩展项 | 优先级 | 说明 |
|----|--------|--------|------|
| PS-01 | 业务图标批量注册 | P0 | 政务/OA 菜单所需 AppIcon |
| PS-02 | DashboardStat 卡片组件 | P1 | 工作台复用 |
| PS-03 | 统一 API 客户端业务模块 | P1 | 公告、通知、仪表盘 |

## 8. 扩展项与模块映射矩阵

| 业务模块 | 优先扩展 ID |
|----------|-------------|
| 工作台 | SH-01, S-07, E-08, A-06, SH-03 |
| 系统管理 | E-11（字典数据源）, E-14（微应用 Schema 化）, 已有 UserManagement |
| OA 公告 | S-05, E-03 |
| 请假/报销 | E-04, F-04, S-03, E-01, E-02, A-01, **E-27/E-28/E-03** |
| 入职/离职 | F-02 并行节点, E-01 |
| 政务受理 | A-04, F-02, E-06 |
| 能力运营 | F-08, E-R01, A-05 |
| 财务管理 | E-15, F-07, A-04, S-12, E-16 |
| 审计监督 | E-17, E-06, F-06, S-09, A-05 |
| 计装管理 | E-18, E-19, S-10, F-06, A-04 |
| 报表报告 | E-09, E-20, E-21, E-22, S-11, A-07 |

## 9. 发包与验证要求

修改 `platform-shared` / `flow-shared` 后：

1. 本地 `workspace:*` 链接验证
2. 更新版本号 → `pnpm publish`
3. 依赖方 `pnpm update`

修改 editor / flow / ai 业务 Widget 后：

1. 在 Shell 通过 `/app/editor/view` 验证运行时
2. 更新模块落地文档中的「验收记录」章节

---

下一篇：[03-实施路线图](./03-implementation-roadmap.md)
