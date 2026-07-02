# 07 — 计装管理 · 全量界面落地规格

> 规范：[16](../16-oss-ui-deconstruction-and-editor-evolution.md) · 索引：[00-index](./00-index.md)

---

## 计量管理（metrology-*）

### ME-01 器具台账 `metrology-device-list`

**CrudList** · 计量行业通用

| 区域 | 内容 |
|------|------|
| A 搜索 | 编号|名称|部门 TreeSelect|状态|到期范围 |
| C 列 | 器具编号|名称|型号|部门|检定周期|上次检定|下次检定|状态|预警Badge(E-18) |
| D | 查看详情|送检申请 |

API S-13 计量域 · 预警：绿/黄(30天)/红(过期)

---

### ME-02 器具登记 `metrology-device-register`

**FlowApply** — 编号|名称|型号|部门|检定周期 Select|首次检定日|证书 Upload · Flow 登记审批

---

### ME-03 器具详情 `metrology-device-detail`

**FlowDetail 只读** — Descriptions · Tab 检定历史 Table · Tab 证书

---

### ME-04 检定计划 `metrology-calibration-plan`

**FlowApply** — 年度/季度|器具 Transfer 多选|计划日期|检定机构 · Flow 计划审批

---

### ME-05 检定记录 `metrology-calibration-record`

**CrudList** — 器具|检定日|结果 tag|证书号|有效期 · 提交后 Webhook 回写 ME-01 日期

---

### ME-06 检定申请 `metrology-calibration-apply`

**FlowApply** — 器具 Select|送检原因|期望日期 · Flow 部门→计量负责人→送检

---

### ME-07 证书管理 `metrology-cert-list`

**CrudList** — 证书号|器具|签发日|有效期|附件下载

---

### ME-08 到期预警看板 `metrology-expiry-dashboard`

**StatsDashboard** — Statistic 30天内/已过期/本月已检 · Heatmap 部门×月 · Table Top20 · Gauge 按期率 · Timer 通知

---

### ME-09 计量统计 `metrology-stats`

**StatsDashboard** — 趋势折线 · 部门对比 Bar

---

### ME-10 预警看板 `metrology-alert-dashboard`

同 ME-08 变体布局

---

## 装备装具（equip-* / equipment-*）

### EQ-01 装备台账 `equip-asset-list` / `equipment-asset-list`

**CrudList** — 资产编号|名称|规格|保管部门|保管人|在库/在用状态|位置

---

### EQ-02 装备登记 `equip-asset-register` / `equipment-*

**FlowApply** — 资产信息登记 · 入库审批 Flow

---

### EQ-03 装备详情 `equip-asset-detail`

**FlowDetail 只读** — 履历 Tab：领用/归还/维修

---

### EQ-04 领用申请 `equip-requisition-apply` / `equipment-borrow-apply`

**FlowApply** — RuoYi EAM 领用 · 装备 Autocomplete|领用人|用途|预计归还 · Flow 部门→装备管理员

---

### EQ-05 领用台账 `equip-requisition-list`

**CrudList** — 领用单|装备|领用人|日期|状态|应还日

---

### EQ-06 归还登记 `equip-return-register`

**FlowApply 无 Flow** — 编号扫码(E-19)|检查状态 Select|备注 · 更新台账在库

---

### EQ-07 盘点任务 `equip-inventory-task`

**CrudList** — 任务名|范围|负责人|状态|进度

---

### EQ-08 盘点录入 `equip-inventory-form`

**FlowApply** — 关联任务|实盘 Table(账面|实盘|差异) · 提交汇总

---

### EQ-09 报废申请 `equip-scrap-apply`

**FlowApply** — 装备|原因|附件 · 报废审批 Flow

---

### EQ-10 装备统计 `equip-stats-dashboard`

**StatsDashboard** — 在库/在用/报废 Pie · 部门 Bar

---

### EQ-11 装备盘点列表 `equipment-inventory-list`

**CrudList** — 同盘点任务列表变体

---

## 计装 Pattern 汇总

| Pattern | 数量 |
|---------|------|
| CrudList | 台账类 ~10 |
| FlowApply | 登记/申请类 ~8 |
| StatsDashboard | 预警/统计 ~4 |
| FlowDetail | 详情 ~2 |

**缺口**：S-13 域 API · E-18 预警列 · E-19 扫码 · Webhook 回写检定日期
