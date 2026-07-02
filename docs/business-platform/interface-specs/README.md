# 界面规格文档（Interface Specs）

> **129 个界面全量规格已完成** — 索引：[00-index.md](./00-index.md)  
> 方法论：[16-oss-ui-deconstruction](../16-oss-ui-deconstruction-and-editor-evolution.md)  
> 开源来源：[15-open-source-benchmarks](../15-open-source-benchmarks.md)

## 每个界面包含

1. **Page Pattern** — CrudList / FlowApply / FlowDetail / StatsDashboard / ContentPublish / MasterDetail / DomainWidget / micro-app  
2. **区域布局** — A 查询 / B 工具栏 / C 表格 / D 行操作 / E 分页 / F 弹窗（或 Tabs/Chart 区）  
3. **功能点** — 带来源（JeecgBoot / O2OA / RuoYi）  
4. **Editor 组件树** — 用哪个 Fg* Widget 搭  
5. **API / Flow**  
6. **能力缺口** — E-45~S-xx  

## 模块文件

| 文件 | 界面 |
|------|------|
| [01-workbench-system.md](./01-workbench-system.md) | 16 |
| [02-oa.md](./02-oa.md) | 13 |
| [03-hr.md](./03-hr.md) | 17 |
| [04-finance.md](./04-finance.md) | 17 |
| [05-government.md](./05-government.md) | 11 |
| [06-audit.md](./06-audit.md) | 14 |
| [07-metrology-equipment.md](./07-metrology-equipment.md) | 19 |
| [08-reports.md](./08-reports.md) | 20 |

## 实现顺序（文档写完后的代码工作）

1. Editor：**E-45 FgCrudListPage** + **E-46 SearchSchema 编辑器**  
2. Editor：**E-47 FlowApply** + **E-48 FlowDetail**  
3. Server：域 API（S-05/S-10/S-13…）  
4. 按本目录逐 `code` 替换 `list()`/`apply()` JSON 工厂  

规格文档阶段 ✅ · 代码实现阶段 ⬜
