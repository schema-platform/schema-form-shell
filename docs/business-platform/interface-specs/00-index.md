# 00 — 全量界面规格索引（129）

> **状态**：📝 全模块规格已写入（2026-07-02）  
> **写法规范**：[16-oss-ui-deconstruction](../16-oss-ui-deconstruction-and-editor-evolution.md)  
> **每页必含**：Page Pattern · 区域布局 · 功能点 · Editor 组件 · API · 缺口

---

## 文档地图

| 模块文件 | 界面数 | 路径 |
|----------|--------|------|
| [01-workbench-system.md](./01-workbench-system.md) | 16 | 工作台 + 系统管理 + 微应用待办 |
| [02-oa.md](./02-oa.md) | 13 | OA 办公 |
| [03-hr.md](./03-hr.md) | 17 | 人事（含 core hr-leave-*） |
| [04-finance.md](./04-finance.md) | 17 | 财务 |
| [05-government.md](./05-government.md) | 11 | 政务 |
| [06-audit.md](./06-audit.md) | 14 | 审计 |
| [07-metrology-equipment.md](./07-metrology-equipment.md) | 19 | 计装 |
| [08-reports.md](./08-reports.md) | 20 | 报表报告 |
| **合计** | **129** | |

---

## 核心 deliverable（8）索引

| code | 模块文档 |
|------|----------|
| `dashboard-workbench` | [01 §W-01](./01-workbench-system.md) |
| `workbench-messages` | [01 §W-04](./01-workbench-system.md) |
| `sys-user-mgmt` | [01 §SA-02](./01-workbench-system.md) |
| `sys-role-mgmt` | [01 §SA-03](./01-workbench-system.md) |
| `sys-dept-mgmt` | [01 §SA-04](./01-workbench-system.md) |
| `hr-leave-apply` | [03 §HR-01](./03-hr.md) |
| `hr-leave-list` | [03 §HR-02](./03-hr.md) |
| `hr-leave-detail` | [03 §HR-03](./03-hr.md) |
| `hr-leave-stats` | [03 §HR-04](./03-hr.md) |

---

## Page Pattern 统计

| Pattern | 界面约数 | Editor 目标 Widget |
|---------|----------|-------------------|
| CrudList | ~55 | **E-45 FgCrudListPage** |
| FlowApply | ~35 | **E-47 FgFlowApplyPage** |
| FlowDetail | ~15 | **E-48 FgFlowDetailPage** |
| StatsDashboard | ~18 | FgStatsDashboard / 图表组合 |
| ContentPublish | ~8 | **E-49 FgContentPublishPage** |
| MasterDetail | ~6 | TreeLayout + E-45 |
| DomainWidget | ~5 | User/Role/Compliance 等已有 |
| micro-app | ~4 | Flow / AI RAG |
| 其他 | ~3 | Import/Adhoc/Export |

---

## 实现顺序（文档 §16 §5.3）

1. E-45 + E-46 → 全部 CrudList 类界面可设计器配置  
2. E-47 + E-48 → 全部 Flow 申请/详情  
3. E-15/E-49/S-05/S-13 → 明细行/公告/域 API  
4. 按本目录逐 code 替换 server JSON 工厂  

---

## extended deliverable 快速 lookup

<details>
<summary>OA (13)</summary>

oa-notice-list · oa-notice-publish · oa-notice-detail · oa-meeting-list · oa-meeting-book · oa-trip-apply · oa-trip-list · oa-trip-detail · oa-seal-apply · oa-doc-receive · oa-doc-draft · oa-asset-apply · oa-knowledge-entry → [02-oa.md](./02-oa.md)
</details>

<details>
<summary>HR extended (11) + core (4)</summary>

→ [03-hr.md](./03-hr.md)
</details>

<details>
<summary>Finance (17)</summary>

→ [04-finance.md](./04-finance.md)
</details>

<details>
<summary>System extended (9) + core (3) + workbench (2)</summary>

→ [01-workbench-system.md](./01-workbench-system.md)
</details>

<details>
<summary>Audit (14) · Gov (11) · Metrology (19) · Reports (20)</summary>

→ [06](./06-audit.md) · [05](./05-government.md) · [07](./07-metrology-equipment.md) · [08](./08-reports.md)
</details>
