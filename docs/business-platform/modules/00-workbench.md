# 模块落地 — 工作台

> 优先级：**P0** | Phase：**1**

## 1. 模块概述

工作台是用户登录后的默认入口，聚合待办、通知、快捷操作、数据概览，连接 OA / 人事 / 流程各模块。

**设计原则：** 聚合而非重复——待办复用 Flow 子应用；统计用 Editor Schema；智能摘要用 AI Agent。

## 2. 界面清单

| # | 界面名 | 类型 | 路径/绑定 | Phase |
|---|--------|------|-----------|-------|
| W-01 | 工作台首页 | Schema 大屏 | `code: dashboard-workbench` | P0 |
| W-02 | 我的待办 | micro-app | `/app/flow/tasks` | P0 |
| W-03 | 我的发起 | micro-app | `/app/flow/instances` | P1 |
| W-04 | 消息中心 | Schema 列表 | `code: workbench-messages` | P1 |
| W-05 | 快捷入口区 | Schema 内嵌 | 工作台 Schema 一部分 | P0 |

## 3. 界面逻辑详解

### W-01 工作台首页

**用户目标：** 一眼看到今天要做什么、整体运行态。

**布局结构：**

```
┌─────────────────────────────────────────────────────────┐
│ 欢迎语 + 日期                    [消息铃铛 SH-03]          │
├──────────────┬──────────────┬──────────────┬──────────────┤
│ Statistic    │ Statistic    │ Statistic    │ Statistic    │
│ 待我审批     │ 我发起的     │ 本月申请     │ 公告未读     │
├──────────────┴──────────────┴──────────────┴──────────────┤
│ Card「快捷入口」                                          │
│ [请假] [报销] [出差] [公告] [知识库]                       │
├──────────────────────────┬──────────────────────────────┤
│ BarChart 本周审批趋势     │ 列表：最新公告 Top5           │
├──────────────────────────┴──────────────────────────────┤
│ Card「AI 今日摘要」(A-06)                                 │
└─────────────────────────────────────────────────────────┘
```

**数据逻辑：**

| 指标 | API | 说明 |
|------|-----|------|
| 待我审批 | `GET /api/flow-tasks?assignee=me&status=pending` count | 或 dashboard 聚合 |
| 我发起的 | flow instances count | |
| 本月申请 | submissions count by month | |
| 公告未读 | 通知 API S-04 / 公告 API S-05 | Phase 1 可 mock |
| 趋势图 | flow stats API | |

**Editor 搭建：**

- Widgets: `Statistic` x4, `Card`, `Button`, `BarChart`, `AdvancedTable`(mini), `Richtext`(AI摘要)
- 数据源: S-07 仪表盘 API（需扩展）

**Flow：** 无独立流程；跳转待办用 Button → `navigateTo('/app/flow/tasks')`（需 PublishView 支持 shell navigate 或 link 菜单）

**AI：**

- Agent「每日工作台摘要」：输入 userId → 输出 Markdown 摘要
- 触发：页面 load 时调用 Agent API 或 Webhook

**Shell 改造（SH-01）：**

- 方案 A：`HomeView` 重定向到 `/dashboard` Schema 菜单
- 方案 B：`HomeView` 内 iframe 加载 dashboard schemaId

### W-02 我的待办

**用户目标：** 处理所有待审批任务。

**实现：** 不新建 Schema，直接菜单指向 Flow 子应用。

| 项 | 值 |
|----|-----|
| path | `/app/flow/tasks` |
| microAppId | `flow` |
| routeType | `micro-app` |
| layout | `with-menu` |

**Flow 已有能力：** TaskInboxView — 认领、通过、驳回、批量、委派。

**AI 增强：** 任务详情抽屉内调用 A-01 审批建议。

### W-03 我的发起

**逻辑：** 当前用户发起的 flow instances，筛选 running/completed。

**实现：** `/app/flow/instances` + 前端默认 filter `starter=me`（若 Flow 支持 query）。

### W-04 消息中心

**逻辑：** 聚合流程通知、系统公告、@提醒；已读/未读。

**Editor：** AdvancedTable + 详情 Drawer。

**Server：** S-04 通知中心 API（Phase 2）；Phase 1 可用流程通知列表 API 代替。

## 4. 能力平台扩展依赖

| 扩展 ID | 说明 | 状态 |
|---------|------|------|
| SH-01 | 首页 Schema 化 | 待开发 |
| S-07 | 仪表盘聚合 API | 待开发 |
| A-06 | 每日摘要 Agent | 待开发 |
| SH-03 | Header 消息铃铛 | 待开发 |
| E-08 | 通知 Widget | P1 |

## 5. 菜单配置

| name | path | routeType | schemaId / microAppId |
|------|------|-----------|------------------------|
| 工作台 | /dashboard | schema | `{dashboard-workbench}` |
| 我的待办 | /app/flow/tasks | micro-app | flow |

## 6. 实施步骤

1. [server] 实现 S-07 dashboard API
2. [editor] 设计并发布 dashboard-workbench Schema
3. [server] seed 菜单：工作台、我的待办
4. [shell] HomeView 跳转或嵌入 dashboard
5. [ai] 创建每日摘要 Agent 模板
6. 验收测试清单（见 05-build-patterns.md）

## 7. 验收标准

- [ ] 登录后默认看到工作台统计
- [ ] 待办数与实际 `/app/flow/tasks` 一致
- [ ] 快捷入口可跳转对应申请页
- [ ] AI 摘要区域有内容（或 Phase 1 占位说明）

## 8. 实施状态

| 界面 | schemaId | 菜单 | 验收 |
|------|----------|------|------|
| W-01 | `dashboard-workbench` | ✅ | ✅ A级 |
| W-02 | — micro-app | ✅ | ✅ 菜单 |
| W-03 | micro-app `/app/flow/instances` | ✅ | ✅ 菜单 |
| W-04 | `workbench-messages` | ✅ | ✅ seed |
| W-05 | 内嵌 W-01 | — | ✅ A级 |

---

相关：[03-实施路线图](../03-implementation-roadmap.md) | [06-能力平台运营](./06-capability-platform-ops.md)
