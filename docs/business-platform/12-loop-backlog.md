# 12 — Loop 开发 backlog（开发 → 验证 → 回归）

> **当前阶段：Phase H（深度交付 · 逐模块可用化）** | Phase G 归档 → [13-phase-g-archive.md](./13-phase-g-archive.md)

## 活跃 Backlog（Phase H）

| ID | 批次 | 状态 | 内容 | 验收 |
|----|------|------|------|------|
| H-01 | Cap | ⬜ | F-01 引擎执行 + flow-shared 发包 | ServiceTask schema 节点可跑通 |
| H-02 | Cap | ⬜ | F-06 Timer 自动催办/升级 | 督查/政务超时场景 |
| H-03 | Cap | ⬜ | E-10 qiankun 统一 + E-14 SA-11 Widget | Schema-First 微应用管理 |
| H-04 | Biz | **✅** | B→A 升级：OA 出差/用印/公文/会议/资产 | 全链 L3 ✅ |
| H-05 | Biz | **✅** | B→A 升级：财务采购/付款/预算/发票 | 报销/采购/付款/发票/预算 L3 ✅ |
| H-06 | Biz | ⬜ | B→A 升级：政务并联 + 证照 | 并行网关 3 分支 pass |
| H-07 | Biz | ⬜ | C 级占位清零（14 页 → 真实 Widget+API） | §3.3 列表全 A/B |
| H-08 | E2E | ⬜ | 浏览器 UI E2E（shell+editor 填表审批） | Playwright UI + E2E_ENABLED |
| H-09 | AI | ⬜ | A-04 OCR 接入报销/公文；A-02 指派人 | 业务表单可触发 |
| H-10 | Doc | 🟡 | 逐界面功能点矩阵 | [14-interface-feature-matrix.md](./14-interface-feature-matrix.md) HR ✅ |
| H-11 | AI | ⬜ | metadata 提取脚本 + ai-shared 发包 | extract-ai-metadata.ts |
| H-12 | Arch | 🟡 | Mock 治理：业务只走真实 API | widget mock 唯一 |
| H-13 | E2E | ⬜ | 扩展 API E2E | 政务/用印/招聘/审计 |
| **H-14** | **Biz** | **✅** | **HR 标杆深度化** | 入职/离职/招聘 L3 ✅；Offer P-02 ✅ |
| H-15 | Cap | ✅ | E-36/E-37 set-variable + Descriptions 热更新 | eventEngine + vitest |
| H-16 | Arch | ✅ | 菜单路由身份分离 | 唯一 path + by-code API |
| **H-27** | **Cap** | **✅** | **E-45 FgCrudListPage + E-46 SearchSchema 编辑器** | hr-leave-list + oa-trip-list 已迁 crud-list-page |
| **H-25** | **Cap** | **✅** | Server props builder | P-01 全量：buildSubmissionListPage → crud-list-page |
| **H-26** | **Cap** | **✅** | **P-02/P-03 流程申请/详情 builder** | flowSubmissionPages；出差/请假 apply+detail 已迁 |
| **H-17** | **Biz** | **✅** | **OA 出差 L3** | apply+list+detail ✅ |
| H-18 | Biz | **✅** | OA 用印/公文 L3 | 用印/收文/拟稿 apply+list+detail ✅ |
| H-19 | Biz | **🟡** | **政务模块可用化** | 事项+证照 L3 ✅；并联/督查待迁 |
| H-21 | Biz | **🟡** | **计装/装备可用化** | 装备领用 L3 ✅ |
| H-20 | Biz | **🟡** | **审计模块可用化** | 问题/整改台账 + 域详情 API ✅ |
| H-22 | Biz | ⬜ | **报表中心可用化** | 驾驶舱+adhoc+导出 |
| H-23 | Biz | ⬜ | **系统管理可用化** | TreeTable+权限 |
| H-24 | Cap | ⬜ | E-40 列表日期范围服务端过滤 | submission list API |

## Loop 节奏（用户确认）

**开源参照(15) → [16 UI解构] → Pattern 规格 → Editor 扩能力(E-45+) → 业务 props → 验收**

**冻结**：禁止 `list()`/`apply()` JSON 工厂；未实现 E-45 前可临时 server builder，规格必须按 §16 写。

优先级：**按 00-index 规格顺序 — HR/OA 标杆实现 → 批量 P-01 替换台账**

## 回归基线

```bash
cd schema-form-server && pnpm exec vitest run src/utils/__tests__/businessSchemaDeliverables.spec.ts
cd schema-form-editor && pnpm exec vitest run src/__tests__/eventEngine.spec.ts
cd schema-form-shell && API_URL=http://127.0.0.1:3001 pnpm exec playwright test e2e/multi-module-flow.spec.ts e2e/leave-flow.spec.ts --grep "API"
```

## Mock 治理 / AI 元数据

见 H-11/H-12 说明（同前版本）。
