# 模块落地 — 财务管理

> 优先级：**P1–P2** | Phase：**2–3**  
> 架构：全部 **Schema 页** | 关联 Flow 模板：报销审批、采购审批

## 1. 模块概述

财务管理模块覆盖 **预算、核算、报销、采购、合同、资金、发票、对账** 等场景，是验证 **金额网关 Flow**、**发票 OCR**、**统计报表** 的核心域。

与 [05-财务采购（旧版采购侧重）](./05-finance-procurement.md) 合并升格：本文档为财务域完整清单；采购/报销细节仍可参考该文档中的 Flow 绑定说明。

## 2. 界面清单

| # | 界面 | Schema code | Flow | Phase |
|---|------|-------------|------|-------|
| FI-01 | 费用报销申请 | `fin-expense-apply` | 报销审批 ✅ | P1 |
| FI-02 | 报销台账 | `fin-expense-list` | — | P1 |
| FI-03 | 报销统计 | `fin-expense-stats` | — | P2 |
| FI-04 | 采购申请 | `fin-purchase-apply` | 采购审批 ✅ | P1 |
| FI-05 | 采购台账 | `fin-purchase-list` | — | P1 |
| FI-06 | 合同台账 | `fin-contract-list` | 合同审批 | P2 |
| FI-07 | 合同详情 | `fin-contract-detail` | — | P2 |
| FI-08 | 预算编制 | `fin-budget-edit` | 预算审批 | P2 |
| FI-09 | 预算执行看板 | `fin-budget-dashboard` | — | P2 |
| FI-10 | 付款申请 | `fin-payment-apply` | 付款审批 | P2 |
| FI-11 | 付款台账 | `fin-payment-list` | — | P2 |
| FI-12 | 发票台账 | `fin-invoice-list` | — | P2 |
| FI-13 | 发票验真登记 | `fin-invoice-register` | — | P2 |
| FI-14 | 银行对账 | `fin-bank-reconcile` | — | P3 |
| FI-15 | 财务月结报表 | `fin-monthly-close` | — | P3 |
| FI-16 | 科目余额表 | `fin-ledger-balance` | — | P3 |
| FI-17 | 资金计划 | `fin-cash-plan` | 计划审批 | P3 |

## 3. 子域逻辑

### 3.1 费用报销（FI-01～03）

**表单：** 报销人、部门、明细 Table（费用类型、金额、发票号、附件 Upload）

**Flow（内置报销审批）：**

```
提交 → 金额网关
  ├─ > 5000 → 经理审批 → 财务审批
  └─ ≤ 5000 ────────────→ 财务审批
```

**变量：** `totalAmount = sum(明细.amount)`

**AI：** 发票 OCR（A-04）填入明细；重复发票检测 Agent

**统计 FI-03：** PieChart 费用类型、BarChart 部门对比、Statistic 本月总额

### 3.2 采购与合同（FI-04～07）

**采购 Flow（内置）：** 部门申请 → 经理 → 金额网关（>10000 VP）→ 财务确认

**合同台账：** 编号、名称、甲乙方、金额、签订日、到期日；到期 Gauge 预警

**AI：** 合同 PDF 条款摘要与风险标签

### 3.3 预算管理（FI-08～09）

**预算编制表单：**

| 字段 | Widget |
|------|--------|
| 预算年度 | Select |
| 部门 | TreeSelect |
| 科目 | Cascader dict://budget_subject |
| 编制金额 | Number |
| 编制说明 | Textarea |
| 附件 | Upload |

**Flow：** 部门编制 → 财务汇总 → 领导审批

**执行看板：** StackedBarChart（预算 vs 实际）、Gauge 执行率、超预算部门 Table 标红

### 3.4 付款与发票（FI-10～13）

**付款申请：** 关联合同/采购单、收款方、金额、付款方式、附件

**发票台账：** 进项/销项、验真状态、关联报销单号

**逻辑：** 报销明细发票号 ↔ 发票台账去重

### 3.5 对账与核算（FI-14～17，Phase 3）

