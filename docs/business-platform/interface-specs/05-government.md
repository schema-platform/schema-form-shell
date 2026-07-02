# 05 — 行政审批 · 全量界面落地规格

> 规范：[16](../16-oss-ui-deconstruction-and-editor-evolution.md) · 索引：[00-index](./00-index.md)

---

## GA-01 事项受理 `gov-case-accept`

**Page Pattern**：`FlowApply` + **Tabs**  
**开源参照**：政务一网通办窗口受理 · O2OA 多 Tab 表单

### Tabs

| Tab | 字段/组件 |
|-----|-----------|
| 申请人 | 个人/企业 Switch · 姓名/企业名 · 证件 · 手机 · 事项类型 Cascader dict |
| 材料 | 材料清单 Table(名称|必需|已传) · Upload 多文件 · [AI完整性 A-04] |
| 办理 | 承诺时限(自动) · 备注 |

### 提交

POST submission · 生成 caseNo(S-06) · 启动并联 Flow

---

## GA-02 办件台账 `gov-case-list`

**CrudList** — 列：办件号|事项|申请人|受理日|承诺办结日|**剩余天数/逾期 Badge(E-18)**|进度|状态|节点 · 搜索事项|状态|日期

---

## GA-03 办件详情 `gov-case-detail`

**FlowDetail + 并联进度** — Descriptions · **各分支 Steps/Gauge(F-02)** · 部门意见 Tabs · FlowTimeline · 审批

---

## GA-04 并联审批看板 `gov-parallel-board`

**Page Pattern**：`KanbanDashboard` — E-06 FgKanban

列=部门分支 · 卡片=办件 · 拖拽状态(P3) · O2OA 并联监控

---

## GA-05 证照申请 `gov-license-apply`

**FlowApply** — 证照类型|申请人|用途|期限|附件 · Flow 审批

---

## GA-06 证照台账 `gov-license-list`

**CrudList** — 证照号|类型|持有人|有效期|状态|到期预警(E-18)

---

## GA-07 政策发布 `gov-policy-publish`

**ContentPublish(E-49)** — 同 OA 公告 · Richtext · 范围 · 发布/可选审批

---

## GA-08 政策检索

micro-app `/app/ai/rag` — 政策库 RAG · 非独立 Schema

---

## GA-09 督查督办 `gov-supervise-list` / `gov-supervision-list`

**CrudList** — 任务|责任单位|截止日|进度%|逾期天数|状态 · Timer 催办 F-06 · 升级通知

---

## GA-10 政务运行大屏 `gov-dashboard-screen`

**FullscreenDashboard(E-09)** — 1920 深色 · Statistic 受理/办结率/时长 · Bar 区县 · Top5 热点 · 滚动列表 · 60s refresh

---

## GA 事项申请 `gov-case-apply`

**FlowApply 简化版** — 线上办事入口 · 字段少于 GA-01 · 同 Flow

---

## 政务缺口

F-02 并联 · F-06 催办 · S-06 caseNo · E-06 Kanban · E-09 大屏 · A-04 材料 OCR
