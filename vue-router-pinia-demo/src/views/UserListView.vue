<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { ElMessage } from 'element-plus'
import { Plus, Star, StarFilled } from '@element-plus/icons-vue'
import PageHeader from '../components/common/PageHeader.vue'
import UserSearchForm from '../components/business/UserSearchForm.vue'
import UserFormDialog from '../components/business/UserFormDialog.vue'
import UserStatusTag from '../components/business/UserStatusTag.vue'
import { useUsersStore } from '../stores/users'
import { filterUsers, paginate } from '../utils/userQuery'

const PAGE_SIZES = [5, 10, 20]
const DEFAULT_PAGE_SIZE = 5

const route = useRoute()
const router = useRouter()
const usersStore = useUsersStore()
const { users, favoriteIds } = storeToRefs(usersStore)

// 路由 query 是筛选条件的唯一事实源，页面只负责把用户操作翻译成 query。
const filters = computed(() => readFilters(route.query))
const pageSize = computed(() => readPageSize(route.query.pageSize))
const filteredUsers = computed(() => filterUsers(users.value, filters.value))
const paged = computed(() => paginate(filteredUsers.value, route.query.page, pageSize.value))

// 搜索框的草稿与“已生效条件”分开，避免输入时频繁改写地址栏。
const searchDraft = ref(readFilters(route.query))
watch(
  () => route.query,
  (query) => {
    searchDraft.value = readFilters(query)
  },
)

const dialogVisible = ref(false)
const editingUser = ref(null)

function readFilters(query) {
  return {
    keyword: typeof query.keyword === 'string' ? query.keyword : '',
    // 只有合法状态才进入筛选，防止手改 URL 出现无效条件。
    status: ['active', 'inactive'].includes(query.status) ? query.status : '',
  }
}

function readPageSize(value) {
  const size = Number(value)
  return PAGE_SIZES.includes(size) ? size : DEFAULT_PAGE_SIZE
}

// 只把有值的条件写进 URL，保持地址干净、可读。
function toQuery({ keyword = '', status = '', page = 1, size = DEFAULT_PAGE_SIZE } = {}) {
  const query = {}
  if (keyword) query.keyword = keyword
  if (status) query.status = status
  if (size !== DEFAULT_PAGE_SIZE) query.pageSize = String(size)
  if (page > 1) query.page = String(page)
  return query
}

function handleSearch(value) {
  // 新条件必须回到第一页，否则会落在不存在的页码上。
  router.push({ name: 'users', query: toQuery({ ...value, page: 1, size: pageSize.value }) })
}

function handleReset() {
  router.push({ name: 'users', query: {} })
}

function handlePageChange(page) {
  router.push({
    name: 'users',
    query: toQuery({ ...filters.value, page, size: pageSize.value }),
  })
}

function handleSizeChange(size) {
  // 修改每页条数同样重置页码。
  router.push({ name: 'users', query: toQuery({ ...filters.value, page: 1, size }) })
}

function openCreate() {
  editingUser.value = null
  dialogVisible.value = true
}

function openEdit(user) {
  editingUser.value = user
  dialogVisible.value = true
}

function handleSubmit(payload) {
  if (editingUser.value) {
    usersStore.updateUser(editingUser.value.id, payload)
    ElMessage.success('用户信息已保存')
  } else {
    usersStore.addUser(payload)
    ElMessage.success('用户已新增')
  }
  dialogVisible.value = false
}

function toggleFavorite(user) {
  const willFavorite = !favoriteIds.value.includes(user.id)
  usersStore.toggleFavorite(user.id)
  ElMessage.success(willFavorite ? `已收藏 ${user.name}` : `已取消收藏 ${user.name}`)
}

function goDetail(user) {
  // 把当前列表完整地址带过去，详情页返回时可以恢复筛选和页码。
  router.push({
    name: 'user-detail',
    params: { id: user.id },
    query: { from: route.fullPath },
  })
}
</script>

<template>
  <div class="page">
    <PageHeader
      title="用户管理"
      description="搜索、分页与新增编辑都围绕同一份 Pinia 数据；筛选条件同步在 URL query 中。"
    >
      <template #actions>
        <el-button type="primary" :icon="Plus" @click="openCreate">新增用户</el-button>
      </template>
    </PageHeader>

    <section class="surface">
      <UserSearchForm
        v-model="searchDraft"
        @search="handleSearch"
        @reset="handleReset"
      />
    </section>

    <section class="surface">
      <el-table :data="paged.items" stripe row-key="id">
        <el-table-column prop="name" label="姓名" min-width="110" />
        <el-table-column prop="email" label="邮箱" min-width="200" />
        <el-table-column prop="department" label="部门" min-width="100" />
        <el-table-column label="状态" min-width="90">
          <template #default="{ row }">
            <UserStatusTag :status="row.status" />
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建日期" min-width="120" />
        <el-table-column label="操作" min-width="210" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="goDetail(row)">查看</el-button>
            <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
            <el-button
              link
              :type="favoriteIds.includes(row.id) ? 'warning' : 'primary'"
              :icon="favoriteIds.includes(row.id) ? StarFilled : Star"
              @click="toggleFavorite(row)"
            >
              {{ favoriteIds.includes(row.id) ? '取消收藏' : '收藏' }}
            </el-button>
          </template>
        </el-table-column>

        <template #empty>
          <el-empty description="没有找到匹配的用户">
            <el-button v-if="filters.keyword || filters.status" @click="handleReset">
              清空筛选
            </el-button>
          </el-empty>
        </template>
      </el-table>

      <div class="pagination-bar">
        <el-pagination
          :current-page="paged.page"
          :page-size="pageSize"
          :page-sizes="PAGE_SIZES"
          :total="filteredUsers.length"
          layout="total, sizes, prev, pager, next"
          background
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </section>

    <p class="muted param-note">
      当前路由是 <code>/users</code>，筛选条件放在 query（如 <code>?keyword=...</code>）；
      详情页使用动态参数 <code>/users/:id</code>。两者都可以从 <code>useRoute()</code> 读取。
    </p>

    <UserFormDialog
      v-model="dialogVisible"
      :user="editingUser"
      @submit="handleSubmit"
    />
  </div>
</template>

<style scoped>
.pagination-bar {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
  overflow-x: auto;
}

.param-note {
  margin: 0;
  font-size: 13px;
}

code {
  padding: 1px 5px;
  background: #eef2f7;
  border-radius: 4px;
  font-size: 12px;
}
</style>
