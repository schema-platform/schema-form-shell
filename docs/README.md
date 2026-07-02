# Shell 文档

`@schema-form/shell` — qiankun 微前端宿主应用

## 快速开始

```bash
pnpm dev           # 并行启动前后端
pnpm dev:shell     # 仅启动 shell（端口 5050）
```

## 文档目录

### 基础设施

- [微前端容器](./micro-app-containers.md) — 两种容器模式
- [路由架构](./routing.md) — 路由配置与激活规则

### 业务平台分析与落地

完整索引见 **[business-platform/README.md](./business-platform/README.md)**

| 文档 | 说明 |
|------|------|
| [架构分析](./business-platform/01-architecture-analysis.md) | 平台定位、三能力协同、数据流 |
| [能力缺口与扩展清单](./business-platform/02-capability-gap-and-extensions.md) | Editor/Flow/AI/Server 扩展项 |
| [实施路线图](./business-platform/03-implementation-roadmap.md) | Phase 1–4 分期与验收 |
| [菜单与路由设计](./business-platform/04-menu-routing-design.md) | 完整菜单树与绑定规范 |
| [搭建模式与规范](./business-platform/05-build-patterns.md) | 列表/表单/统计/审批标准模式 |
| [Schema-First 架构决策](./business-platform/06-schema-first-architecture.md) | 不建 Admin 微应用，全部界面 Schema 搭建 |
| [可交付 UI 规范](./business-platform/07-deliverable-ui-board-widget-flow.md) | Board→Widget→Flow |
| [高级表格列能力规范](./business-platform/08-advanced-table-column-spec.md) | Tooltip/Tag/按钮/筛选 |

**模块落地文档：**

| 模块 | 文档 |
|------|------|
| 工作台 | [modules/00-workbench.md](./business-platform/modules/00-workbench.md) |
| 系统管理 | [modules/01-system-admin.md](./business-platform/modules/01-system-admin.md) |
| OA 办公 | [modules/02-oa-collaboration.md](./business-platform/modules/02-oa-collaboration.md) |
| 人事管理 | [modules/03-hr-personnel.md](./business-platform/modules/03-hr-personnel.md) |
| 行政审批 | [modules/04-government-affairs.md](./business-platform/modules/04-government-affairs.md) |
| 财务管理 | [modules/05-finance-management.md](./business-platform/modules/05-finance-management.md) |
| 审计监督 | [modules/07-audit-compliance.md](./business-platform/modules/07-audit-compliance.md) |
| 计装管理 | [modules/08-metrology-equipment.md](./business-platform/modules/08-metrology-equipment.md) |
| 报表与报告 | [modules/09-reports-documents.md](./business-platform/modules/09-reports-documents.md) |
| 能力平台运营 | [modules/06-capability-platform-ops.md](./business-platform/modules/06-capability-platform-ops.md) |
