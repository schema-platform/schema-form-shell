# 模块落地 — 财务采购（流程绑定参考）

> **完整财务域文档已迁移至 → [05-财务管理](./05-finance-management.md)**（含预算、付款、发票、对账等）  
> 本文档保留 **报销/采购 Flow 绑定** 的快速参考。

> 优先级：**P1** | Phase：**2**

## 1. 模块概述

财务采购模块覆盖费用报销、采购申请、合同台账、预算执行。Server 已内置 **报销审批**、**采购审批** Flow 模板，均含 **金额网关** 分支，是验证 Flow 条件表达式的标杆场景。

## 2. 界面清单

| # | 界面 | Schema code | Flow 模板 | Phase |
|---|------|-------------|-----------|-------|
| FP-01 | 费用报销申请 | `fin-expense-apply` | 报销审批 ✅ | P1 |
| FP-02 | 报销台账 | `fin-expense-list` | — | P1 |
| FP-03 | 报销统计 | `fin-expense-stats` | — | P2 |
| FP-04 | 采购申请 | `fin-purchase-apply` | 采购审批 ✅ | P1 |
| FP-05 | 采购台账 | `fin-purchase-list` | — | P1 |
| FP-06 | 合同台账 | `fin-contract-list` | — | P2 |
| FP-07 | 合同详情 | `fin-contract-detail` | 到期提醒 | P2 |
| FP-08 | 预算执行看板 | `fin-budget-dashboard` | — | P2 |

## 3. 核心界面逻辑

### FP-01 费用报销申请

**表单结构：**

```
Card 基本信息
  - 报销人（默认当前用户）
  - 报销部门 TreeSelect
  - 报销事由 Textarea
  - 报销日期 Date

Card 报销明细（Table 或 动态行 Form）
  - 费用类型 Select dict://expense_type
  - 金额 Number
  - 发票号 Input
  - 发票附件 Upload（AI OCR A-04）

Card 汇总
  - 合计金额 Statistic（计算字段）
  - 大写金额（扩展或静态 Text）
```

**提交 → 报销审批 Flow：**

```
开始 → 提交报销单
     → 金额判断网关
         ├─ 金额 > 5000 → 经理审批 → 财务审批 → 结束
         └─ 金额 ≤ 5000 ─────────────→ 财务审批 → 结束
```

**流程变量：**

| 变量 | 来源 |
|------|------|
| totalAmount | sum(details.amount) |
| expenseType | 主表字段 |

**扩展 F-07：** 设计器可编辑网关条件 `totalAmount > 5000`

### FP-04 采购申请

**表单字段：**

| 字段 | Widget |
|------|--------|
| 采购物品 | Textarea / 明细 Table |
| 数量 | Number |
| 预估单价 | Number |
| 预算总额 | Number（自动） |
| 供应商 | Input |
| 紧急程度 | Select |
| 附件 | Upload 报价单 |

**Flow（内置采购审批）：**

```
部门申请 → 部门经理审批 → 金额网关
  ├─ > 10000 → VP 审批 ─┐
  └─ ≤ 10000 ──────────┼→ 财务确认 → 结束
```

### FP-06 合同台账

**列表列：** 合同编号、名称、甲方、乙方、金额、签订日、到期日、状态

**逻辑：**

- 到期前 30 天标黄，7 天标红
- 可选 Flow：合同审批后入库
- AI：合同条款摘要与风险点（上传 PDF → A-04）

### FP-08 预算执行看板

**图表：**

- StackedBarChart：各部门预算 vs 实际
- Gauge：整体执行率
- 表格：超预算部门预警

**数据：** 需 budget 模型或 submissions 汇总（Phase 2 可 mock）

## 4. AI 增强

| 场景 | 能力 |
|------|------|
| 发票 OCR | A-04 提取金额、日期、税号填入明细 |
| 异常报销 | Agent 检测 duplicate 发票号 |
| 审批建议 | A-01 结合历史报销模式 |
| 合同风险 | LLM 摘要 + 风险标签 |

## 5. 能力平台扩展依赖

| 扩展 ID | 说明 |
|---------|------|
| F-07 | 网关条件可视化 |
| E-04 | 提交时写入 totalAmount 变量 |
| A-04 | 发票 OCR |
| E-03 | 明细 Table 动态行 |

## 6. 菜单结构

```
财务采购
├── 费用报销
├── 报销台账
├── 采购申请
├── 采购台账
├── 合同台账
└── 预算执行
```

## 7. 实施步骤

1. apply Flow 模板「报销审批」「采购审批」
2. 设计 FP-01/02/04/05 Schema
3. 配置 Webhook + 变量映射（totalAmount）
4. 测试金额网关两分支
5. Phase 2 后期：发票 OCR、合同、预算

## 8. 验收标准

- [ ] 报销 >5000 走经理+财务；≤5000 仅财务
- [ ] 采购 >10000 走 VP 分支
- [ ] 台账正确显示流程状态
- [ ] （P2）发票 OCR 填入金额

## 9. 实施状态

| 界面 | schemaId | flowDefId | 验收 |
|------|----------|-----------|------|
| FP-01 | — | — | ⬜ |
| FP-04 | — | — | ⬜ |

---

相关：[03-人事管理](./03-hr-personnel.md) | [内置 Flow 模板](../../../schema-form-server/src/flow-routes/flowTemplate.ts)
