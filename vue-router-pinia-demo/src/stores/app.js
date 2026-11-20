import { ref } from 'vue'
import { defineStore } from 'pinia'

// 只保存跨布局组件共享的 UI 状态：侧栏是否折叠。
export const useAppStore = defineStore('app', () => {
  const collapsed = ref(false)

  function toggleSidebar() {
    collapsed.value = !collapsed.value
  }

  function setSidebarCollapsed(value) {
    collapsed.value = Boolean(value)
  }

  return { collapsed, toggleSidebar, setSidebarCollapsed }
})
