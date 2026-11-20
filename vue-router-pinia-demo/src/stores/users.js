import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { initialUsers } from '../data/users'
import { generateUserId } from '../utils/userQuery'

// Setup Store：ref 是 state，computed 是 getter，普通函数是 action。
// 收藏只保存 ID，收藏用户列表由用户列表派生，因此编辑用户后收藏页会自动拿到最新信息。
export const useUsersStore = defineStore('users', () => {
  const users = ref(initialUsers.map((user) => ({ ...user })))
  const favoriteIds = ref([])

  const favoriteUsers = computed(() =>
    favoriteIds.value
      .map((id) => users.value.find((user) => user.id === id))
      .filter(Boolean),
  )

  const favoriteCount = computed(() => favoriteIds.value.length)

  function isFavorite(id) {
    return favoriteIds.value.includes(id)
  }

  function addUser(payload) {
    const user = {
      id: generateUserId(users.value),
      name: payload.name,
      email: payload.email,
      department: payload.department,
      status: payload.status,
      // 创建日期由 store 统一生成，表单不负责这类业务字段。
      createdAt: new Date().toISOString().slice(0, 10),
    }
    users.value.push(user)
    return user
  }

  function updateUser(id, patch) {
    const target = users.value.find((user) => user.id === id)
    if (!target) return null

    // 编辑保留 ID 和创建日期，避免业务主键被表单覆盖。
    Object.assign(target, { ...patch, id: target.id, createdAt: target.createdAt })
    return target
  }

  function toggleFavorite(id) {
    const index = favoriteIds.value.indexOf(id)
    if (index >= 0) {
      favoriteIds.value.splice(index, 1)
    } else {
      favoriteIds.value.push(id)
    }
    return isFavorite(id)
  }

  return {
    users,
    favoriteIds,
    favoriteUsers,
    favoriteCount,
    isFavorite,
    addUser,
    updateUser,
    toggleFavorite,
  }
})
