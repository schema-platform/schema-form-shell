# 03 — 实施路线图

## 1. 总体目标

| 维度 | Phase 4 完成标准 |
|------|------------------|
| 业务覆盖 | **12 大模块**、**80+** 界面可演示、可配置 |
| 能力平台 | Editor 新增 ≥8 Widget/能力；Flow 表单绑定；AI 业务 Agent ≥5 个 |
| 集成闭环 | 表单提交 → 流程启动 → 待办审批 → 状态回写列表 |
| 文档 | 每模块落地文档含验收记录 |

## 2. Phase 1 — MVP 可演示（2–3 周）

**目标：** 登录后可见完整菜单骨架；工作台 + 请假全流程 + 系统管理 + 三能力运营入口。

### 2.1 基础设施

| 任务 | 归属 | 产出 |
|------|------|------|
| 修复 Flow 设计器菜单路径 | server | seedMenus `/standalone/flow/designer` |
| 扩展菜单 seed（P0 项） | server | 见 [04-菜单与路由设计](./04-menu-routing-design.md) |
| 业务 Schema seed（工作台、请假） | server | seedBusinessSchemas.ts |
| Webhook seed（请假提交→流程） | server | 示例 Webhook 配置 |
| 首页工作台 | shell + editor | dashboard Schema 或 HomeView 改造 |
| 更新 shell docs | shell | routing.md 与实现对齐 |

### 2.2 业务界面（P0）

| 界面 | 类型 | 文档 |
|------|------|------|
| 工作台首页 | Schema 大屏 | [modules/00-workbench.md](./modules/00-workbench.md) |
| 我的待办 | micro-app `/app/flow/tasks` | 同上 |
| 请假申请 | Schema 表单 | [modules/03-hr-personnel.md](./modules/03-hr-personnel.md) |
| 请假台账 | Schema 列表 | 同上 |
| 用户管理 | Schema + UserManagement | [modules/01-system-admin.md](./modules/01-system-admin.md) |
| 角色管理 | Schema + RoleManagement | 同上 |
| 部门管理 | Schema 树表 | 同上 |
| Schema 实例管理 | micro-app | [modules/06-capability-platform-ops.md](./modules/06-capability-platform-ops.md) |
| 流程定义/待办/监控 | micro-app | 同上 |
| Agent/RAG | micro-app | 同上 |

### 2.3 能力扩展（P0）

| 扩展 ID | 内容 |
|---------|------|
| E-04 | 表单提交联动流程 |
| E-01, E-02 | Flow 轨迹与任务操作 Widget |
| S-07 | 仪表盘 API |
| A-01 | 审批建议（最小可用） |
| A-05 | 1 个业务 Agent 模板：制度问答 |

### 2.4 Phase 1 验收标准

- [ ] `admin / admin123456` 本地与线上一致可登录
- [ ] 侧边栏展示 ≥15 个菜单项（含目录）
- [ ] 请假：提交 → 待办出现 → 审批 → 台账状态更新
- [ ] 三设计器新标签可打开
- [ ] 工作台展示待办数、快捷入口
- [ ] 模块文档 Phase 1 章节标记「已验收」

---

## 3. Phase 2 — OA + 人事闭环（3–4 周）

**目标：** OA 核心 + 人事全流程 + 财务报销 + 报表仪表盘 + 审计入口。

### 3.1 业务界面

| 模块 | 新增界面 | 文档 |
|------|----------|------|
| OA | 公告、会议、出差、用印、知识库(RAG) | [02-oa](./modules/02-oa-collaboration.md) |
| 人事 | 加班、入职、离职、员工档案、考勤统计 | [03-hr](./modules/03-hr-personnel.md) |
| 财务 | 报销、采购、合同、预算执行 | [05-fin](./modules/05-finance-management.md) |
| 报表 | 综合仪表盘、导出中心 | [09-reports](./modules/09-reports-documents.md) |
| 审计 | 平台操作日志入口、问题清单（试点） | [07-audit](./modules/07-audit-compliance.md) |
| 系统 | 字典、参数、审计日志、登录日志 | [01-system](./modules/01-system-admin.md) |

### 3.2 能力扩展

| 扩展 ID | 内容 |
|---------|------|
| E-05 | 日历 Widget |
| E-08 | 通知 Widget |
| E-11 | 字典数据源 |
| F-04, F-07 | 流程表单绑定与变量 |
| A-04 | 文档 OCR Agent（发票） |
| S-05 | 公告 API |

