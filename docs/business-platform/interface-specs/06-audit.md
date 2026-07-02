# 06 — 审计监督 · 全量界面落地规格

> 规范：[16](../16-oss-ui-deconstruction-and-editor-evolution.md) · 索引：[00-index](./00-index.md)

---

## AU-01 审计计划台账 `audit-plan-list`

**CrudList** — 计划年度|类型|被审单位|计划时间|负责人|状态 · 搜索年度|类型|状态 · 行：查看|编辑|提交审批

---

## AU-02 计划编制 `audit-plan-edit`

**FlowApply** — 年度 Select|审计类型 dict|被审单位 TreeSelect|计划 DateRange|目标 Textarea|负责人 UserSelector · Flow 编制→负责人→分管领导

---

## AU-03 审计项目台账 `audit-project-list`

**CrudList** — 项目编号|名称|关联计划|被审单位|进度|状态

---

## AU-04 项目详情 `audit-project-detail`

**FlowDetail 只读** — Descriptions 项目信息 · Tab 成员 · Tab 底稿入口 · Tab 问题清单链接

---

## AU-05 工作底稿 `audit-working-paper`

**FlowApply 无 Flow 或轻量** — 底稿编号|项目 Select|结论 Textarea|证据 Upload 多文件 · 关联 AU-03

---

## AU-06 问题清单 `audit-issue-list`

**CrudList** — 问题编号|项目|严重程度(tag)|描述|责任单位|发现日|状态 · 搜索项目| severity|状态 · 行：下达整改

---

## AU-07 问题详情/整改 `audit-issue-detail`

**FlowDetail** — 问题 Descriptions · 整改要求 · FlowTimeline · 整改 Flow 操作

---

## AU-08 整改跟踪 `audit-rectify-track`

**CrudList 或 Kanban(E-06)** — 列/泳道：待整改|整改中|待验收|已关闭 · 逾期天数 · F-06 催办

---

## AU-09 合规检查批次 `audit-compliance-check`

**CrudList** — 批次名|模板|检查单位|日期|不合规数|状态

---

## AU-10 合规检查表 `audit-compliance-form`

**Page Pattern**：`ComplianceChecklist` — **FgComplianceChecklist(E-17)** 已有 Widget

逐项：条款|是否合规 Switch|证据 Upload|备注 · 不合规一键转 AU-06

---

## AU-11 审计报告台账 `audit-report-list`

**CrudList** — 报告编号|项目|主审|状态|签发日

---

## AU-12 报告编制 `audit-report-edit`

**ContentPublish + Flow** — Richtext 正文 · 嵌入问题 Table · Descriptions 项目 · Flow 编制→复核→签发 · AI 底稿摘要 A-05

---

## AU-13 审计统计 `audit-stats-dashboard`

**StatsDashboard** — 项目数|问题数|整改完成率 · Bar 单位/类型 · Funnel 发现→整改→关闭 · Line 月度趋势

API S-09 审计聚合

---

## AU-14 平台操作日志 `audit-sys-log`

**CrudList 只读** — 同 SA-08 sys-audit-log · 审计菜单入口副本 · API `/audit-logs`

---

## 审计缺口

S-09 域 API · E-17 检查表 PropertyPanel · E-06 整改看板 · F-06 整改催办 · E-22 报告变量
