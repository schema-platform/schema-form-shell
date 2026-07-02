# 10 — 总执行计划（能力优先 · 分块验收 · 分模块提交）

> **原则**：能力平台不满足时先修能力平台，再搭业务；同一时刻只改一个子项目；每块验完再 commit。

## 执行顺序总览

```
Phase A  Editor 能力 P0（阻塞可交付）
  └─ A0 Widget Mock          ✅
  └─ A1 E-26 联动 linkages
  └─ A2 E-04 提交 Submission
  └─ A3 E-24/E-23 PublishView 变量 + URL
  └─ A4 E-25 absolute 表单 submit/validate
  └─ A5 E-03 嵌套 prop data.xxx
  └─ A6 E-27 列筛选 filterable
  └─ A7 E-28/E-29 tag dict + row 表达式（P0 余项）

Phase B  Server 能力 P0（Editor 就绪后）
  └─ B1 S-08 Flow 菜单路径
  └─ B2 S-07 仪表盘 API
  └─ B3 S-01 菜单 seed 扩展
  └─ B4 S-02 业务 Schema seed
  └─ B5 S-03 Webhook 模板

Phase C  Flow / AI 能力（业务详情页依赖）
  └─ C1 F-04/F-08 流程表单绑定 + embed
  └─ C2 E-01/E-02 Flow 轨迹 + 任务操作 Widget
  └─ C3 A-01/A-05 审批建议 + Agent 模板

Phase D  业务落地（能力就绪后）
  └─ D1 请假模块可交付 Schema seed（workbench + leave 四页）  ✅
  └─ D2 请假全流程 E2E 验收
  └─ D3 系统管理（user/role/dept）
  └─ D4 能力平台运营入口

Phase E  文档与验收
  └─ E1 模块文档 Phase1 验收标记
  └─ E2 shell routing / README 对齐
```

## 分块明细

| 块 | 子项目 | 内容 | 关联检查 | 验收 |
|----|--------|------|----------|------|
| **A0** | editor | Widget `mock.ts` + surface 注入 | EditorCanvas / WidgetRenderer / advanced-table | vitest + vue-tsc |
| **A1** | editor | E-26 PropertyPanel → `linkages` | useLinkage / LinkageConfig / 表单 configPanels | PropertyPanel + useLinkage 测试 |
| **A2** | editor | E-04 `submitSubmission` POST `{ data }` | eventEngine / ActionListEditor / server submission API | eventEngine 单测 + 提交 E2E |
| **A3** | editor | E-24 board.variables + E-23 URL query | PublishView / WidgetRenderer variablesContext | PublishView 单测 |
| **A4** | editor | E-25 absolute 布局 form 聚合 | SchemaNode / WidgetRenderer.submit | SchemaRender 集成测 |
| **A5** | editor | E-03 列路径 `data.xxx` | FgAdvancedTable / submission 列表 API | advanced-table 单测 |
| **A6** | editor | E-27 filterable + filters 编辑器 | AdvancedColumnsEditor / FgAdvancedTable | 列配置 + 运行时筛选 |
| **B1** | server | S-08 `/designer` 菜单 | seedMenus / shell SideMenu | 菜单可打开 Flow 设计器 |
| **B2–B5** | server | seed 菜单/Schema/Webhook + dashboard API | 04-menu / 00-workbench / 07-deliverable | admin 登录可见 P0 菜单；`/api/dashboard` KPI |
| **D2** | server+editor | 请假全流程 E2E | A2+B5+D1+F-04 | 提交→待办→台账 |

## 当前进度

| **A0** Widget Mock | ✅ 已提交 | schema-form-editor `2143c6b` |
| **A1** E-26 linkages | ✅ 已提交 | schema-form-editor `87c0865` |
| **A2** E-04 submitSubmission | ✅ 已提交 | schema-form-editor `c7693d0` |
| **A3** E-24 PublishView 变量 | ✅ 已提交 | 同上 |
| **A4** E-25 absolute 表单 submit | ✅ 已提交 | schema-form-editor `70d67d8` |
| **A5** E-03 嵌套 prop | ✅ 已提交 | schema-form-editor `54926ad` |
| **A6** E-27 filterable | ✅ 已提交 | schema-form-editor `0a5f12c` |
| **A7** E-28/E-29 dict + row 表达式 | ✅ 已提交 | schema-form-editor `5cf7157` |
| **B1** S-08 Flow 菜单 | ✅ 已提交 | schema-form-server `65e1509` |
| **B2** S-07 仪表盘 API | ✅ 已提交 | schema-form-server `b878d8c` |
| **B3** S-01 菜单 seed | ✅ 已提交 | schema-form-server `8817461` |
| **B4** S-02 业务 Schema seed | ✅ 已提交 | schema-form-server `96aa8cc` |
| **B5** S-03 Webhook 模板 | ✅ 已提交 | schema-form-server `f3b4017` |
| **D1** 请假模块可交付 Schema seed | ✅ 已提交 | schema-form-server `6abb75d` |
| **D2** 请假全流程 E2E | ✅ 已提交 | schema-form-server `39e063a` |

## 关联修复规则

1. 改 eventEngine → 同步 ActionListEditor、EventConfigDialog、单测
2. 改 PublishView → 同步 WidgetRenderer props、variableSystem 测试
3. 改 AdvancedTable → 同步 mock 字段、08 列规范文档
4. 改 seed → 只动 server，前端按已有 API 适配