### 3.3 验收标准

- [ ] 5 个内置 Flow 模板均有对应业务表单+列表
- [ ] 公告发布可浏览；知识库 RAG 可问答
- [ ] 报销金额网关分支可跑通
- [ ] 系统管理 8 项均可从菜单进入

---

## 4. Phase 3 — 审计 + 计装 + 报告 + 政务（4–5 周）

**目标：** 审计整改闭环、计装台账与预警、报告编制签发、政务受理、AI 深度嵌入。

### 4.1 业务界面

| 模块 | 新增界面 | 文档 |
|------|----------|------|
| 审计 | 计划、项目、问题整改、报告编制、统计 | [07-audit](./modules/07-audit-compliance.md) |
| 计装 | 计量器具/检定/预警、装备领用盘点 | [08-metrology](./modules/08-metrology-equipment.md) |
| 报告 | 报告台账、编制、模板、年报 | [09-reports](./modules/09-reports-documents.md) |
| 报表 | 分模块报表、领导驾驶舱 | [09-reports](./modules/09-reports-documents.md) |
| 政务 | 事项受理、并联审批、证照、督查 | [04-gov](./modules/04-government-affairs.md) |
| 财务 | 付款、发票、预算编制 | [05-fin](./modules/05-finance-management.md) |
| AI | 工作台摘要、审批 Sidebar、报告生成 | — |

### 4.2 能力扩展

| 扩展 ID | 内容 |
|---------|------|
| E-06, E-17 | 看板、合规检查表 Widget |
| E-09, E-18 | 大屏、到期预警 Badge |
| E-20, E-21, E-22 | 自定义查询、导出、报告变量 |
| F-02, F-06 | 会签、催办升级 |
| S-09, S-10, S-11 | 审计/计装/报表聚合 API |
| A-06, A-08 | 每日摘要、AI Sidebar |
| SH-02 | GlobalSearch |

### 4.3 验收标准

- [ ] 审计问题 → 整改 → 验收闭环
- [ ] 计量器具到期预警看板
- [ ] 装备领用归还台账状态正确
- [ ] 报告编制审批发布
- [ ] 综合报表与各业务模块数据一致

---

## 5. Phase 4 — 完善与生产化（持续）

| 任务 | 说明 |
|------|------|
| 财务核算 | 对账、月结、科目余额 FI-14～17 |
| 计装盘点 | EQ-07/08 盘点全流程 |
| 报表订阅 | RP-10 定时 Agent 推送 |
| 权限细粒度 | 菜单 permission 与按钮级权限 |
| 性能 | 列表分页、Schema 懒加载、缓存 |
| 移动端 | Flow H5 审批 |
| 多租户演示 | 第二租户 seed |
| E2E 测试 | 关键路径：登录→请假→审批 |
| 运维文档 | 部署、seed、备份 |

## 6. 里程碑时间表（建议）

```
Week 1-2   Phase 1 基础设施 + 工作台 + 请假
Week 3-4   Phase 1 系统管理 + 能力运营 + 验收
Week 5-7   Phase 2 OA + 人事 + 报销
Week 8-10  Phase 2 OA + 人事 + 财务 + 报表仪表盘
Week 11-15 Phase 3 审计 + 计装 + 报告 + 政务
Week 16+   Phase 4 生产化（核算、订阅、E2E）
```

## 7. 风险与依赖

| 风险 | 缓解 |
|------|------|
| Editor 数据源绑定不成熟 | Phase 1 优先完善 E-03；短期可用静态 mock + API 代理 |
| AI runtime 占位 | Phase 1 先做规则版审批建议，再换 LLM |
| 跨项目修改协调 | 严格按扩展清单归属项目；shared 包先发版 |
| 菜单 schemaId 变更 | seed 用固定 code 查找 Schema，非硬编码 ObjectId |

## 8. 文档维护约定

每完成一个界面：

1. 更新对应 `modules/*.md` 的「实施状态」表
2. 记录 schemaId、flowDefinitionId、menuId（或 name）
3. 新增能力扩展写入 `02-能力缺口与扩展清单.md` 的「已完成」区

---

下一篇：[04-菜单与路由设计](./04-menu-routing-design.md)
