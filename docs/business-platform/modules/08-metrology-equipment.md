# 模块落地 — 计装管理

> 优先级：**P1–P2** | Phase：**2–3**  
> 「计装」= **计量**（器具检定） + **装备/装具**（资产领用盘点）  
> 架构：全部 **Schema 页**

## 1. 模块概述

计装管理是政务、制造、实验室等单位的常见模块，包含两条业务线：

| 子域 | 说明 | 典型用户 |
|------|------|----------|
| **计量管理** | 计量器具台账、检定/校准计划、证书、到期预警 | 计量员、质量部 |
| **装备装具** | 装备资产台账、领用、归还、盘点、报废 | 装备科、使用部门 |

两条线共用 **台账 + 表单 + 统计 + 到期预警** 模式，强化 Editor 的 Date、Upload、Gauge、Heatmap 能力。

## 2. 界面清单

### 2.1 计量管理

| # | 界面 | Schema code | Flow | Phase |
|---|------|-------------|------|-------|
| ME-01 | 器具台账 | `metrology-device-list` | — | P2 |
| ME-02 | 器具登记 | `metrology-device-register` | 登记审批 | P2 |
| ME-03 | 器具详情 | `metrology-device-detail` | — | P2 |
| ME-04 | 检定计划 | `metrology-calibration-plan` | 计划审批 | P2 |
| ME-05 | 检定记录 | `metrology-calibration-record` | — | P2 |
| ME-06 | 检定申请 | `metrology-calibration-apply` | 送检审批 | P2 |
| ME-07 | 证书管理 | `metrology-cert-list` | — | P2 |
| ME-08 | 到期预警看板 | `metrology-expiry-dashboard` | — | P2 |
| ME-09 | 计量统计 | `metrology-stats` | — | P3 |

### 2.2 装备装具管理

| # | 界面 | Schema code | Flow | Phase |
|---|------|-------------|------|-------|
| EQ-01 | 装备台账 | `equip-asset-list` | — | P2 |
| EQ-02 | 装备登记 | `equip-asset-register` | 入库审批 | P2 |
| EQ-03 | 装备详情 | `equip-asset-detail` | — | P2 |
| EQ-04 | 领用申请 | `equip-requisition-apply` | 领用审批 | P2 |
| EQ-05 | 领用台账 | `equip-requisition-list` | — | P2 |
| EQ-06 | 归还登记 | `equip-return-register` | — | P2 |
| EQ-07 | 盘点任务 | `equip-inventory-task` | 盘点审批 | P3 |
| EQ-08 | 盘点录入 | `equip-inventory-form` | — | P3 |
| EQ-09 | 报废申请 | `equip-scrap-apply` | 报废审批 | P2 |
| EQ-10 | 装备统计 | `equip-stats-dashboard` | — | P3 |

## 3. 核心界面逻辑

### ME-01 器具台账

**AdvancedTable 列：**

| 列 | 说明 |
|----|------|
| 器具编号 | 唯一编码 |
| 名称 | |
| 型号规格 | |
| 使用部门 | TreeSelect 过滤 |
| 检定周期 | 12月/24月 |
| 上次检定日 | |
| 下次检定日 | 计算字段 |
| 状态 | 合格/限用/停用/送检中 |
| 预警 | Badge：绿/黄(30天内)/红(已过期) |

**筛选：** 部门、状态、到期范围

### ME-04/05/06 检定计划与记录

**计划表单：** 年度/季度、器具多选 Transfer、计划检定日期、检定机构

**送检申请 Flow：**

```
使用部门申请 → 计量负责人确认 → 送检 → 记录录入 → 证书归档 → 结束
```

**检定记录：** 检定日期、结果（合格/不合格）、证书编号、证书 Upload、有效期

**逻辑：** 记录提交后回写 ME-01 台账的「上次/下次检定日」— 需 Server 扩展或 Webhook 更新 submission 关联

### ME-08 到期预警看板

```
Statistic: 即将到期(30天) / 已过期 / 本月已检
Heatmap: 部门 x 月份 到期数量
Table: 到期器具 Top 20
Gauge: 按期检定率
```

**Timer：** 到期前 30/7/1 天通知计量负责人（Flow 通知 + 消息中心）

### EQ-04 装备领用

