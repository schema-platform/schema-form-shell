# 模块落地 — 人事管理

> 优先级：**P0–P1** | Phase：**1–2**

## 1. 模块概述

人事模块是 Phase 1 的**标杆模块**，用于验证「Schema 表单 → Flow 审批 → 台账列表 → 统计」完整闭环。Server 已内置 3 个人事 Flow 模板：请假、入职、离职。

## 2. 界面清单

| # | 界面 | Schema code | Flow 模板 | Phase |
|---|------|-------------|-----------|-------|
| HR-01 | 请假申请 | `hr-leave-apply` | 请假审批 ✅ | **P0** |
| HR-02 | 请假台账 | `hr-leave-list` | — | **P0** |
| HR-03 | 请假统计 | `hr-leave-stats` | — | P1 |
| HR-04 | 加班申请 | `hr-overtime-apply` | 自定义 | P1 |
| HR-05 | 入职办理 | `hr-onboard-apply` | 入职审批 ✅ | P1 |
| HR-06 | 离职办理 | `hr-resign-apply` | 离职审批 ✅ | P1 |
| HR-07 | 员工档案 | `hr-employee-profile` | — | P1 |
| HR-08 | 组织架构 | `hr-org-chart` | — | P0 |
| HR-09 | 考勤统计 | `hr-attendance-dashboard` | — | P2 |
| HR-10 | 招聘管理 | `hr-recruit-*` | Offer 审批 | P2 |

## 3. 核心界面逻辑（Phase 1 重点）

### HR-01 请假申请

**表单字段：**

| 字段 | Widget | 校验 |
|------|--------|------|
| 请假类型 | Select `dict://leave_type` | 必填 |
| 开始时间 | DateTime | 必填 |
| 结束时间 | DateTime | ≥开始 |
| 请假天数 | Number | 自动计算或手填 |
| 请假事由 | Textarea | 必填 |
| 紧急联系人 | Input | |
| 附件 | Upload | 病假需附件 |
| 代理人 | UserSelector | 可选 |

**提交逻辑：**

```
1. Form validate
2. POST /api/submissions { schemaId, data }
3. EventBus submission.created
4. Webhook → POST flow-instances (definitionId=请假审批)
5. Toast 成功 → 跳转 HR-02 或待办
```

**Flow 模板节点（内置）：**

```
开始 → 部门经理审批 (role: department_manager)
     → HR 审批 (role: hr)
     → 结束
```

**变量映射：**

| 表单字段 | 流程变量 |
|----------|----------|
| leaveType | leaveType |
| days | days |
| deptId | starterDept |

### HR-02 请假台账

**AdvancedTable 列：**

| 列 | 来源 |
|----|------|
| 单号 | submission._id 短码 |
| 申请人 | data.applicant / submitter |
| 假别 | data.leaveType |
| 天数 | data.days |
| 申请时间 | createdAt |
| 流程状态 | flowInstance.status |
| 当前节点 | currentTask.name |

**筛选：** 状态、假别、日期范围、部门（数据权限 dept）

**行操作：**

| 操作 | 条件 |
|------|------|
| 查看 | 全部 |
| 撤回 | 发起人 && 首节点未审 |
| 审批 | 当前 assignee → 跳转详情 |

### HR-03 请假统计

**图表：**

- Statistic：本月请假人次、人均天数
- PieChart：假别占比
- BarChart：部门对比
- LineChart：月度趋势

**API：** submissions 聚合 + flow stats；或 S-07 扩展 hr 维度

### HR-05 入职办理（Phase 2）

**表单：** 姓名、岗位、部门、入职日期、设备需求、账号需求 checklist

**Flow（内置并行）：**

```
HR 发起 → IT 配置账号 ─┐
       → 行政准备工位 ─┼→ 部门经理确认 → 结束
```

**扩展验证：** Flow 并行网关 + 汇聚

### HR-08 组织架构

**实现：**

- 左：`TreeLayout` 部门树
- 右：部门详情 + 成员列表 AdvancedTable

