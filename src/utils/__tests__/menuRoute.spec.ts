import { describe, it, expect } from 'vitest'
import {
  buildSchemaViewPath,
  menuItemIndex,
  parseSchemaCodeFromPath,
  resolveActiveMenuIndex,
} from './menuRoute'
import type { MenuTreeNode } from '@/types/menu'

const tree: MenuTreeNode[] = [
  {
    id: 'hr-dir',
    name: '人事',
    path: '',
    icon: '',
    type: 'menu',
    permission: '',
    sort: 0,
    status: 'active',
    component: '',
    parentId: null,
    target: '_self',
    microAppId: null,
    routeType: 'micro-app',
    schemaId: null,
    url: '',
    app: 'shell',
    layout: 'with-menu',
    children: [
      {
        id: 'leave-apply',
        name: '请假申请',
        path: '/app/editor/view/hr-leave-apply',
        icon: '',
        type: 'menu',
        permission: '',
        sort: 1,
        status: 'active',
        component: '',
        parentId: 'hr-dir',
        target: '_self',
        microAppId: 'editor',
        routeType: 'schema',
        schemaId: 'pub-leave-apply',
        url: '',
        app: 'shell',
        layout: 'with-menu',
        children: [],
      },
      {
        id: 'leave-list',
        name: '请假台账',
        path: '/app/editor/view/hr-leave-list',
        icon: '',
        type: 'menu',
        permission: '',
        sort: 2,
        status: 'active',
        component: '',
        parentId: 'hr-dir',
        target: '_self',
        microAppId: 'editor',
        routeType: 'schema',
        schemaId: 'pub-leave-list',
        url: '',
        app: 'shell',
        layout: 'with-menu',
        children: [],
      },
    ],
  },
]

describe('menuRoute', () => {
  it('builds and parses schema view path', () => {
    expect(buildSchemaViewPath('hr-leave-apply')).toBe('/app/editor/view/hr-leave-apply')
    expect(parseSchemaCodeFromPath('/app/editor/view/hr-leave-apply')).toBe('hr-leave-apply')
  })

  it('highlights only one menu for unique path', () => {
    const active = resolveActiveMenuIndex('/app/editor/view/hr-leave-list', {}, tree)
    expect(active).toBe(menuItemIndex(tree[0].children[1]))
    expect(active).not.toBe(menuItemIndex(tree[0].children[0]))
  })

  it('resolves legacy ?id= to unique menu path index', () => {
    const active = resolveActiveMenuIndex('/app/editor/view', { id: 'pub-leave-apply' }, tree)
    expect(active).toBe('/app/editor/view/hr-leave-apply')
  })
})
