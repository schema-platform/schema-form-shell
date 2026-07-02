# 路由架构

> 与 `src/router/index.ts` 实现对齐。Base path：`/schema-platform/`（dev 端口 5050）。

## 路由表

| 路径 | 布局 / 组件 | 说明 |
|------|-------------|------|
| `/login` | LoginView | 登录页（公开） |
| `/sso/callback` | SSOCallbackView | SSO 回调（公开） |
| `/` | ClassicSidebarLayout → HomeView | 首页 |
| `/admin/micro-apps` | ClassicSidebarLayout → MicroAppManageView | 微应用管理 |
| `/app/:pathMatch(.*)*` | ClassicSidebarLayout → qiankun `#micro-container` | 带菜单子应用 |
| `/standalone/:pathMatch(.*)*` | StandaloneLayout | 全屏子应用（无侧边栏） |
| `/*` | redirect → `/` | 兜底 |

**设计要点：** `/app/*` 是 `/` 的**子路由**，与首页共用 `ClassicSidebarLayout`，避免布局销毁重建导致菜单闪烁。

## 子应用路径示例

| URL | 模式 | 子应用 | 子路由 |
|-----|------|--------|--------|
| `/schema-platform/app/editor/instances` | 带菜单 | editor | `/instances` |
| `/schema-platform/app/flow/tasks` | 带菜单 | flow | `/tasks` |
| `/schema-platform/app/ai/rag` | 带菜单 | ai | `/rag` |
| `/schema-platform/app/editor/view?id=xxx` | 带菜单 | editor | `/view`（Schema 运行时） |
| `/schema-platform/standalone/editor` | 全屏 | editor | `/` |
| `/schema-platform/standalone/flow/designer` | 全屏 | flow | `/designer` |
| `/schema-platform/standalone/ai` | 全屏 | ai | `/` |

## 动态菜单

侧边栏菜单从 API 加载：`GET /api/menus/route`

菜单数据结构（节选）：

```ts
interface MenuTreeNode {
  id: string
  name: string
  path: string
  icon: string
  microAppId: string | null
  target: '_self' | '_blank'
  routeType: 'schema' | 'micro-app' | 'link'
  schemaId: string | null   // routeType=schema 时
  url: string               // routeType=link 时
  layout: 'with-menu' | 'without-menu'
  children: MenuTreeNode[]
}
```

**导航行为（SideMenu）：**

| routeType | 行为 |
|-----------|------|
| `schema` | `router.push({ path: '/app/editor/view', query: { id: schemaId } })` |
| `micro-app` | `router.push(path)` 或 `target=_blank` 新窗口 |
| `link` | `window.open(url)` |

完整菜单树设计见 [business-platform/04-菜单与路由设计.md](./business-platform/04-menu-routing-design.md)。

## 鉴权

全局 `beforeEach` 守卫：

1. 无 token → 重定向 `/login?redirect=...`（公开路由除外）
2. 有 token 访问 `/login` → 已加载用户则重定向 `/`
3. 公开路由：`meta.public === true` 或 name 为 `login` / `sso-callback` / `app` / `standalone`

## qiankun 激活规则

子应用 entry 与 activeRule 见 `@schema-platform/platform-shared/qiankun/config.ts`：

```ts
// 同时匹配带菜单与全屏两种路径
/schema-platform/app/{appName}/*
/schema-platform/standalone/{appName}/*
```

详见 [微前端容器](./micro-app-containers.md)。
