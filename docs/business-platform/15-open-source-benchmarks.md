# 15 — 开源参照基准（界面功能来源）

> **原则**：界面功能点必须可追溯到开源产品文档/源码/演示，禁止凭感觉编造。  
> 本文件是 `interface-specs/` 各界面规格的统一参照索引。

最后更新：2026-07-02

---

## 1. 参照项目清单

| 项目 | 协议 | 技术栈 | 本平台的参照范围 | 官方入口 |
|------|------|--------|------------------|----------|
| **O2OA** | AGPL-3.0 | Java / 低代码流程+CMS | 出差、报销、信息发布、并联流程、考勤联动 | [o2oa.net](https://www.o2oa.net) · [Gitee](https://gitee.com/o2oa/O2OA) |
| **RuoYi Office** | MIT | Spring Boot 3 + Vue3 + Flowable | 请假余额、用印/用车/会议室、合同双表、HRM 全流程 | [ruoyioffice.com](http://ruoyioffice.com) · [GitHub](https://github.com/wangzaidali/ruoyi-office) |
| **JeecgBoot** | Apache-2.0 | Spring Boot + Vue3 + Flowable | 请假审批案例、Online 表单+流程、高级查询、导入导出 | [jeecgboot.com](http://www.jeecgboot.com) · [GitHub](https://github.com/jeecgboot/JeecgBoot) |
| **RuoYi-Vue（若依）** | MIT | Spring Boot + Vue | 系统管理 CRUD、字典、操作日志、在线用户 | [doc.ruoyi.vip](https://doc.ruoyi.vip) |
| **Activiti/Flowable 生态** | Apache-2.0 | BPMN | 待办/已办、撤回/驳回/撤销语义 | JeecgBoot 请假案例、RuoYi BPM 模块 |

---

## 2. 页面模式 ↔ 开源对照

| 本平台模式 | 含义 | O2OA | RuoYi Office | JeecgBoot |
|------------|------|------|--------------|-----------|
| **P-01 流程台账** | 搜索+表格+导出+行内详情弹窗+全屏审批 | 流程查询、CMS 列表配置 | 各业务台账 + BPM 状态列 | Online 列表 + 高级查询 |
| **P-02 流程申请** | 完整表单+校验+提交+Webhook 启流 | 流程拟稿表单 | 各申请单（请假/用印/用车） | 请假案例发起表单 |
| **P-03 详情审批** | Descriptions+Timeline+审批操作 | 流程办理、表单阅读 | 待办办理页 | 待办任务同意/驳回 |
| **P-04 统计看板** | KPI+多图表+API 绑定 | 门户统计、考勤统计 | 各模块报表 | Online 报表 / 大屏 |
| **P-05 主从管理** | 左树右表/左类型右项 | CMS 栏目+分类 | 字典管理、印章台账 | 字典/部门树 |
| **P-06 内容发布** | 编辑表单+阅读表单+发布范围 | CMS 通知公告（编辑/阅读双表单） | 企业云盘/政策 | — |
| **P-07 大屏** | 全屏 KPI+自动刷新 | 门户大屏 | 领导驾驶舱 | 报表大屏设计器 |
| **P-08 业务 Widget** | UserManagement 等复合组件 | — | HRM 档案、印章台账 | Online 代码生成 CRUD |

---

## 3. 模块级功能来源摘要

### 3.1 工作台 / 待办

| 功能 | 来源 |
|------|------|
| 登录后 KPI（待办数、发起数） | O2OA 办公中心首页；RuoYi 工作台 |
| 快捷入口跳转申请页 | O2OA「新建流程」；JeecgBoot「发起流程」 |
| 待办收件箱 | Flowable TaskInbox；JeecgBoot 待办/已办菜单 |
| 消息/通知聚合 | O2OA 消息中心；RuoYi 通知公告 |

### 3.2 OA 办公

| 功能 | 来源 |
|------|------|
| **出差申请** | O2OA 应用市场「出差申请」：员工发起→上级审批→HR 备案；流程结束同步考勤休假记录 |
| **公告发布** | O2OA CMS：编辑表单+阅读表单、发布范围（读者控件）、列表配置、可选审批后发布 |
| **用印申请** | RuoYi Office：印章台账+用印申请+用印记录追溯 |
| **会议室** | RuoYi Office：资源管理、在线预定、冲突检测、时间轴 |
| **公文** | O2OA 流程：拟稿→核稿→签发；并行传阅会签 |
| **报销** | O2OA 财务管理应用：拟稿→部门领导→财务复审→>5000 公司领导→财务办理 |

### 3.3 人事

| 功能 | 来源 |
|------|------|
| **请假** | JeecgBoot 请假案例：多级审批、待审批/已批准/驳回/取消状态、撤回/撤销/驳回 |
| **假期余额** | RuoYi Office：账户+流水、提交预占、通过确认、拒绝释放、销假退回 |
| **入职并行** | O2OA HR 平台：IT+行政并行→部门确认 |
| **员工档案/组织** | O2OA 人力资源平台：员工档案、组织架构、员工自助 |
| **招聘/Offer** | RuoYi HRM：招聘需求→Offer 审批 |

### 3.4 财务

| 功能 | 来源 |
|------|------|
| **报销金额网关** | O2OA 报销流程：≤5000 与 >5000 分支 |
| **采购分级** | RuoYi ERP：部门→经理→大额 VP |
| **合同双表** | RuoYi Office：contract_info 起草 + contract_ledger 台账镜像 |
| **预算执行** | 通用 ERP：编制 vs 实际 StackedBar |
| **银行对账** | 通用财务：导入流水→匹配→差异列表 |

### 3.5 系统管理

| 功能 | 来源 |
|------|------|
| 用户 CRUD、导入导出、重置密码 | RuoYi `sys_user` |
| 角色+菜单+按钮权限 | RuoYi `sys_role` + PermissionTree |
| 部门树 drag | RuoYi `sys_dept` |
| 字典主从 | RuoYi `sys_dict_type` + `sys_dict_data` |
| 操作/登录日志 | RuoYi `sys_oper_log` / `sys_logininfor` |
| 在线用户 | RuoYi 在线用户监控 |

### 3.6 政务 / 审计 / 计装 / 报表

| 域 | 来源 |
|----|------|
| 并联审批、时限 | O2OA 政务办件、并行网关 |
| 督查督办、催办 | O2OA Timer+通知；RuoYi 督办看板 |
| 审计计划/整改闭环 | 内审行业通用 + RuoYi 合规模块思路 |
| 计量器具台账、到期预警 | 计量管理系统通用（检定周期、证书） |
| 装备领用归还 | 资产/仓库模块（RuoYi EAM/WMS） |
| 报表中心/导出/订阅 | JeecgBoot Online 报表；O2OA 门户 |
| 领导驾驶舱 | JeecgBoot 大屏；O2OA 门户 |

---

## 4. 流程语义对照（JeecgBoot 请假案例）

| 操作 | 含义 | 本平台实现 |
|------|------|------------|
| 同意/驳回 | 当前节点办理 | FgFlowTaskActions |
| 撤回 | 下一节点未办理前撤回 | Flow API + 台账「撤回」按钮（待实现 E-44） |
| 撤销 | 流程回到发起态，清空历史 | Flow API（待实现） |
| 取消 | 发起人终止流程 | Flow API（待实现） |

状态：**待审批 / 未批准 / 已取消 / 已批准** → 映射 `submission.status` + `flowInstance.status`

---

## 5. 规格文档如何使用

1. 写界面规格前，在本文件 §3 找到模块级来源  
2. 打开 `interface-specs/{模块}.md` 中对应 `{code}`  
3. 功能点表格「来源」列必须填写上表中的项目+功能名  
4. 「能力平台实现」对照 [02-能力缺口](./02-capability-gap-and-extensions.md) 填已有/缺口  
5. 实现完成后更新 `11-implementation-status.md`，不在规格里改状态

---

## 6. 引用链接

- O2OA 出差申请应用：https://www.o2oa.net/market/app-b9f3ab67-94e6-4746-8d8e-086f41f1eee3.html  
- O2OA 信息发布教程：https://www.o2oa.net/cms/train/59.html  
- O2OA 报销流程：https://www.o2oa.net/cms/workflow/633.html  
- JeecgBoot 请假案例：http://www.jeecgboot.com/leave/  
- RuoYi Office 全景：http://ruoyioffice.com/blog/default/ruoyi-office-all-in-one-enterprise-platform  
- RuoYi 假期余额设计：https://jishuzhan.net/article/2051826065543331841  
