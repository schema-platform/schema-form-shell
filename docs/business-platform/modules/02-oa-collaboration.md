# 模块落地 — OA 办公协同

> 优先级：**P0–P1** | Phase：**2**（部分 P0 可提前）

## 1. 模块概述

OA 模块覆盖日常办公：公告、会议、出差、用印、公文、知识库等。典型模式为 **Schema 表单/列表 + 可选 Flow 审批 + AI 文档能力**。

## 2. 界面清单

| # | 界面 | Schema code | 需 Flow | 需 AI | Phase |
|---|------|-------------|---------|-------|-------|
| OA-01 | 公告列表 | `oa-notice-list` | 可选 | 摘要 | P1 |
| OA-02 | 公告发布 | `oa-notice-publish` | 可选 | 摘要 | P1 |
| OA-03 | 公告详情 | `oa-notice-detail` | — | — | P1 |
| OA-04 | 会议列表 | `oa-meeting-list` | — | — | P2 |
| OA-05 | 会议预约 | `oa-meeting-book` | 冲突审批 | 纪要 | P2 |
| OA-06 | 出差申请 | `oa-trip-apply` | ✅ | 政策 RAG | P1 |
| OA-07 | 出差台账 | `oa-trip-list` | — | — | P1 |
| OA-08 | 用印申请 | `oa-seal-apply` | ✅ | 风险提示 | P2 |
| OA-09 | 公文收文 | `oa-doc-receive` | 传阅流 | OCR | P2 |
| OA-10 | 公文拟稿 | `oa-doc-draft` | 多级审批 | 拟稿辅助 | P2 |
| OA-11 | 知识库 | micro-app | — | RAG ✅ | P1 |
| OA-12 | 资产领用 | `oa-asset-apply` | ✅ | — | P2 |

## 3. 核心界面逻辑

### OA-01/02/03 公告通知

**业务流程：**

```
起草 → (可选审批) → 发布 → 全员/部门可见 → 已读统计
```

**OA-02 发布表单字段：**

| 字段 | Widget | 说明 |
|------|--------|------|
| 标题 | Input | 必填 |
| 类型 | Select dict://notice_type | 通知/公告/紧急 |
| 发布范围 | TreeSelect 部门 / 全员 Switch | |
| 正文 | Richtext | |
| 附件 | Upload | |
| 置顶 | Switch | |
| 有效期 | Date 范围 | |

**OA-01 列表：** AdvancedTable — 标题、类型、发布人、时间、已读率、状态

**数据模型选择：**

| 方案 | 说明 |
|------|------|
| A. Submission | 复用 submissions，快但查询弱 |
| B. 独立 Notice 模型 | S-05 扩展，推荐 Phase 2 |

**Flow（可选）：** 重要公告 → 部门经理 → 分管领导（自定义 FlowDefinition）

**AI：**

- 发布前：摘要生成（标题+正文 → 100 字摘要）
- 阅读：RAG 不参与；列表可 AI 归类

### OA-06/07 出差申请

**业务流程：**

```
员工填写 → 部门经理审批 → HR 备案 → 完成
```

**表单字段：**

| 字段 | Widget |
|------|--------|
| 出差事由 | Textarea |
| 目的地 | Input + Cascader 省市区 |
| 起止日期 | Date 范围 |
| 交通工具 | Select |
| 预算金额 | Number |
| 同行人 | UserSelector 多选 |
| 附件 | Upload |

**Flow：** 复制「请假审批」模板改节点名；或新建 `oa-trip-approval`

**Webhook：** `submission.created` + schemaId=oa-trip-apply → flowDefinitionId

**AI：**

- RAG：差旅制度问答（住宿标准、交通等级）
- 提交前：预算合规检查

### OA-11 知识库

**实现：** 菜单指向 `/app/ai/rag`，不单独建 Schema。

**逻辑：**

- 上传制度 PDF/Word
- 向量索引
- 员工在 AI 对话或 Sidebar 提问

**与业务表单联动：** 出差/报销表单挂载 AI Sidebar，context=travel-policy

### OA-09/10 公文管理（Phase 2）

**收文逻辑：** 登记号自动生成、来文单位、密级、份数、附件 → 传阅 Flow（并行 UserTask 会签 F-02）

**拟稿逻辑：** 标题、主送、抄送、正文 Richtext → 科室核稿 → 领导签发

**AI：** 公文要素提取 A-04；拟稿辅助 Agent

## 4. Flow 模板规划

| 流程名 | 基于模板 | 节点 |
|--------|----------|------|
| 出差审批 | 请假审批 | 部门经理 → HR |
| 用印审批 | 采购审批简化 | 部门负责人 → 行政 |
| 公文传阅 | 入职并行 | 多部门并行阅示 |
| 公文签发 | 采购分级 | 科室 → 分管领导 → 主要领导 |

## 5. 能力平台扩展依赖

| 扩展 ID | 用途 |
|---------|------|
| S-05 | 公告 CRUD API |
| E-05 | 会议日历 |
| E-11 | 字典数据源 |
| F-02 | 公文会签 |
| A-04 | 文档 OCR |
| A-05 | 公文拟稿 Agent 模板 |

## 6. 菜单结构

```
OA 办公
├── 公告通知    → oa-notice-list
├── 出差申请    → oa-trip-apply
├── 出差台账    → oa-trip-list
├── 用印申请    → oa-seal-apply (P2)
├── 公文管理    → 目录 (P2)
│   ├── 收文登记
│   └── 拟稿发文
└── 知识库      → /app/ai/rag
```

## 7. 实施步骤

1. Phase 1 末：知识库菜单 + RAG 上传测试文档
2. Phase 2 W1：出差表单+列表+Flow+Webhook
3. Phase 2 W2：公告 API + 公告三页面
4. Phase 2 W3：用印、公文（可选）
5. 每项更新实施状态表

## 8. 验收标准

- [ ] 出差全流程跑通
- [ ] 知识库可问答上传的制度
- [ ] 公告发布后在列表可见
- [ ] （P2）公文传阅会签正常

## 9. 实施状态

| 界面 | schemaId | flowDefId | 验收 |
|------|----------|-----------|------|
| OA-02 | `oa-notice-publish` | 可选 | ✅ A级 |
| OA-03 | `oa-notice-detail` | — | ✅ A级 |
| OA-05 | `oa-meeting-book` | 冲突审批 | ✅ A级 |
| OA-01 | `oa-notice-list` | — | ✅ seed |
| OA-06 | `oa-trip-apply` | ✅ 出差审批 | ✅ L3 |
| OA-07 | `oa-trip-list` | — | ✅ L3 |
| OA-07b | `oa-trip-detail` | — | ✅ L3 |
| OA-04 | `oa-meeting-list` | — | ✅ seed B级 |
| OA-08 | `oa-seal-apply` | ✅ | ✅ seed B级 |
| OA-10 | `oa-doc-draft` | 多级审批 | ✅ seed B级 |
| OA-12 | `oa-asset-apply` | ✅ 资产领用 | ✅ seed B级 |
| OA-11 | micro-app `/app/ai/rag` | — | ✅ 菜单 |
| OA-09 | `oa-doc-receive` | 传阅流 | ✅ seed B级 |

---

相关：[03-人事管理](./03-hr-personnel.md) | [05-搭建模式](../05-build-patterns.md)
