/**
 * Menu types -- aligned with /api/menus/route contract
 */

/** Menu tree node from /api/menus/route */
export interface MenuTreeNode {
  id: string
  name: string
  path: string
  icon: string
  type: 'menu' | 'button'
  permission: string
  sort: number
  status: 'active' | 'inactive'
  component: string
  parentId: string | null
  target: '_self' | '_blank'
  microAppId: string | null
  /** 路由类型：schema=Schema页面, micro-app=微前端子应用, link=外部链接 */
  routeType: 'schema' | 'micro-app' | 'link'
  /** routeType=schema 时，关联的 Schema ID */
  schemaId: string | null
  /** routeType=link 时，外部 URL */
  url: string
  /** 所属应用：shell=主应用, admin=系统管理, 空=通用 */
  app: string
  /** 容器布局：with-menu=带菜单容器, without-menu=独立全屏 */
  layout: 'with-menu' | 'without-menu'
  children: MenuTreeNode[]
}
