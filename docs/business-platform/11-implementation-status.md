# 11 — 实现状态对照表（已完成 / 未完成）

> **维护规则**：每完成一项能力或业务交付，同步更新本表。  
> **优先级**（用户确认）：**能力平台 > 字体图标 > 业务平台内容**。  
> **质量分级**：A=可端到端验收 · B=pattern 壳（通用两字段） · C=占位页 · D=文档有但未 seed · —=不适用

最后更新：2026-07-02

---

## 1. 总体结论

| 维度 | 设计目标 | 实际状态 | 差距说明 |
|------|----------|----------|----------|
| Schema code 数量 | 80+ | **128**（8 core + 120 extended） | L-26~27 达标 |
| 可验收业务页（A 级） | P0 主路径 + 各模块代表页 | **~18 页** | 见 §3；B/C 级见 modules 实施表 |
| 模块文档界面清单 | ~200 条 | seed **128 codes** | L-26~27 补全审计/计装/报表/政务 |
| 能力扩展项（02 清单） | P0 全绿 | P0 **大部分完成**，P1/P2 部分待做 | 见 §2 |
| 菜单图标（PS-01） | 全部注册 | **17 个已注册 + 1.1.5 已发包** | shell/editor/flow/ai 已 update |
| Flow Webhook 绑定 | 各模块主申请 | **16 条** | L-27 含招聘/Offer/资产/政务受理/公文拟稿 |
| API E2E 全流程 | 多模块主路径 | **4 模块 6 用例 pass** | L-31；UI 冒烟需 E2E_ENABLED=1 |

**易错点（曾标注 ✅ 但实际不完整）**