**API：** `/api/departments/tree`, `/api/users?deptId=`

与 SA-04 部门管理区别：本页只读为主，面向全员查看；管理在系统管理。

## 4. AI 增强

| 场景 | Agent / API | 输入 | 输出 |
|------|-------------|------|------|
| 填表咨询 | RAG | 「年假规定」 | 制度答案 |
| 审批建议 | A-01 | submission + task | 建议通过/驳回 |
| 余额提醒 | 规则+LLM | 用户历史请假 | 剩余天数 |
| 考勤异常 | A-07 | 考勤数据 | 异常报告 |

## 5. 能力平台扩展依赖

| 扩展 ID | 说明 | 优先级 |
|---------|------|--------|
| E-04 | 提交启动流程 | P0 |
| E-01, E-02 | 审批详情轨迹与操作 | P0 |
| E-11 | dict://leave_type | P0 |
| E-13 | flowStatus 列 | P0 |
| S-03 | Webhook seed | P0 |
| F-04 | formSchemaId 绑定 | P1 |
| A-01 | 审批建议 | P0 |

## 6. Webhook 配置示例

```json
{
  "name": "请假申请启动流程",
  "event": "submission.created",
  "schemaId": "{hr-leave-apply-schema-id}",
  "flowDefinitionId": "{leave-flow-definition-id}",
  "enabled": true,
  "fieldMapping": {
    "days": "days",
    "leaveType": "leaveType"
  }
}
```

## 7. 菜单结构

```
人事管理
├── 请假申请    → hr-leave-apply
├── 请假台账    → hr-leave-list
├── 请假统计    → hr-leave-stats (P1)
├── 加班申请    → hr-overtime-apply
├── 入职管理    → hr-onboard-apply
├── 离职管理    → hr-resign-apply
├── 员工档案    → hr-employee-profile
├── 组织架构    → hr-org-chart
└── 考勤统计    → hr-attendance-dashboard
```

## 8. 实施步骤（Phase 1）

> **UI 搭建规范：** 必须先读 [07-可交付 UI 规范](../07-deliverable-ui-board-widget-flow.md) — 4 个 Schema 的画布尺寸、Widget 树、事件链。

1. [editor] 实现 E-04/E-24/E-25 运行时必修项
2. [server] 从 flow-templates apply「请假审批」→ 得 flowDefinitionId
3. [editor] 按 07 规范设计 HR-01/02/03/04 Schema，发布，记录 code
4. [server] seed Webhook + 菜单
5. [flow] 验证 department_manager、hr 角色用户可审批（`/app/flow/tasks`）
6. 端到端测试（见 07 §6.3 用户旅程）
7. 更新实施状态

## 9. 角色与测试账号建议

| 角色 | 用途 | seed |
|------|------|------|
| admin | 全局管理 | ✅ 已有 |
| 部门经理 | 审批 | seed 扩展 |
| HR | 二级审批 | seed 扩展 |
| 员工 | 提交申请 | seed 扩展 |

Phase 1 可用 admin 模拟全部角色；Phase 2 补充多账号。

## 10. 验收标准

- [ ] 员工提交请假 → 待办出现
- [ ] 部门经理审批 → 流转 HR
- [ ] HR 审批 → 流程结束
- [ ] 台账状态变为已通过
- [ ] 驳回路径正常
- [ ] 统计页数字正确（P1）

## 11. 实施状态

| 界面 | schemaId | flowDefId | webhook | 验收 |
|------|----------|-----------|---------|------|
| HR-01 | `hr-leave-apply` seed | ✅ 请假审批 | ✅ | ✅ seed |
| HR-02 | `hr-leave-list` seed | — | — | ✅ seed |
| HR-03 | `hr-leave-stats` seed | — | — | ✅ seed |
| HR-08 | — | — | — | P1 |

---

**Phase 1 标杆模块** — 完成后作为其他模块复制模板。

相关：[05-搭建模式](../05-build-patterns.md) | [02-能力缺口](../02-capability-gap-and-extensions.md)
