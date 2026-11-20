// 模拟数据：只在当前浏览器会话中保留，刷新页面后会恢复成这里的初始值。
export const initialUsers = [
  { id: 'u001', name: '林晓', email: 'linxiao@example.com', department: '研发部', status: 'active', createdAt: '2026-01-06' },
  { id: 'u002', name: '周雨', email: 'zhouyu@example.com', department: '产品部', status: 'active', createdAt: '2026-01-12' },
  { id: 'u003', name: '陈默', email: 'chenmo@example.com', department: '设计部', status: 'inactive', createdAt: '2026-02-03' },
  { id: 'u004', name: '赵一鸣', email: 'zhaoyiming@example.com', department: '研发部', status: 'active', createdAt: '2026-02-18' },
  { id: 'u005', name: '孙可', email: 'sunke@example.com', department: '市场部', status: 'active', createdAt: '2026-03-02' },
  { id: 'u006', name: '吴桐', email: 'wutong@example.com', department: '运营部', status: 'inactive', createdAt: '2026-03-15' },
  { id: 'u007', name: '郑南', email: 'zhengnan@example.com', department: '研发部', status: 'active', createdAt: '2026-04-01' },
  { id: 'u008', name: '何静', email: 'hejing@example.com', department: '设计部', status: 'active', createdAt: '2026-04-22' },
  { id: 'u009', name: '马远', email: 'mayuan@example.com', department: '产品部', status: 'inactive', createdAt: '2026-05-09' },
  { id: 'u010', name: '顾言', email: 'guyan@example.com', department: '市场部', status: 'active', createdAt: '2026-06-11' },
  { id: 'u011', name: '许青', email: 'xuqing@example.com', department: '运营部', status: 'active', createdAt: '2026-07-07' },
  { id: 'u012', name: '沈舟', email: 'shenzhou@example.com', department: '研发部', status: 'inactive', createdAt: '2026-08-19' },
]

export const departments = ['研发部', '产品部', '设计部', '市场部', '运营部']

export const userStatuses = [
  { value: 'active', label: '启用' },
  { value: 'inactive', label: '停用' },
]