- `10-execution-plan.md` Phase F 全 ✅ → 仅表示 seed/代码骨架落地，**不等于浏览器 UI 验收**
- 模块文档「实施状态」表：L-30/L-32 已与 §3/§4 对齐；**以本表 + modules/*.md 为准**

---

## 2. 能力平台扩展项状态

引用：[02-能力缺口与扩展清单](./02-capability-gap-and-extensions.md)

### 2.1 Editor（schema-form-editor）

| ID | 扩展项 | 状态 | 说明 / 阻塞业务 |
|----|--------|------|-----------------|
| E-01 | Flow 轨迹 Widget | ✅ 完成 | `flow-timeline/`，请假/审计/政务详情已用 |
| E-02 | Flow 任务操作 Widget | ✅ 完成 | `flow-task-actions/` |
| E-03 | 嵌套 prop `data.xxx` | ✅ 完成 | AdvancedTable 列路径 |
| E-04 | submitSubmission | ✅ 完成 | eventEngine + server POST |
| E-05 | 日历 Widget | ✅ 完成 | `calendar/`，会议预约已集成 |
| E-06 | 看板 Kanban | ✅ 完成 | `kanban/` + gov-supervision-list 督办看板 |
| E-07 | 树形表格 | ✅ 完成 | `tree-table/` + hr-org-chart / sys-menu-manage deliverable |
| E-08 | 通知 Widget | ✅ 完成 | `notification/`，工作台已用 |
| E-09 | 大屏布局模板 | ✅ 完成 | `report-exec-screen` + `FgAutoRefresh` 30s 刷新 KPI/图表 |
| E-10 | FgMicroApp → qiankun | ⬜ 未做 | 与 Shell 栈不一致 |
| E-11 | 字典/部门级联数据源 | ✅ 完成 | Select `api.dictCode` |
| E-12 | 打印/导出 PDF | ⬜ 未做 | 公文、报表 |
| E-13 | flowStatus 列 | ✅ 完成 | AdvancedTable render |
| E-14 | 微应用管理 Widget | ⬜ 未做 | SA-11 Schema 化 |
| E-15 | 动态明细行 Table | ✅ 完成 | Widget + **联动 set-value 运行时写入 formData/defaultValue**；明细 `sumField` 同步合计 |
| E-16 | Excel 导入预览 | ⬜ 未做 | 对账、月结 |
| E-17 | 合规检查表 | ✅ 完成 | `compliance-checklist/`，审计详情已用 |
| E-18 | 到期预警列 | ✅ 完成 | `expiryAlert`，计装台账已用 |
| E-19 | 扫码输入 | ✅ 完成 | `qr-scanner/`（模拟扫码） |
| E-20 | Adhoc 查询构建器 | ✅ 完成 | `adhoc-query/` + `report-adhoc-query` deliverable |
| E-21 | 报表导出 Action | ✅ 完成 | `exportData` action + 单条 `/submissions/record/:id/export` |
| E-22 | 报告变量占位 | ⬜ 未做 | Richtext `{{var}}` |
| E-23 | URL query → variables | ✅ 完成 | PublishView `recordId` 等 |
| E-24 | board.variables 注入 | ✅ 完成 | PublishView + WidgetRenderer |
| E-25 | absolute 表单聚合 | ✅ 完成 | formRegistry + collectSchemaFormData |
| E-26 | linkages 写入 | ✅ 完成 | PropertyPanel → useLinkage |
| E-27 | 列筛选 filterable | ✅ 完成 | AdvancedColumnsEditor |
| E-28 | tag 列 dictCode | ✅ 完成 | |
| E-29 | row 表达式 navigate | ✅ 完成 | `{{row._id}}` |
| E-30 | 服务端列筛选 | ✅ 完成 | filter-change → setSearchParams → fetch；默认 API+filterable 启用 |
| E-31 | toolbar 按钮图标 | ✅ 完成 | AdvancedTable toolbar/行按钮 AppIcon |
| E-32 | search-bar 容器 | ✅ 完成 | AdvancedTable searchBar + report-adhoc-query |
| E-33 | confirm → ElMessageBox | ✅ 完成 | WidgetRenderer eventContext.confirm |
| E-35 | 列模板库 | ✅ 完成 | `columnPresets.ts` + AdvancedColumnsEditor 应用 |
| E-R01 | 业务 Schema 模板库 | ⬜ 未做 | WidgetTemplateView 为 WIP |
| E-R02 | PublishView 深链 | 🟡 部分 | `?id=` 有，`mode=create&flowDef=` 未完整 |
| E-R03 | 页面级 permission | ⬜ 未做 | |

**Editor 待优先（能力 > 业务）**

1. ~~E-15 联动 set-value 运行时生效~~ ✅
2. ~~E-21 导出 Action~~ ✅
3. ~~E-07 树形表格（阻塞 hr-org-chart、部门树）~~ ✅
4. E-09 大屏模板（阻塞领导驾驶舱）

### 2.2 Flow（schema-form-flow）

| ID | 扩展项 | 状态 | 说明 |
|----|--------|------|------|
| F-01 | Schema 表单节点 | 🟡 配置完成 | ServiceTaskPanel schema 类型 + formSchemaId 绑定 |
| F-02 | 会签/或签面板 | ✅ 完成 | UserTaskPanel approvalMode + 政务并联 seed |
| F-03 | 子流程 | ⬜ 未做 | |
| F-04 | formSchemaId 绑定 | ✅ 完成 | seedFlowFormBinding |
| F-05 | H5 审批页 | 🟡 部分 | embed 响应式样式；非完整 H5 产品页 |
| F-06 | 催办/超时升级 | 🟡 API 完成 | POST `/api/flow-tasks/:id/urge` + task_urged 通知 |
| F-07 | 流程变量可视化 | ✅ 完成 | FlowVariablesPanel |
| F-08 | Embed 契约 | ✅ 完成 | `/embed/task/:taskId` + 文档 |
| F-09 | 单任务 embed | ✅ 完成 | EmbedTaskDetailView |

### 2.3 AI + Server + Shell

| ID | 扩展项 | 状态 | 说明 |
|----|--------|------|------|
| A-01 | 审批建议 runtime | ✅ 完成 | `/api/ai/runtime/approval-suggestion` |
| A-02~A-03 | 指派人 / 条件评估 | ⬜ 未做 | |
| A-04 | OCR Agent | 🟡 部分 | seed `doc-ocr` workflow；未接业务表单 |
| A-05 | Agent 模板库 | 🟡 部分 | 制度问答/摘要/纪要/拟稿/OCR；非全模块覆盖 |
| A-06 | 每日摘要 | ✅ 完成 | daily-digest API + 工作台 |
| A-07 | Submission 分析 | ⬜ 未做 | |
| A-08 | AI Sidebar | ✅ 完成 | PublishView `?aiSidebar=1` |
| S-01~S-03 | 菜单/Schema/Webhook seed | ✅ 完成 | 6 条 Webhook |
| S-04 | 通知中心 API | ✅ 完成 | `/api/business/notifications` 聚合 flow 通知 |
| S-05 | 公告 CRUD | ✅ 完成 | `/api/notices` |
| S-07 | 仪表盘 API | ✅ 完成 | `/api/dashboard` |
| S-08 | Flow 菜单路径 | ✅ 完成 | `/standalone/flow/designer` |
| S-09 | 审计问题 API | ✅ 完成 | `/api/audit/issues` |
| S-10 | 计装台账 API | ✅ 完成 | `/api/metrology/devices` |
| S-11~S-12 | 报表/财务聚合 | 🟡 S-11 ✅ | `/api/business/reports/aggregate`；S-12 见 finance API |
| S-13 | submission flowInstanceId 回写 | ✅ 完成 | `submissionFlowBridge` Webhook 回写已核实 |
| SH-01 | 工作台 Schema 化 | ✅ 完成 | dashboard-workbench |
| SH-02 | GlobalSearch | 🟡 部分 | 菜单/路径；**未搜 Schema/Flow** |
| SH-03 | 消息铃铛 | ✅ 完成 | `NotificationBell.vue` + Classic/TopNav 布局 |
| SH-04 | 面包屑 Schema 标题 | ⬜ 未做 | |
| PS-01 | 业务图标批量注册 | ✅ 完成 | 1.1.5 已发包；消费方 shell/editor/flow/ai 已 update |

---

## 3. 80 个 Deliverable Schema 分级

### 3.1 Core（8）— 全部 A 级

| code | 级别 | 说明 |
|------|------|------|
| `dashboard-workbench` | A | KPI + 通知 + 每日摘要 + 快捷入口 |
| `hr-leave-apply/list/detail/stats` | A | 全流程 + dict + Timeline + AI |
| `sys-user-mgmt/role-mgmt/dept-mgmt` | A | 专用 Widget |

### 3.2 Extended — A 级（真实交付，10）

| code | 模块 |
|------|------|
| `oa-notice-publish/detail` | OA（列表仍为 B） |
| `fin-expense-apply` | 财务（动态明细 + server totalAmount） |
| `oa-meeting-book` | OA（含 Calendar） |
| `sys-dict-manage/config-manage/audit-log` | 系统 |
| `audit-issue-list/detail` | 审计（专用 API） |
| `metrology-device-list` | 计装（专用 API + expiryAlert） |
| `gov-case-detail` | 政务（Timeline；**descriptions → submission view API**） |
| `report-doc-detail` | 报告（**exportData + record export API**） |
| `fin-bank-reconcile/monthly-close/ledger-balance` | 财务核算（Statistic+Table 组合） |

### 3.3 Extended — C 级占位（14）

`oa-knowledge-entry`, `hr-employee-profile`, `hr-org-chart`, `fin-contract-detail`,  
`sys-menu-manage`, `sys-login-log`, `sys-post-manage`, `sys-online-users`, `sys-tenant-manage`,  
`equipment-inventory-list`, `report-center-home`, `report-export-center`, `report-exec-screen`, `report-doc-templates`

### 3.4 Extended — B 级 pattern（~48）

所有 `apply()` / `list()` / `stats()` 生成页：通用 title+reason 字段，列表走 Submission API，**无模块专属字段、无专用详情、多数无 Flow**。

含：`oa-trip-*`, `hr-overtime/onboard/resign-*`, `fin-purchase/payment/invoice/budget-*`,  
`audit-plan/project/report-list`, `gov-case-apply/list/license/supervision`, `report-doc-list/edit` 等。

---

## 4. 分模块与文档对齐

与 `modules/*.md` 界面清单对照（**文档行数 ≠ seed 数**）。

| 模块 | 文档界面约 | 已 seed | A 级 | 主要未完成 |
|------|-----------|---------|------|------------|
| 工作台 00 | 5 | 5 | 1 | W-01 A级 ✅ |
| 系统 01 | 12 | 12 | 6 | C 级占位 5 项 |
| OA 02 | 12 | 12 | 3 | 出差/用印/公文 B 级 seed ✅ |
| 人事 03 | 10 | 9 | 3 | HR-10 招聘 L-27 ✅ |
| 财务 05 | 17 | 17 | 4 | 采购 B 级；合同详情 C |
| 审计 07 | 13 | 13 | 1 | L-26 全 seed ✅ |
| 计装 08 | 19 | 19 | 1 | L-26 全 seed ✅ |
| 政务 04 | 10 | 10 | 1 | GA-03 A级；并联 seed ✅ |
| 报表 09 | 20 | 16 | 2 | RP-02 S-11 A级；4 C 占位 |
| 能力平台 06 | 18 | 菜单 | — | micro-app 路由已有 |

**模块文档「实施状态」表**：L-30 已与 §3/§4 同步（2026-07-02）。

### 4.1 Widget-API 对齐（A/C 级交付物）

| 模块 | schema code | Widget / 能力 | API | 状态 | 说明 |
|------|-------------|---------------|-----|------|------|
| OA | `oa-notice-list` | AdvancedTable | `/notices` | OK | 2026-07-02 列表改接 notices API + 详情跳转 |
| OA | `oa-notice-detail` | Descriptions | `GET /notices/:id` | OK | |
| OA | `oa-meeting-book` | Calendar + Form | submitSubmission | OK | |
| 财务 | `fin-expense-apply` | dynamic-detail-table | POST `/submissions/:schemaId` | OK | 明细同步 formData + server normalize totalAmount |
| 财务 | `fin-monthly-close` | Statistic + Table | `GET /business/finance/monthly-close` | OK | 2026-07-02 L-22 按财务 schema 过滤 |
| 财务 | `fin-ledger-balance` | Statistic + Table | `GET /business/finance/ledger-balance` | OK | 2026-07-02 L-22 科目预算/发生额归集 |
| 财务 | `fin-bank-reconcile` | 组合页 | `/submissions` | partial | pattern 级 |
| 系统 | `sys-dict-manage` | AdvancedTable | `GET /dict/types` | OK | 路由存在，dataPath `items` |
| 系统 | `sys-config-manage` | AdvancedTable | `/system/configs` | OK | |
| 系统 | `sys-audit-log` | AdvancedTable | `/audit-logs` | OK | |
| 审计 | `audit-issue-list` | AdvancedTable | `GET /audit/issues` | OK | |
| 审计 | `audit-issue-detail` | Descriptions | `GET /audit/issues/:id` | OK | dataPath `data` |
| 计装 | `metrology-device-list` | AdvancedTable | `GET /metrology/devices` | OK | expiryAlert 列 |
| 政务 | `gov-case-detail` | Descriptions + Timeline | `GET /submissions/record/:id/view` | OK | 已替换 leave stub |
| 报表 | `report-doc-detail` | Descriptions + exportData | `GET /submissions/record/:id/export` | OK | xlsx 下载（PDF 未实现） |
| 工作台 | `dashboard-workbench` | Statistic/Notification | `/dashboard` + digest | OK | |
| 人事 | `hr-org-chart` | tree-table | `GET /depts?tree=true` | OK | 2026-07-02 E-07 |
| 系统 | `sys-menu-manage` | tree-table | `GET /menus?tree=true` | OK | |
| 系统 | `sys-login-log` | AdvancedTable | `GET /login-logs` | OK | |
| 系统 | `sys-post-manage` | AdvancedTable | `GET /posts` | OK | |
| 系统 | `sys-tenant-manage` | AdvancedTable | `GET /tenants` | OK | |
| 人事 | `hr-leave-*` | 全流程 | submissions + flow | OK | |
| C×9 | 占位页 | placeholder | — | **✅ 已清零** | 2026-07-02 L-11 全部替换 |

---

## 5. 未注册菜单图标（PS-01）

以下名称已在 [iconRegistry.ts](../../../schema-form-platform-shared/utils/iconRegistry.ts) **本地注册**（2026-07-02）：

```
office-building, stamp, wallet, money, shopping-cart, credit-card, coin,
collection, tools, document-checked, box, alarm-clock, takeaway-box,
coordinate, postcard, data-analysis, reading
```

**待完成**：`platform-shared@1.1.5` 已发包；shell/editor/flow/ai-app 已 `pnpm update`。

---

## 6. Flow / Webhook 绑定对照

| schemaCode | Flow 模板 | Webhook | 表单级别 |
|------------|-----------|---------|----------|
| hr-leave-apply | 请假审批 | ✅ | A |
| oa-trip-apply | 出差审批 | ✅ | B |
| fin-expense-apply | 报销审批（金额网关） | ✅ | A |
| fin-purchase-apply | 采购审批（金额网关） | ✅ | B |
| hr-overtime-apply | 加班审批 | ✅ | B→A |
| gov-case-apply | 政务并联 | ✅ | B→A |
| oa-seal/hr-onboard/hr-resign/oa-doc-* | 用印/入职/离职/公文 | ✅ | B→A |
| hr-recruit-apply / hr-recruit-offer | 招聘需求 / Offer | ✅ | B |
| oa-asset-apply | 资产领用 | ✅ | B |
| gov-case-accept / gov-license-apply | 政务受理 / 证照 | ✅ | B |
| oa-doc-draft | 公文拟稿 | ✅ | B |

### 6.1 API E2E 全流程（L-31）

| 模块 | schemaCode | 用例 | 状态 |
|------|------------|------|------|
| 人事 | hr-leave-apply | 提交 → 部门+HR 审批 → 台账 | ✅ |
| OA | oa-trip-apply | 提交 → 部门审批 → 台账 | ✅ |
| 财务 | fin-expense-apply | 提交 → 经理+财务 → 台账 | ✅ |
| 财务 | fin-purchase-apply | 提交 → 审批 → 台账 | ✅ |

运行：`API_URL=http://127.0.0.1:3001 pnpm exec playwright test e2e/multi-module-flow.spec.ts e2e/leave-flow.spec.ts --grep API`

## 7. 推荐后续执行顺序

遵循：**能力平台 → 图标 → 业务**。

| 批次 | 子项目 | 内容 | 解锁 |
|------|--------|------|------|
| **Cap-1** | editor | E-15 联动运行时 + 动态明细 form 同步 | ✅ 2026-07-02 |
| **Cap-2** | editor + server | E-21 exportData + record export 路由 | ✅ 2026-07-02 |
| **Cap-3** | platform-shared | PS-01 注册 §5 全部图标 + 发包 | ✅ 2026-07-02 L-25 |
| **Cap-4** | editor | E-07 树形表格 | ✅ 2026-07-02 |
| **Cap-5** | platform-shared | PS-01 发包 + 各项目 update | ✅ 2026-07-02 L-25 |
| **Cap-6** | server + shell | S-04 通知 API + SH-03 铃铛 | ✅ 2026-07-02 |
| **Cap-7** | flow | F-02 会签 seed 验证 | 🟡 graph spec 测试通过；L-31 API E2E 4 模块 pass |
| **Biz-1** | server | 仅当 Cap-1~5 就绪后，替换 C 级占位（sys-menu 等） | 系统管理 8 项 |

---

## 8. 验收命令（回归）

```bash
# Server 单元测试（勿跑全量 vitest，易挂 integration）
cd schema-form-server && pnpm exec vitest run src/utils/__tests__/ src/services/__tests__/

# Seed 一致性
cd schema-form-server && pnpm db:seed
# 期望：Business schemas: 80 ready；6 条 Submission flow binding

# Editor（存在 12 个与本次无关的历史失败）
cd schema-form-editor && pnpm exec vitest run src/__tests__/eventEngine.spec.ts src/__tests__/useLinkage.spec.ts src/__tests__/linkageRuntime.spec.ts
```

---

## 9. 变更日志

| 日期 | 变更 |
|------|------|
| 2026-07-02 | L-25 PS-01：`platform-shared@1.1.5` 消费方 update（含 ai-app） |
| 2026-07-02 | L-22：`/business/finance/monthly-close` + `ledger-balance` 聚合 API；deliverable 改接 |
| 2026-07-02 | Cap-1 E-15：WidgetRenderer 联动 set-value 写入 formData；FgDynamicDetailTable 同步 field/sumField |
| 2026-07-02 | Cap-2 E-21：`exportData` action；server `GET /submissions/record/:id/export|view`；gov/report 详情 API 修复 |
| 2026-07-02 | Cap-3 PS-01：17 个业务图标本地注册；§4.1 Widget-API 对齐表 |
| 2026-07-02 | 初版：纠正 Phase F「全 ✅」误解；补充能力/模块/图标/Flow 对照 |

相关：[10-执行计划](./10-execution-plan.md) | [02-能力缺口](./02-capability-gap-and-extensions.md) | [03-路线图](./03-implementation-roadmap.md)
