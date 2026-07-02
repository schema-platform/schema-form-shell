# 14 — 界面功能点矩阵（进度看板）

> **规格详情（布局/功能/能力）已迁移至 [interface-specs/](./interface-specs/README.md)**  
> 功能点来源：[15-open-source-benchmarks.md](./15-open-source-benchmarks.md)（O2OA / RuoYi Office / JeecgBoot）  
> 禁止无参照编造功能。

最后更新：2026-07-02

---

## 1. 分级标准

| 级别 | 含义 |
|------|------|
| **L3 可用** | 规格 📝 + 实现 ✅ + 验收通过 |
| **L2 半可用** | 主路径通，缺规格项或能力缺口 |
| **L1 壳** | 仅 seed，未按 interface-specs 搭建 |
| **L0 占位** | reason 占位 |

---

## 2. 规格完成度

| 模块 | 界面数 | 规格文档 | 状态 |
|------|--------|----------|------|
| 工作台+系统 | 16 | [01-workbench-system.md](./interface-specs/01-workbench-system.md) | ✅ 全量 |
| OA | 13 | [02-oa.md](./interface-specs/02-oa.md) | ✅ 全量 |
| 人事 | 17 | [03-hr.md](./interface-specs/03-hr.md) | ✅ 全量 |
| 财务 | 17 | [04-finance.md](./interface-specs/04-finance.md) | ✅ 全量 |
| 政务 | 11 | [05-government.md](./interface-specs/05-government.md) | ✅ 全量 |
| 审计 | 14 | [06-audit.md](./interface-specs/06-audit.md) | ✅ 全量 |
| 计装 | 19 | [07-metrology-equipment.md](./interface-specs/07-metrology-equipment.md) | ✅ 全量 |
| 报表 | 20 | [08-reports.md](./interface-specs/08-reports.md) | ✅ 全量 |
| **合计** | **129** | [00-index.md](./interface-specs/00-index.md) | ✅ |

---

## 3. 实现进度（标杆）

| 界面 | code | 规格 | 实现 | 级别 |
|------|------|------|------|------|
| HR-01~04 请假链 | `hr-leave-*` | 📝 | ✅ | L3 |
| OA-06~07b 出差链 | `oa-trip-*` | 📝 | 🟡 | L2→L3 |
| W-01 工作台 | `dashboard-workbench` | 📝 | ✅ | L2 |
| SA-02~04 用户角色部门 | `sys-*-mgmt` | 📝 | ✅ | L3 |
| 其余 ~120 页 | 各 code | 📝 | L0~L1 | 待按规格实现 |

---

## 4. Loop 工作流（更新）

```
开源参照(15) → 界面规格(interface-specs) → 能力评估(02) → 实现(builder) → 验收 → 本表更新
```

**冻结：** 未在 interface-specs 中写规格的界面，禁止直接 `list()`/`apply()` 进菜单。

---

## 5. 能力平台阻塞项（从规格汇总）

| ID | 阻塞界面数 | 说明 |
|----|------------|------|
| P-01 | ~40 台账 | ✅ builder 已有，待批量替换 list() |
| S-05 Notice | 3 | OA 公告链 |
| E-15 明细行 | 2 | 报销/采购 |
| E-17 合规检查表 | 1 | 审计 |
| E-20 Adhoc | 1 | 报表 |
| S-09~S-13 域 API | 审计/计装/合同 | 台账/detail 真实数据 |

详见各模块规格文件末尾「能力汇总」节。