**表单：** 装备选择（Autocomplete 台账）、领用人、部门、用途、预计归还日、审批人

**Flow：** 部门负责人 → 装备管理员确认 → 出库

**归还 EQ-06：** 扫码/编号 → 检查状态 → 入库，更新台账「在库/在用」

### EQ-07/08 盘点

**盘点任务：** 下发部门、资产范围、截止日期

**盘点录入：** Table 逐行录入账面数量、实盘数量、差异原因

**差异 Flow：** 盘盈/盘亏 → 装备科核实 → 财务备案（可选）

## 4. Flow 模板规划

| 流程名 | 适用 |
|--------|------|
| 器具登记审批 | ME-02 |
| 检定计划审批 | ME-04 |
| 送检申请 | ME-06 |
| 装备入库 | EQ-02 |
| 装备领用 | EQ-04 |
| 装备报废 | EQ-09 |
| 盘点差异处理 | EQ-08 |

## 5. AI 增强

| 场景 | 能力 |
|------|------|
| 证书 OCR | A-04 提取检定日期、有效期、证书号 |
| 到期预测 | Agent 分析历史检定间隔，建议周期 |
| 盘点异常 | 差异超阈值自动标注风险 |
| 装备推荐 | 根据用途推荐可领用装备（库存查询） |

## 6. 能力平台扩展

| 扩展 ID | 说明 |
|---------|------|
| E-18（新增） | **到期预警 Badge 列** — 日期列自动算绿黄红 |
| E-19（新增） | **扫码/条码输入** — 装备归还、盘点 |
| S-10（新增） | **台账状态回写 API** — 检定/领用后更新主台账 |
| E-09 | 大屏模板 — ME-08、EQ-10 |
| F-06 | 到期催办 Timer |

## 7. 菜单结构

```
计装管理
├── 计量管理
│   ├── 器具台账      → metrology-device-list
│   ├── 器具登记      → metrology-device-register
│   ├── 检定计划      → metrology-calibration-plan
│   ├── 检定记录      → metrology-calibration-record
│   ├── 送检申请      → metrology-calibration-apply
│   ├── 证书管理      → metrology-cert-list
│   ├── 到期预警      → metrology-expiry-dashboard
│   └── 计量统计      → metrology-stats
└── 装备装具
    ├── 装备台账      → equip-asset-list
    ├── 装备登记      → equip-asset-register
    ├── 领用申请      → equip-requisition-apply
    ├── 领用台账      → equip-requisition-list
    ├── 归还登记      → equip-return-register
    ├── 盘点管理      → equip-inventory-task
    ├── 报废申请      → equip-scrap-apply
    └── 装备统计      → equip-stats-dashboard
```

## 8. 字典规划

| 字典 code | 项示例 |
|-----------|--------|
| metrology_device_type | 长度/热学/力学/电学 |
| calibration_result | 合格/不合格/限用 |
| equip_asset_category | 通用装备/专用装具/低值易耗 |
| equip_status | 在库/在用/维修/报废 |

## 9. 验收标准

- [ ] 器具台账登记 → 送检 Flow → 检定记录回写下次日期
- [ ] 到期看板正确显示黄红预警
- [ ] 装备领用 → 归还 → 台账状态更新
- [ ] 证书 Upload + OCR 填入日期（P2 可选）

## 10. 实施状态

| 界面 | schemaId | 验收 |
|------|----------|------|
| ME-01 | `metrology-device-list` | ✅ A级 |
| ME-02 | `metrology-device-register` | ✅ seed B级 |
| ME-03 | `metrology-device-detail` | ✅ seed B级 |
| ME-04~07 | `metrology-calibration-*` / `metrology-cert-list` | ✅ seed B级 |
| ME-08 | `metrology-expiry-dashboard` | ✅ seed B级 |
| ME-09 | `metrology-stats` | ✅ seed B级 |
| EQ-01~03 | `equip-asset-*` | ✅ seed B级 |
| EQ-04 | `equip-requisition-apply` | ✅ seed B级 |
| EQ-05~09 | `equip-*` | ✅ seed B级 |
| EQ-10 | `equip-stats-dashboard` | ✅ seed B级 |

---

相关：[05-财务管理](./05-finance-management.md) | [09-报表与报告](./09-reports-documents.md)
