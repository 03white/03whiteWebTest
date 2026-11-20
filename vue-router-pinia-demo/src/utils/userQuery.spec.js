import { describe, expect, it } from 'vitest'
import { clampPage, filterUsers, generateUserId, paginate } from './userQuery'

const users = [
  { id: 'u001', name: '林晓', email: 'linxiao@example.com', department: '研发部', status: 'active' },
  { id: 'u002', name: '周雨', email: 'zhouyu@example.com', department: '产品部', status: 'inactive' },
  { id: 'u003', name: 'Lin Tao', email: 'lintao@example.com', department: '研发部', status: 'active' },
]

describe('filterUsers', () => {
  it('按姓名或邮箱做不区分大小写的包含匹配', () => {
    expect(filterUsers(users, { keyword: 'lin' }).map((user) => user.id)).toEqual(['u001', 'u003'])
    expect(filterUsers(users, { keyword: '  ZHOUYU ' }).map((user) => user.id)).toEqual(['u002'])
  })

  it('按状态过滤，空状态表示全部', () => {
    expect(filterUsers(users, { status: 'inactive' }).map((user) => user.id)).toEqual(['u002'])
    expect(filterUsers(users, { status: '' })).toHaveLength(3)
  })

  it('无匹配时返回空数组', () => {
    expect(filterUsers(users, { keyword: '不存在的名字' })).toEqual([])
  })
})

describe('clampPage', () => {
  it('把非法页码收敛到第一页', () => {
    expect(clampPage('abc', 5, 12)).toBe(1)
    expect(clampPage(0, 5, 12)).toBe(1)
    expect(clampPage(-2, 5, 12)).toBe(1)
  })

  it('页码超出总页数时回到最后一页', () => {
    expect(clampPage(99, 5, 12)).toBe(3)
  })

  it('空列表始终有第一页可停留', () => {
    expect(clampPage(3, 5, 0)).toBe(1)
  })
})

describe('paginate', () => {
  it('返回当前页数据和总条数', () => {
    const result = paginate(users, 2, 2)
    expect(result).toEqual({ items: [users[2]], total: 3, page: 2, pageSize: 2 })
  })

  it('越界页码返回最后一页且不抛错', () => {
    const result = paginate(users, 99, 2)
    expect(result.page).toBe(2)
    expect(result.items).toEqual([users[2]])
  })
})

describe('generateUserId', () => {
  it('在最大编号基础上递增并补齐三位', () => {
    expect(generateUserId([{ id: 'u007' }, { id: 'u012' }, { id: 'u003' }])).toBe('u013')
  })

  it('空列表从 u001 开始', () => {
    expect(generateUserId([])).toBe('u001')
  })

  it('忽略不符合编号格式的记录', () => {
    expect(generateUserId([{ id: 'demo-1' }, { id: 'u002' }])).toBe('u003')
  })
})
