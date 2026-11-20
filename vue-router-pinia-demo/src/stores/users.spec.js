import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useUsersStore } from './users'

beforeEach(() => {
  // 每个用例使用全新的 Pinia，store 回到初始模拟数据。
  setActivePinia(createPinia())
})

describe('users store', () => {
  it('新增用户使用不冲突的 ID 并补上创建日期', () => {
    const store = useUsersStore()
    const before = store.users.map((user) => user.id)

    const created = store.addUser({
      name: '新同学',
      email: 'new@example.com',
      department: '研发部',
      status: 'active',
    })

    expect(created.id).toBe('u013')
    expect(before).not.toContain(created.id)
    expect(created.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(store.users.at(-1).name).toBe('新同学')
  })

  it('编辑保留 ID 与创建日期', () => {
    const store = useUsersStore()
    const original = store.users[0]
    const id = original.id
    const createdAt = original.createdAt

    store.updateUser(id, {
      name: '林晓（改）',
      email: 'linxiao-new@example.com',
      department: '产品部',
      status: 'inactive',
      id: 'hacked',
      createdAt: '1999-01-01',
    })

    const updated = store.users.find((user) => user.id === id)
    expect(updated.name).toBe('林晓（改）')
    expect(updated.email).toBe('linxiao-new@example.com')
    expect(updated.id).toBe(id)
    expect(updated.createdAt).toBe(createdAt)
  })

  it('收藏只保存 ID，重复收藏不会产生重复记录', () => {
    const store = useUsersStore()

    store.toggleFavorite('u001')
    expect(store.favoriteIds).toEqual(['u001'])
    expect(store.favoriteCount).toBe(1)
    expect(store.favoriteUsers.map((user) => user.id)).toEqual(['u001'])

    // 再次调用表示取消收藏，列表与计数一起变化。
    store.toggleFavorite('u001')
    expect(store.favoriteIds).toEqual([])
    expect(store.favoriteCount).toBe(0)
    expect(store.favoriteUsers).toEqual([])
  })

  it('收藏用户列表会跟随用户信息更新', () => {
    const store = useUsersStore()

    store.toggleFavorite('u002')
    store.updateUser('u002', { name: '周雨（改）' })

    expect(store.favoriteUsers[0].name).toBe('周雨（改）')
  })

  it('编辑不存在的用户返回 null 且不新增数据', () => {
    const store = useUsersStore()
    const count = store.users.length

    expect(store.updateUser('u999', { name: '不存在' })).toBeNull()
    expect(store.users).toHaveLength(count)
  })
})
