# 08 — 报表与报告 · 全量界面落地规格

> 规范：[16](../16-oss-ui-deconstruction-and-editor-evolution.md) · 索引：[00-index](./00-index.md)

---

## 报表中心

### RP-01 报表中心首页 `report-center-home`

**Page Pattern**：`ReportHub` — JeecgBoot 报表中心

```
Tabs 分类(综合|人事|财务|流程|审计|计装)
AdvancedTable 常用报表(名称|说明|最后生成|操作打开/导出)
Statistic 今日导出次数|订阅任务数
Button navigate 各 report-* Schema
```

---

### RP-02 综合统计 `report-dashboard-general`

**StatsDashboard** — Statistic×6 用户/流程/提交/AI · Line 30日趋势 · Pie 模块占比 · Bar 部门处理时长 · API S-07

---

### RP-03 人事报表 `report-hr-summary`

**StatsDashboard + Table** — 请假/入职 KPI · submissions HR 聚合 · GET reportAggregate module=hr

---

### RP-04 财务报表 `report-fin-summary`

同上 module=finance · 报销/采购金额

---

### RP-05 流程效率 `report-flow-efficiency`

**StatsDashboard** — 流程名|平均耗时|超时率|瓶颈节点 · Flow stats API · 可选 iframe `/app/flow/stats`

---

### RP-06 OA 运营报表 `report-oa-summary`

module=oa · 出差/公告统计

---

### RP-07 审计报表 `report-audit-summary`

module=audit · S-09

---

### RP-08 计装报表 `report-metrology-summary`

module=metrology

---

### RP-09 自定义查询 `report-adhoc-query`

**Page Pattern**：`AdhocQuery` — **FgAdhocQuery(E-20)** 已有

可视化条件 builder → targetTableId AdvancedTable · fields 配置 · 高级查询 JeecgBoot superQuery

缺口：PropertyPanel 可视化配 fields

---

### RP-10 报表订阅 `report-subscription`

**FlowApply** — 报表多选|cron|邮箱|格式 · 定时 Agent 推送

---

### RP-11 导出中心 `report-export-center`

**Page Pattern**：`ExportWizard` — E-21

Form：数据源 schema 多选|时间|格式 CSV/Xlsx|字段勾选 · 提交异步任务 · Table 任务状态 · 下载链接通知

---

### RP-12 领导驾驶舱 `report-exec-screen`

**FullscreenDashboard(E-09)** ✅ — KPI×4 auto-refresh 30s · Line 趋势 · Gauge · Bar 排行 · buildReportExecScreenPage

---

## 报告管理（report-doc-*）

### RT-01 报告台账 `report-doc-list`

**CrudList** — 编号|标题|类型|状态|编制人|更新日

---

### RT-02 报告编制 `report-doc-edit`

**ContentPublish + Flow** — Richtext · 模板变量 E-22 · 数据绑定 {{var}} · Flow 编制审批 · AI 初稿

---

### RT-03 报告详情 `report-doc-detail`

**阅读态** — Richtext 只读 · 附件 · 发布信息

---

### RT-04 模板库 `report-doc-templates`

**CrudList** — 模板名|类型|预览 · CRUD Richtext 模板

---

### RT-05 定期任务 `report-doc-schedule`

**CrudList** — 任务名|周期|下次运行|状态 · 关联 RT-02/06

---

### RT-06 年度报告 `report-doc-annual`

**FlowApply + Richtext** — 年度总结 · 多级签发 Flow

---

### RT-07 专题分析 `report-doc-analysis`

**FlowApply + Richtext** — 专题 · 可选审批

---

### RT-08 发布预览 `report-doc-preview`

**只读** — 发布前预览 layout · print CSS E-12

---

## 报表 Pattern 汇总

| Pattern | codes |
|---------|-------|
| StatsDashboard | report-dashboard-general, *-summary, exec-screen |
| ReportHub | report-center-home |
| AdhocQuery | report-adhoc-query |
| ExportWizard | report-export-center |
| ContentPublish | report-doc-edit/detail/templates |
| CrudList | report-doc-list, schedule |

**缺口**：E-20 fields 编辑器 · E-21 异步导出 · E-22 变量 · S-07 真实 KPI
