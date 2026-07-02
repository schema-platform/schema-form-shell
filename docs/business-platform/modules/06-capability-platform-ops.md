# 模块落地 — 能力平台运营

> 优先级：**P0** | Phase：**1**

## 1. 模块概述

能力平台运营模块不是业务域，而是 **三个能力平台的日常管理入口**——让管理员和开发者能在 Shell 菜单内（带侧边栏）管理 Schema、流程、Agent，与设计器全屏入口互补。

```
设计器入口 (_blank, 全屏)  →  创作
运营入口 (_self, 带菜单)   →  管理、监控、数据
```

## 2. 界面清单

### 2.1 设计器入口（全屏新标签）

| # | 名称 | path | microAppId | 说明 |
|---|------|------|------------|------|
| CP-01 | 表单设计器 | `/standalone/editor` | editor | 可视化 Schema 设计 |
| CP-02 | 流程设计器 | `/standalone/flow/designer` | flow | BPMN 设计 ⚠️ 修复路径 |
| CP-03 | AI 应用 | `/standalone/ai` | ai | 对话 + 全功能 |

### 2.2 运营管理入口（带菜单嵌入）

| # | 名称 | path | 子应用路由 | 功能 |
|---|------|------|------------|------|
| CP-04 | Schema 管理 | `/app/editor/instances` | InstancesView | Schema CRUD、版本 |
| CP-05 | 组件模板 | `/app/editor/templates` | WidgetTemplateView | Widget 模板库 |
| CP-06 | 表单提交数据 | `/app/editor/submissions` | SubmissionListView | 全局 submission 查询 |
| CP-07 | 凭证管理 | `/app/editor/credentials` | CredentialListView | 外部 API 凭证 |
| CP-08 | 租户管理 | `/app/editor/tenants` | TenantListView | 多租户 |
| CP-09 | 流程定义 | `/app/flow/list` | FlowListView | 流程 CRUD、发布 |
| CP-10 | 流程实例 | `/app/flow/instances` | FlowInstanceListView | 实例监控 |
| CP-11 | 流程模板 | `/app/flow/templates` | FlowTemplateView | 内置+自定义模板 |
| CP-12 | 流程监控 | `/app/flow/monitor` | FlowMonitorDashboard | 瓶颈、趋势 |
| CP-13 | 流程统计 | `/app/flow/stats` | FlowStatsView | 审批效率 |
| CP-14 | 我的待办 | `/app/flow/tasks` | TaskInboxView | 也挂工作台 |
| CP-15 | Agent 编排 | `/app/ai/workflows` | AgentWorkflowListView | Agent 工作流 |
| CP-16 | RAG 知识库 | `/app/ai/rag` | RagKnowledgeBase | 文档向量 |
| CP-17 | AI 监控 | `/app/ai/monitor` | AiMonitorView | 性能、告警 |
| CP-18 | AI 对话 | `/app/ai/` | AiChatView | 可选菜单 |

## 3. 各界面逻辑

### CP-04 Schema 管理

**用户：** 管理员、业务配置员

**核心操作：**

| 操作 | 说明 |
|------|------|
| 新建 Schema | 跳转 standalone editor |
| 编辑 | 打开 editor `/editor?id=` |
| 发布 | 推版本，触发 schema.published |
| 导入/导出 | JSON |
| 删除 | 检查菜单引用 |

**与业务关系：** 业务模块所有 Schema 在此管理；code 字段便于 seed 绑定。

### CP-09 流程定义

**核心操作：**

| 操作 | 说明 |
|------|------|
| 从模板创建 | apply 内置模板 |
| 设计 | 跳转 standalone designer |
| 发布 | 版本化 |
| 绑定 formSchemaId | 扩展 F-04 |

### CP-11 流程模板

**内置模板（Server）：**

| 名称 | 分类 |
|------|------|
| 请假审批 | 人事 |
| 报销审批 | 财务 |
| 采购审批 | 采购 |
| 入职审批 | 人事 |
| 离职审批 | 人事 |

**操作：** 预览 → apply → 生成 FlowDefinition → 关联业务 Schema

### CP-15 Agent 编排

**用途：** 创建业务 Agent 工作流

**预置模板（扩展 A-05）：**

| 模板名 | 节点概要 |
|--------|----------|
| 审批摘要 | Webhook → LLM → 输出建议 |
| 每日工作台 | Cron → 查待办 → LLM 摘要 |
| 制度问答 | RAG → LLM |
| 发票识别 | Webhook → OCR → 结构化 JSON |
| Schema 生成 | LLM → schema tool → HITL |

### CP-16 RAG 知识库

**用途：** 上传制度文档，供 OA/人事/政务问答

**操作：** 创建知识库 → 上传文件 → 等待索引 → 测试检索

## 4. 设计器 vs 运营菜单对照

| 能力 | 设计（全屏 _blank） | 运营（带菜单 _self） |
|------|---------------------|----------------------|
| Editor | /standalone/editor | /app/editor/instances |
| Flow | /standalone/flow/designer | /app/flow/list |
| AI | /standalone/ai | /app/ai/workflows |

## 5. 能力平台扩展（反哺业务）

运营模块使用中发现的缺口，按 [02-能力缺口](../02-capability-gap-and-extensions.md) 回流：

| 运营场景 | 扩展项 |
|----------|--------|
| Schema 绑定菜单 | Server 菜单 API 增加 schemaCode 查询 |
| 流程绑定 Schema | F-04 |
| 模板市场 | E-R01 业务 Schema 模板库 |
| Agent 模板 | A-05 |

## 6. 菜单结构

```
能力平台
├── 表单设计器      _blank → /standalone/editor
├── 流程设计器      _blank → /standalone/flow/designer
├── AI 应用         _blank → /standalone/ai
├── ─── 运营管理 ───
├── Schema 管理     /app/editor/instances
├── 表单数据        /app/editor/submissions
├── 流程定义        /app/flow/list
├── 流程模板        /app/flow/templates
├── 流程监控        /app/flow/monitor
├── Agent 编排      /app/ai/workflows
├── 知识库          /app/ai/rag
└── AI 监控         /app/ai/monitor
```

## 7. 实施步骤（Phase 1）

1. 修复 CP-02 菜单路径
2. seed「能力平台」目录及 CP-04~CP-17 菜单项（Phase 1 至少 CP-04/09/15/16）
3. 验证 `/app/editor/instances` 等在 ClassicSidebarLayout 下 qiankun 加载正常
4. 文档记录各子应用 devPort：5100/5200/5300

## 8. 验收标准

- [ ] 三设计器 _blank 全屏可打开
- [ ] Schema 管理可新建、发布
- [ ] 流程模板可 apply 并生成定义
- [ ] Agent 列表可进入设计器
- [ ] RAG 可上传并检索

## 9. 实施状态

| 界面 | 菜单 | 路径修复 | 验收 |
|------|------|----------|------|
| CP-01 | ✅ | — | ✅ |
| CP-02 | ✅ | ✅ `/standalone/flow/designer` | ✅ |
| CP-04 | ✅ | — | ✅ seed |
| CP-09 | ✅ | — | ✅ seed |
| CP-15 | ✅ | — | ✅ seed |

---

相关：[01-架构分析](../01-architecture-analysis.md) | [Editor 路由](../../../schema-form-editor/src/router/index.ts)
