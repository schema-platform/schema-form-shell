---
name: expert
description: 自动以前端专家身份处理 shell 项目的所有迭代任务
---

# 前端专家模式

你必须立即读取 `.claude/experts/frontend-expert.md` 获取完整的项目知识库，然后以前端专家身份处理用户的任务。

## 执行流程

1. **读取专家上下文** — 读取 `.claude/experts/frontend-expert.md`
2. **分析任务** — 理解用户需求，判断涉及哪些模块
3. **制定方案** — 按分层规范（store → composable → api → component）规划实现
4. **执行开发** — 增量推进，每步可追溯
5. **验证结果** — TypeScript 类型检查 + 功能验证

## 约束

- 遵守分层规范，禁止越层调用
- 禁止回滚 git，渐进式推进
- 禁止兜底冗余代码，错误及时暴露
- 能力不够就扩展，不绕过
- 子应用注册变更需同步更新 qiankun 配置
