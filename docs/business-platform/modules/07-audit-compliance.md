# 模块落地 — 审计监督

> 优先级：**P1–P2** | Phase：**2–3**  
> 架构：全部 **Schema 页** | 与系统管理「操作审计」分工见 §1

## 1. 模块概述

**审计监督**面向内审、合规、整改跟踪等业务；与 **系统管理 → 操作审计（SA-08）** 区分如下：

| 维度 | 系统管理 · 操作审计 | 本模块 · 审计监督 |
|------|---------------------|-------------------|
| 对象 | 平台 API 写操作日志 | 业务审计项目、底稿、整改 |
| 用户 | 系统管理员 | 审计部门、被审单位、领导 |
| 数据 | `audit-logs` 只读 | 审计计划、工作底稿、问题清单 |
| 流程 | 无 | 审计计划审批、整改闭环 Flow |

## 2. 界面清单

| # | 界面 | Schema code | Flow | Phase |
|---|------|-------------|------|-------|
| AU-01 | 审计计划 | `audit-plan-list` | 计划审批 | P2 |
| AU-02 | 计划编制 | `audit-plan-edit` | 同上 | P2 |
| AU-03 | 审计项目台账 | `audit-project-list` | — | P2 |
| AU-04 | 项目详情 | `audit-project-detail` | — | P2 |
| AU-05 | 工作底稿 | `audit-working-paper` | — | P2 |
| AU-06 | 问题清单 | `audit-issue-list` | 整改 Flow | P2 |
| AU-07 | 整改跟踪 | `audit-rectify-track` | 整改验收 | P2 |
| AU-08 | 合规检查 | `audit-compliance-check` | — | P2 |
| AU-09 | 合规检查表 | `audit-compliance-form` | 可选审批 | P3 |
| AU-10 | 审计报告台账 | `audit-report-list` | 报告签发 | P2 |
| AU-11 | 报告编制 | `audit-report-edit` | 多级审核 | P2 |
| AU-12 | 审计统计看板 | `audit-stats-dashboard` | — | P3 |
| AU-13 | 平台操作日志 | `audit-sys-log` | — | P1 |

**AU-13：** 与 SA-08 可共用同一 Schema（`sys-audit-log`），在审计菜单下做 **业务入口副本**，方便审计人员一站式访问。

## 3. 核心界面逻辑

### AU-01/02 审计计划

**年度计划表单：**

| 字段 | Widget |
|------|--------|
| 计划年度 | Select |
| 审计类型 | Select dict://audit_type（经济责任/专项/内控） |
| 被审单位 | TreeSelect 部门 |
| 计划时间 | Date 范围 |
| 审计目标 | Textarea |
| 负责人 | UserSelector |

**Flow：** 审计部门编制 → 分管领导审批 → 发布

### AU-06/07 问题与整改闭环

**问题清单列：** 问题编号、项目、严重程度、描述、责任单位、发现日、状态

**整改 Flow：**

```
问题下达 → 被审单位整改方案 → 审计复核 → 领导验收 → 关闭
                              ↘ 驳回补充
```

**整改跟踪：** Kanban 或 AdvancedTable — 待整改 / 整改中 / 待验收 / 已关闭

**Timer F-06：** 整改超期自动催办、升级通知

### AU-10/11 审计报告

**报告编制：** Richtext 正文 + Descriptions 项目信息 + 问题清单嵌入 Table

**Flow：** 主审编制 → 复核 → 部门负责人 → 签发

**AI：**

- 底稿摘要 → 报告初稿 Agent
- 问题描述规范化、风险等级建议

### AU-08 合规检查

**检查表 Schema：** 检查项 Table（条款、是否合规、证据 Upload、备注）

**逻辑：** 按模板批量检查；不合规项一键转入 AU-06 问题清单

### AU-12 审计统计看板

- Statistic：本年度项目数、问题数、整改完成率
- BarChart：问题按单位/类型分布
- Funnel：问题发现 → 整改 → 关闭转化
- LineChart：月度发现问题趋势

## 4. Flow 模板规划

| 流程名 | 节点概要 |
|--------|----------|
| 审计计划审批 | 编制 → 审计部门负责人 → 分管领导 |
| 整改闭环 | 下达 → 整改方案 → 复核 → 验收 |
| 审计报告签发 | 编制 → 复核 → 签发 |
| 合规例外审批 | 不合规项 → 业务负责人说明 → 审计确认 |

## 5. AI 增强

| 场景 | 能力 |
|------|------|
| 底稿分析 | Agent 从 Upload 提取关键数据 |
| 报告生成 | 问题清单 + 模板 → 报告草稿 |
| 合规问答 | RAG 法规/制度库 |
| 风险评级 | 规则 + LLM 对问题 severity 建议 |

## 6. 能力平台扩展

| 扩展 ID | 说明 |
|---------|------|
| E-06 | Kanban 整改看板 |
| F-06 | 整改催办 Timer |
| E-17（新增） | **检查表模板 Widget** — 合规逐项打勾 + 证据 |
| S-09（新增） | **审计项目/问题 CRUD API**（或 Phase 2 用 submission 分 schemaId） |
| A-05 | 审计报告 Agent 模板 |

## 7. 菜单结构

```
审计监督
├── 审计计划
│   ├── 计划列表      → audit-plan-list
│   └── 计划编制      → audit-plan-edit
├── 审计实施
│   ├── 项目台账      → audit-project-list
│   ├── 项目详情      → audit-project-detail
│   └── 工作底稿      → audit-working-paper
├── 问题与整改
│   ├── 问题清单      → audit-issue-list
│   └── 整改跟踪      → audit-rectify-track
├── 合规管理
│   ├── 合规检查      → audit-compliance-check
│   └── 检查表        → audit-compliance-form
├── 审计报告
│   ├── 报告台账      → audit-report-list
│   └── 报告编制      → audit-report-edit
├── 统计分析          → audit-stats-dashboard
└── 平台操作日志      → audit-sys-log（链 SA-08）
```

## 8. 与系统管理边界

- **SA-08 操作审计**：技术日志，管理员查 API 行为
- **本模块**：业务审计全生命周期；AU-13 仅作菜单聚合入口

## 9. 验收标准

- [ ] 审计计划审批发布
- [ ] 问题 → 整改 → 验收闭环
- [ ] 报告编制多级审批
- [ ] 统计看板与台账数据一致

## 10. 实施状态

| 界面 | schemaId | 验收 |
|------|----------|------|
| AU-06 | `audit-issue-list` | ✅ A级 |
| AU-07 | `audit-rectify-track` | ✅ seed B级 |
| AU-13 | `audit-sys-log` | ✅ seed（共用 sys-audit-log API） |
| AU-01 | `audit-plan-list` | ✅ seed B级 |
| AU-02 | `audit-plan-edit` | ✅ seed B级 |
| AU-03 | `audit-project-list` | ✅ seed B级 |
| AU-04 | `audit-project-detail` | ✅ seed B级 |
| AU-05 | `audit-working-paper` | ✅ seed B级 |
| AU-08 | `audit-compliance-check` | ✅ seed B级 |
| AU-09 | `audit-compliance-form` | ✅ seed B级 |
| AU-10 | `audit-report-list` | ✅ seed B级 |
| AU-11 | `audit-report-edit` | ✅ seed B级 |
| AU-12 | `audit-stats-dashboard` | ✅ seed B级 |

---

相关：[01-系统管理](./01-system-admin.md) | [09-报表与报告](./09-reports-documents.md)
