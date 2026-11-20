<script setup>
import { ref } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import PageHeader from '../components/common/PageHeader.vue'
import UserStatusTag from '../components/business/UserStatusTag.vue'
import UserSearchForm from '../components/business/UserSearchForm.vue'
import UserFormDialog from '../components/business/UserFormDialog.vue'

const pageHeaderCode = `<PageHeader title="页面标题" description="一句话说明">
  <template #actions>
    <el-button type="primary">页面操作</el-button>
  </template>
</PageHeader>`

const statusTagCode = `<UserStatusTag status="active" />
<UserStatusTag status="inactive" />
<UserStatusTag status="other" />`

const searchFormCode = `<UserSearchForm
  v-model="conditions"
  @search="handleSearch"
  @reset="handleReset"
/>`

const formDialogCode = `<UserFormDialog
  v-model="visible"
  :user="editingUser"
  @submit="handleSubmit"
/>`

// 组件示例使用独立的局部数据，确保体验组件时不会改动用户管理里的正式数据。
const demoConditions = ref({ keyword: '', status: '' })
const lastSearch = ref('尚未查询')
const lastResetAt = ref('')

function handleDemoSearch(value) {
  lastSearch.value = `关键词：${value.keyword || '（空）'}，状态：${value.status || '全部'}`
  lastResetAt.value = ''
}

function handleDemoReset() {
  lastSearch.value = '已重置：关键词为空，状态为全部'
  lastResetAt.value = new Date().toLocaleTimeString()
}

const demoUsers = ref([
  { id: 'demo-1', name: '示例用户甲', email: 'demo-a@example.com', department: '研发部', status: 'active', createdAt: '2026-09-01' },
  { id: 'demo-2', name: '示例用户乙', email: 'demo-b@example.com', department: '设计部', status: 'inactive', createdAt: '2026-09-02' },
])
const demoDialogVisible = ref(false)
const demoEditingUser = ref(null)
const demoSubmitCount = ref(0)

function openDemoCreate() {
  demoEditingUser.value = null
  demoDialogVisible.value = true
}

function openDemoEdit(user) {
  demoEditingUser.value = user
  demoDialogVisible.value = true
}

function handleDemoSubmit(payload) {
  if (demoEditingUser.value) {
    Object.assign(demoEditingUser.value, payload)
  } else {
    demoUsers.value.push({
      id: `demo-${demoUsers.value.length + 1}-${Date.now()}`,
      ...payload,
      createdAt: new Date().toISOString().slice(0, 10),
    })
  }
  demoSubmitCount.value += 1
  demoDialogVisible.value = false
}
</script>

<template>
  <div class="page">
    <PageHeader
      title="组件示例"
      description="四个业务组件都在这里独立体验：观察它们的输入、输出，以及它们不负责什么。"
    />

    <section class="surface">
      <h2 class="section-title">1. PageHeader</h2>
      <p class="muted">纯展示组件，页面通过 actions 插槽注入操作按钮。</p>
      <pre class="code-block"><code>{{ pageHeaderCode }}</code></pre>
      <div class="demo-box">
        <PageHeader title="示例页面标题" description="这段描述和右侧按钮都来自页面，而不是组件内部。">
          <template #actions>
            <el-button type="primary" size="small">页面操作</el-button>
          </template>
        </PageHeader>
      </div>
    </section>

    <section class="surface">
      <h2 class="section-title">2. UserStatusTag</h2>
      <p class="muted">业务状态到标签样式的映射集中在一处，未知值显示为中性提示。</p>
      <pre class="code-block"><code>{{ statusTagCode }}</code></pre>
      <div class="demo-box demo-row">
        <UserStatusTag status="active" />
        <UserStatusTag status="inactive" />
        <UserStatusTag status="pending" />
      </div>
    </section>

    <section class="surface">
      <h2 class="section-title">3. UserSearchForm</h2>
      <p class="muted">
        通过 v-model 传条件对象，通过 search / reset 事件把“用户想查询”告诉页面。组件不筛数据。
      </p>
      <pre class="code-block"><code>{{ searchFormCode }}</code></pre>
      <div class="demo-box">
        <UserSearchForm
          v-model="demoConditions"
          @search="handleDemoSearch"
          @reset="handleDemoReset"
        />
        <div class="demo-result">
          <span>最近一次事件：{{ lastSearch }}</span>
          <span v-if="lastResetAt" class="muted">（{{ lastResetAt }}）</span>
          <span class="muted">当前 v-model：{{ demoConditions }}</span>
        </div>
      </div>
    </section>

    <section class="surface">
      <h2 class="section-title">4. UserFormDialog</h2>
      <p class="muted">
        弹窗内部维护草稿并做表单校验，提交时只发出 submit 事件；示例数据与用户管理完全隔离。
      </p>
      <pre class="code-block"><code>{{ formDialogCode }}</code></pre>
      <div class="demo-box">
        <div class="toolbar">
          <el-button type="primary" :icon="Plus" @click="openDemoCreate">新增示例用户</el-button>
          <span class="muted">已提交 {{ demoSubmitCount }} 次</span>
        </div>

        <el-table :data="demoUsers" stripe size="small">
          <el-table-column prop="name" label="姓名" min-width="110" />
          <el-table-column prop="email" label="邮箱" min-width="180" />
          <el-table-column prop="department" label="部门" min-width="90" />
          <el-table-column label="状态" min-width="90">
            <template #default="{ row }">
              <UserStatusTag :status="row.status" />
            </template>
          </el-table-column>
          <el-table-column label="操作" min-width="80">
            <template #default="{ row }">
              <el-button link type="primary" @click="openDemoEdit(row)">编辑</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </section>

    <UserFormDialog
      v-model="demoDialogVisible"
      :user="demoEditingUser"
      @submit="handleDemoSubmit"
    />
  </div>
</template>

<style scoped>
.demo-box {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 14px;
  padding: 16px;
  background: #f8fafc;
  border: 1px dashed var(--border);
  border-radius: 8px;
}

.demo-row {
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
}

.demo-result {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  color: var(--text-regular);
  font-size: 13px;
}
</style>
