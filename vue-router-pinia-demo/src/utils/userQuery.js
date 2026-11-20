// 与组件无关的纯函数，方便单测，也让页面专注于“收集条件、同步路由”这类工作。

// 按姓名或邮箱做不区分大小写的包含匹配；status 为空表示不过滤状态。
export function filterUsers(users, { keyword = '', status = '' } = {}) {
  const text = String(keyword).trim().toLowerCase()
  const state = String(status).trim()

  return users.filter((user) => {
    if (state && user.status !== state) return false
    if (!text) return true
    return (
      user.name.toLowerCase().includes(text) ||
      user.email.toLowerCase().includes(text)
    )
  })
}

// 把页码收敛到有效范围，处理非法值和越界值。
export function clampPage(page, pageSize, total) {
  const size = Number(pageSize) > 0 ? Math.trunc(Number(pageSize)) : 1
  const totalPages = Math.max(1, Math.ceil(Number(total) / size))
  const value = Math.trunc(Number(page))

  if (!Number.isFinite(value) || value < 1) return 1
  return Math.min(value, totalPages)
}

// 分页是纯计算：返回当前页数据以及修正后的页码。
export function paginate(list, page, pageSize) {
  const size = Number(pageSize) > 0 ? Math.trunc(Number(pageSize)) : 1
  const safePage = clampPage(page, size, list.length)
  const start = (safePage - 1) * size

  return {
    items: list.slice(start, start + size),
    total: list.length,
    page: safePage,
    pageSize: size,
  }
}

// 根据现有用户生成下一个不冲突的 ID，例如 u012 → u013。
export function generateUserId(users) {
  const max = users.reduce((result, user) => {
    const matched = /^u(\d+)$/.exec(user.id)
    return matched ? Math.max(result, Number(matched[1])) : result
  }, 0)

  return `u${String(max + 1).padStart(3, '0')}`
}
