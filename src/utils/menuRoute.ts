import type { Router } from 'vue-router'
import type { MenuTreeNode } from '@/types/menu'

/** Schema 业务页路径前缀（每菜单唯一：/app/editor/view/{schemaCode}） */
export const SCHEMA_VIEW_PREFIX = '/app/editor/view/'

export function buildSchemaViewPath(schemaCode: string): string {
  return `${SCHEMA_VIEW_PREFIX}${schemaCode}`
}

export function parseSchemaCodeFromPath(path: string): string | null {
  if (!path.startsWith(SCHEMA_VIEW_PREFIX)) return null
  const code = path.slice(SCHEMA_VIEW_PREFIX.length).split('/')[0]
  return code || null
}

export function isLegacySchemaViewPath(path: string): boolean {
  return path === '/app/editor/view' || path === '/app/editor/view/'
}

/** el-menu 唯一 index：schema 菜单用 path，目录/微应用同理 */
export function menuItemIndex(node: MenuTreeNode): string {
  return node.path || node.id
}

/** 根据当前 URL 解析应高亮的菜单 index */
export function resolveActiveMenuIndex(
  path: string,
  query: Record<string, string | string[] | undefined>,
  menuTree: MenuTreeNode[],
): string {
  const schemaCode = parseSchemaCodeFromPath(path)
  if (schemaCode) {
    const byCode = findNodeBySchemaCode(menuTree, schemaCode)
    if (byCode) return menuItemIndex(byCode)
    return path
  }

  if (isLegacySchemaViewPath(path)) {
    const id = typeof query.id === 'string' ? query.id : undefined
    if (id) {
      const byId = findNodeBySchemaId(menuTree, id)
      if (byId) return menuItemIndex(byId)
    }
    const code = typeof query.schemaCode === 'string' ? query.schemaCode : undefined
    if (code) {
      const byCode = findNodeBySchemaCode(menuTree, code)
      if (byCode) return menuItemIndex(byCode)
      return buildSchemaViewPath(code)
    }
  }

  return path
}

export function findNodeBySchemaId(
  nodes: MenuTreeNode[],
  schemaId: string,
): MenuTreeNode | undefined {
  for (const node of nodes) {
    if (node.schemaId === schemaId) return node
    if (node.children?.length) {
      const found = findNodeBySchemaId(node.children, schemaId)
      if (found) return found
    }
  }
  return undefined
}

export function findNodeBySchemaCode(
  nodes: MenuTreeNode[],
  schemaCode: string,
): MenuTreeNode | undefined {
  for (const node of nodes) {
    const code = parseSchemaCodeFromPath(node.path)
    if (code === schemaCode) return node
    if (node.children?.length) {
      const found = findNodeBySchemaCode(node.children, schemaCode)
      if (found) return found
    }
  }
  return undefined
}

export function findNodeById(nodes: MenuTreeNode[], id: string): MenuTreeNode | undefined {
  for (const node of nodes) {
    if (node.id === id) return node
    if (node.children?.length) {
      const found = findNodeById(node.children, id)
      if (found) return found
    }
  }
  return undefined
}

export function findNodeByPath(nodes: MenuTreeNode[], path: string): MenuTreeNode | undefined {
  for (const node of nodes) {
    if (node.path === path) return node
    if (node.children?.length) {
      const found = findNodeByPath(node.children, path)
      if (found) return found
    }
  }
  return undefined
}

/** 菜单项导航：path 为路由身份，schemaId 仅作 legacy 加载参数 */
export function navigateMenuNode(router: Router, node: MenuTreeNode): void {
  const routeType = node.routeType || 'micro-app'

  if (routeType === 'schema') {
    if (node.path && !isLegacySchemaViewPath(node.path)) {
      router.push(node.path)
      return
    }
    const code = parseSchemaCodeFromPath(node.path)
    if (code) {
      router.push(buildSchemaViewPath(code))
      return
    }
    if (node.schemaId) {
      router.push({ path: '/app/editor/view', query: { id: node.schemaId } })
    }
    return
  }

  if (routeType === 'link') {
    const url = node.url || node.path
    if (!url) return
    if (node.target === '_blank') {
      window.open(url, '_blank')
    } else {
      window.location.href = url
    }
    return
  }

  if (!node.path) return
  if (node.target === '_blank') {
    const resolved = router.resolve(node.path)
    window.open(resolved.href, '_blank')
  } else {
    router.push(node.path)
  }
}
