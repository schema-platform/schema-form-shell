# Schema 业务平台 — 分析与落地文档

> 目标：在完整实现政务 / OA / 人事等业务系统的同时，反向驱动并强化三个能力平台（可视化编辑器、流程引擎、AI 平台）。

## 文档索引

### 总览与分析

| 文档 | 说明 |
|------|------|
| [01-架构分析](./01-architecture-analysis.md) | 平台定位、分层架构、三能力协同模型、数据流 |
| [02-能力缺口与扩展清单](./02-capability-gap-and-extensions.md) | Editor / Flow / AI / Server 缺口、扩展项、归属项目 |
| [03-实施路线图](./03-implementation-roadmap.md) | Phase 1–4 分期、里程碑、验收标准 |
| [04-菜单与路由设计](./04-menu-routing-design.md) | 完整菜单树、routeType、schemaId 绑定规范 |
| [05-搭建模式与规范](./05-build-patterns.md) | 列表/表单/统计/大屏/审批的标准 Schema + Flow + AI 模式 |
| [06-Schema-First 架构决策](./06-schema-first-architecture.md) | 不建 Admin 微应用，全部界面 Schema 搭建 |
| [07-可交付 UI 规范（Board→Widget→Flow）](./07-deliverable-ui-board-widget-flow.md) | **画布排布、Widget 组合、Flow 集成、交付 Checklist** |
| [08-高级表格列能力规范](./08-advanced-table-column-spec.md) | **Tooltip / Tag / 按钮 / 筛选** 能力与扩展 |
| [09-Widget Mock 数据规范](./09-widget-mock-spec.md) | **复杂部件 mock.ts** 约定、设计器预览 vs 运行时 |
| [10-执行计划](./10-execution-plan.md) | 分块路线图与进度 |
| [11-实现状态对照表](./11-implementation-status.md) | **已完成/未完成单一来源**（能力·模块·图标·Flow） |
| [14-界面功能点矩阵](./14-interface-feature-matrix.md) | 进度看板（级别/完成态） |
| **[16-开源UI解构与Editor演进](./16-oss-ui-deconstruction-and-editor-evolution.md)** | **⭐ 业务实现主文档：开源解构 + Editor 扩能力路线** |
| [15-开源参照基准](./15-open-source-benchmarks.md) | 功能点来源索引 |
| [interface-specs/](./interface-specs/README.md) | 逐页 Pattern + props 规格（按 16 重写中） |
| [Server API 映射](../../../schema-form-server/docs/business-api-mapping.md) | **业务模块 ↔ 接口服务** 对齐表 |

### 模块落地文档

| 模块 | 文档 | 优先级 |
|------|------|--------|
| 工作台 | [modules/00-workbench.md](./modules/00-workbench.md) | P0 |
| 系统管理 | [modules/01-system-admin.md](./modules/01-system-admin.md) | P0 |
| OA 办公协同 | [modules/02-oa-collaboration.md](./modules/02-oa-collaboration.md) | P0–P1 |
| 人事管理 | [modules/03-hr-personnel.md](./modules/03-hr-personnel.md) | P0–P1 |
| 行政审批 | [modules/04-government-affairs.md](./modules/04-government-affairs.md) | P1–P2 |
| 财务管理 | [modules/05-finance-management.md](./modules/05-finance-management.md) | P1–P2 |
| 财务采购（Flow 参考） | [modules/05-finance-procurement.md](./modules/05-finance-procurement.md) | P1 |
| 能力平台运营 | [modules/06-capability-platform-ops.md](./modules/06-capability-platform-ops.md) | P0 |
| 审计监督 | [modules/07-audit-compliance.md](./modules/07-audit-compliance.md) | P1–P2 |
| 计装管理 | [modules/08-metrology-equipment.md](./modules/08-metrology-equipment.md) | P1–P2 |
| 报表与报告 | [modules/09-reports-documents.md](./modules/09-reports-documents.md) | P1–P2 |

## 核心原则

1. **Schema-First，不建 Admin 微应用**：除登录/布局等基础设施外，**所有界面**（含系统管理）均通过 Editor Schema 搭建；详见 [06-Schema-First 架构决策](./06-schema-first-architecture.md)。
2. **业务不硬编码在 Shell**：业务页面 = 已发布 Schema + 菜单配置；Shell 只提供容器、菜单、鉴权。
3. **能力不够就扩展**：缺 Widget、缺 Flow 节点、缺 AI Agent 节点时，在对应能力平台子项目中扩展，禁止在 Shell 写业务兜底。
4. **三能力闭环**：Editor 负责「看与填」、Flow 负责「审与办」、AI 负责「智与辅」；每个业务模块文档均包含三者分工。
5. **账号统一**：本地与线上均使用 `admin / admin123456`（seed 默认管理员，租户 `000000`）。

## 关联文档

- [微前端容器](../micro-app-containers.md)
- [路由架构](../routing.md)
- [Server 能力总览](../../../schema-form-server/docs/capabilities.md)