**银行对账：** 导入银行流水 Excel → 与系统付款记录匹配 → 差异列表

**月结报表：** 只读 Descriptions + Table，数据来自聚合 API 或 submission 汇总

**扩展：** 若需标准总账，扩展 Server 会计科目模型；Phase 3 前可用 Schema + 导入 Excel 模拟

## 4. Flow 模板规划

| 流程名 | 基于 | 关键节点 |
|--------|------|----------|
| 报销审批 | 内置 ✅ | 金额网关 |
| 采购审批 | 内置 ✅ | 金额分级 |
| 合同审批 | 新建 | 法务 → 财务 → 领导 |
| 预算审批 | 新建 | 部门 → 财务 → 领导 |
| 付款审批 | 新建 | 财务复核 → 出纳 → 领导（大额） |

## 5. AI 增强

| 场景 | 能力 |
|------|------|
| 发票识别 | A-04 OCR → 金额/税号/日期 |
| 异常报销 | Agent 检测频率/金额异常 |
| 审批建议 | A-01 结合历史模式 |
| 预算分析 | Agent 自然语言解读执行看板 |
| 合同审查 | RAG 合同法务条款库 |

## 6. 能力平台扩展

| 扩展 ID | 说明 |
|---------|------|
| F-07 | 金额网关条件可视化 |
| E-04 | 提交写入 totalAmount |
| A-04 | 发票 OCR |
| E-15（新增） | **动态明细行 Table** — 报销/采购明细增删行 |
| S-12（新增） | **预算/付款聚合 API** |
| E-16（新增） | **Excel 导入预览 Widget** — 对账、月结 |

## 7. 菜单结构

```
财务管理
├── 费用报销
│   ├── 报销申请      → fin-expense-apply
│   ├── 报销台账      → fin-expense-list
│   └── 报销统计      → fin-expense-stats
├── 采购管理
│   ├── 采购申请      → fin-purchase-apply
│   └── 采购台账      → fin-purchase-list
├── 合同管理
│   ├── 合同台账      → fin-contract-list
│   └── 合同详情      → fin-contract-detail
├── 预算管理
│   ├── 预算编制      → fin-budget-edit
│   └── 预算执行      → fin-budget-dashboard
├── 付款管理
│   ├── 付款申请      → fin-payment-apply
│   └── 付款台账      → fin-payment-list
├── 发票管理
│   ├── 发票台账      → fin-invoice-list
│   └── 发票登记      → fin-invoice-register
└── 财务核算        (P3)
    ├── 银行对账      → fin-bank-reconcile
    ├── 月结报表      → fin-monthly-close
    └── 科目余额      → fin-ledger-balance
```

## 8. 验收标准

- [ ] 报销/采购金额网关两分支可跑通
- [ ] 预算编制审批后看板可见执行数据
- [ ] 发票 OCR 填入报销明细（P2）
- [ ] 合同到期预警展示

## 9. 实施状态

| 界面 | schemaId | flowDefId | 验收 |
|------|----------|-----------|------|
| FI-01 | `fin-expense-apply` | ✅ 报销审批 | ✅ A级 |
| FI-15 | `fin-monthly-close` | — | ✅ A级 |
| FI-16 | `fin-ledger-balance` | — | ✅ A级 |
| FI-14 | `fin-bank-reconcile` | — | 🟡 A级 partial |
| FI-04 | `fin-purchase-apply` | ✅ 采购审批 | ✅ seed B级 |
| FI-02 | `fin-expense-list` | — | ✅ seed B级 |
| FI-05 | `fin-purchase-list` | — | ✅ seed B级 |
| FI-03 | `fin-expense-stats` | — | ✅ seed B级 |
| FI-09 | `fin-budget-dashboard` | — | ✅ seed B级 |
| FI-06~13,17 | `fin-*` | 部分 Flow | ✅ seed B级 |
| FI-07 | `fin-contract-detail` | — | 🟡 C级占位 |

---

相关：[09-报表与报告](./09-reports-documents.md) | [07-审计监督](./07-audit-compliance.md)
