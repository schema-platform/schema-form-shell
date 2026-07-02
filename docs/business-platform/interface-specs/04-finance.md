# 04 — 财务管理 · 全量界面落地规格

> 规范：[16](../16-oss-ui-deconstruction-and-editor-evolution.md) · 索引：[00-index](./00-index.md)

---

## FI-01 费用报销申请 `fin-expense-apply`

**Page Pattern**：`FlowApply` + **明细行**  
**开源参照**：O2OA [报销流程](https://www.o2oa.net/cms/workflow/633.html)（>5000 分支）

### 区域布局

```
Card「基本信息」
  FgForm: 报销人(自动)|部门 TreeSelect|事由|报销日期
Card「报销明细」
  FgDynamicDetailTable (E-15)
    列: 费用类型 Select dict|金额 Number|发票号|发票 Upload(OCR)
Card「汇总」
  FgStatistic totalAmount (linkage sum)
[提交] → Webhook 报销审批
```

### 功能点

| # | 功能 | 来源 |
|---|------|------|
| F1 | 明细增删行 | O2OA 数据表格 |
| F2 | totalAmount 汇总 | 网关变量 |
| F3 | 金额网关 Flow | >5000 经理+财务 |
| F4 | 发票 OCR | A-04 填入明细 |
| F5 | 重复发票检测 | RuoYi Agent |

### 缺口

**E-15** dynamic-detail-table 纳入 Apply 模板 · F-07 网关 UI

---

## FI-02 报销台账 `fin-expense-list`

**CrudList** — 列：单号|申请人|totalAmount|类型|状态|flowStatus|日期 · 搜索 keyword|status|dateRange · 弹窗 detail API `/business/fin/expense/detail`(待建) · 导出

---

## FI-03 报销统计 `fin-expense-stats`

**StatsDashboard** — Pie 费用类型 · Bar 部门 · Statistic 本月总额 · API submissions 聚合或 S-12

---

## FI-04 采购申请 `fin-purchase-apply`

**FlowApply + 明细** — RuoYi 采购 · O2OA 采购 Flow

字段：标题|供应商|紧急度|明细 Table(物品|qty|单价|金额)|附件 · totalAmount · Flow 经理→>10000 VP→财务

---

## FI-05 采购台账 `fin-purchase-list`

**CrudList** — 列含 totalAmount|供应商|紧急度

---

## FI-06 合同台账 `fin-contract-list`

**CrudList** — RuoYi Office contract_ledger

列：编号|名称|甲乙方|金额|签订日|到期日|状态|到期预警(E-18 Badge)

---

## FI-07 合同详情 `fin-contract-detail`

**FlowDetail 只读** — Descriptions 合同要素 + Tab 变更历史 + 附件 · 到期 Gauge

缺口 S-12 双表 contract_info/ledger

---

## FI-08 预算编制 `fin-budget-edit`

**FlowApply** — 年度 Select|部门 TreeSelect|科目 Cascader dict|编制金额|说明|附件 · Flow 部门→财务→领导

---

## FI-09 预算执行看板 `fin-budget-dashboard`

**StatsDashboard** — StackedBar 预算vs实际 · Gauge 执行率 · Table 超预算标红

---

## FI-10 付款申请 `fin-payment-apply`

**FlowApply** — 关联合同/采购 Select|收款方|金额|付款方式|附件 · Flow 财务复核→出纳→领导(大额)

---

## FI-11 付款台账 `fin-payment-list`

**CrudList** — 标准 + 列：收款方|金额|关联单号

---

## FI-12 发票台账 `fin-invoice-list`

**CrudList** — 进项/销项|号码|金额|验真状态|关联报销单 · 去重规则

---

## FI-13 发票验真登记 `fin-invoice-register`

**FlowApply 无 Flow** — Upload 发票 · OCR A-04 填字段 · 验真 API · 写入台账

---

## FI-14 银行对账 `fin-bank-reconcile`

**Page Pattern**：`ImportReconcile`（E-16）  
**开源参照**：通用财务对账

```
Upload Excel → E-16 预览 Table → 确认导入
AdvancedTable 匹配结果：流水|系统单据|状态|差异
行：手工匹配|忽略
```

---

## FI-15 财务月结 `fin-monthly-close`

**StatsDashboard 只读** — Descriptions + Table · GET `/business/finance/monthly-close` ✅

---

## FI-16 科目余额 `fin-ledger-balance`

**CrudList 只读** — 科目|期初|借|贷|期末 · GET `/business/finance/ledger-balance` ✅

---

## FI-17 资金计划 `fin-cash-plan`

**FlowApply** — 周期|收支明细 Table|合计 · 计划审批 Flow

---

## 财务模块 Pattern 汇总

| Pattern | codes |
|---------|-------|
| FlowApply+明细 | FI-01,04 |
| CrudList | FI-02,05,06,11,12,16 |
| FlowDetail | FI-07 |
| StatsDashboard | FI-03,09,15 |
| Import | FI-14 |

**阻塞**：E-15 · S-12 合同 · E-16 对账 · 各 detail 域 API
