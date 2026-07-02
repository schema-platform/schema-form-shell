# Widget Mock 数据规范

> 复杂 Editor 部件在设计阶段需要可预览的默认数据。本规范定义 `mock.ts` 约定，与 Editor 实现 [`schema-form-editor/docs/widget-development.md`](../../../schema-form-editor/docs/widget-development.md) 对齐。

## 目标

- 拖入高级表格/图表/描述列表后，**无需先配 API** 即可在画布上看到 tag、按钮、tooltip 等列渲染效果
- Mock 数据与业务场景一致（请假台账、工作台 KPI），Board 交付物可直接复用
- **正式运行时**（PublishView）无 API 时不展示 mock，避免误导用户

## 边界（与 Server 真实接口）

| 场景 | 是否允许 mock | 正确做法 |
|------|---------------|----------|
| Editor 画布、Widget 未配 API | ✅ `mock.ts` | 仅预览 UI，见 `shouldUseWidgetMock` |
| 业务 PublishView / Shell 运行时 | ❌ | 配真实 `apiUrl`（submissions / 域 API） |
| 调试业务列表/表单 | ❌ | 起 `schema-form-server`，seed + 真实 HTTP |
| Editor 离线改 Schema | ⚠️ 可选 `VITE_USE_MOCK` | 仅改 Schema 结构，**不**代表业务数据 |

**原则**：有 Server 就写/调真实接口；mock 不是业务数据的捷径。Server 侧 `/api/data`、`/api/mock` 为历史演示路由，Phase H **H-12** 计划废弃，业务 deliverable 不得引用。

## 目录约定

```
widgets/{group}/{widget-name}/
├── config.ts      # defaultProps 引用 mock（图表/详情类）
├── mock.ts        # 默认可视化数据
├── schema.ts
└── Fg*.vue        # 表格类在组件内按 surface 加载 mock
```

## 适用部件

| 类型 | 示例 | mock 形态 | 加载方式 |
|------|------|-----------|----------|
| 表格 | `advanced-table` | `{ kind: 'table', rows, total }` | 组件内 `getTableRowsFromMock` |
| 图表 | `bar-chart`, `line-chart`, `pie-chart` 等 | `{ kind: 'chart', staticData }` | `config.defaultProps.staticData` |
| 详情 | `descriptions` | `{ kind: 'record', staticData }` | `config.defaultProps.staticData` |
| KPI | `statistic` | `{ kind: 'statistic', defaultProps }` | `config.defaultProps` 展开 |

登记表：`schema-form-editor/src/widgets/base/widgetMock.ts` → `MOCK_REGISTRY`。

## 渲染表面

| 表面 | 注入位置 | Mock 行为 |
|------|----------|-----------|
| `editor` | `EditorCanvas` | 无 API 时使用 mock |
| `runtime` | `WidgetRenderer` / PublishView | 无 API 时不使用 mock |

## 业务场景 Mock 清单（Phase 1 参考）

| 部件 | 场景 | mock 文件 |
|------|------|-----------|
| 高级表格 | 请假申请台账 | `advanced-table/mock.ts` |
| 折线图 | 审批量趋势 | `line-chart/mock.ts` |
| 柱状图 | 月度申请量 | `bar-chart/mock.ts` |
| 饼图 | 假别分布 | `pie-chart/mock.ts` |
| 统计卡片 | 待我审批 | `statistic/mock.ts` |
| 描述列表 | 请假详情 | `descriptions/mock.ts` |

## 与能力缺口的关系

- Mock 字段当前采用**扁平结构**（如 `applicantName`），便于设计器预览
- 运行时 API 可能返回嵌套 `data.xxx`（见 [02-capability-gap E-03](./02-capability-gap-and-extensions.md)），对接真实 API 后需统一字段路径或等待 E-03 修复
- 高级表格列能力详见 [08-advanced-table-column-spec.md](./08-advanced-table-column-spec.md)

## 新增复杂部件 Checklist

1. 在部件目录创建 `mock.ts`，选用对应 `kind`
2. `config.ts` 引用 mock 作为 `defaultProps`（图表/详情/KPI）
3. 表格类在 Vue 组件内接入 `shouldUseWidgetMock` + `getTableRowsFromMock`
4. 在 `widgetMock.ts` 的 `MOCK_REGISTRY` 登记
5. 默认列/字段配置与 mock 字段对齐
