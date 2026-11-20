<script setup>
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { ElMessage } from 'element-plus'
import { StarFilled } from '@element-plus/icons-vue'
import PageHeader from '../components/common/PageHeader.vue'
import UserStatusTag from '../components/business/UserStatusTag.vue'
import { useUsersStore } from '../stores/users'

const router = useRouter()
const usersStore = useUsersStore()
// favoriteUsers 是 getter：由收藏 ID 和用户列表派生，不是独立的用户副本。
const { favoriteUsers, favoriteCount } = storeToRefs(usersStore)

function removeFavorite(user) {
  usersStore.toggleFavorite(user.id)
  ElMessage.success(`已取消收藏 ${user.name}`)
}

function goDetail(user) {
  router.push({
    name: 'user-detail',
    params: { id: user.id },
    query: { from: '/favorites' },
  })
}
</script>

<template>
  <div class="page">
    <PageHeader
      title="收藏用户"
      :description="`共 ${favoriteCount} 位收藏用户。这里的数据由收藏 ID 和用户列表实时派生。`"
    />

    <section v-if="favoriteUsers.length" class="surface">
      <el-table :data="favoriteUsers" stripe row-key="id">
        <el-table-column prop="name" label="姓名" min-width="110" />
        <el-table-column prop="email" label="邮箱" min-width="200" />
        <el-table-column prop="department" label="部门" min-width="100" />
        <el-table-column label="状态" min-width="90">
          <template #default="{ row }">
            <UserStatusTag :status="row.status" />
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="190" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="goDetail(row)">查看</el-button>
            <el-button
              link
              type="warning"
              :icon="StarFilled"
              @click="removeFavorite(row)"
            >
              取消收藏
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </section>

    <section v-else class="surface">
      <el-empty description="还没有收藏任何用户">
        <el-button type="primary" @click="router.push({ name: 'users' })">
          前往用户管理
        </el-button>
      </el-empty>
    </section>

    <p class="muted">
      提示：去用户管理编辑一位已收藏的用户，再回到本页，会看到姓名、部门等信息同步更新。
    </p>
  </div>
</template>

<style scoped>
p {
  margin: 0;
  font-size: 13px;
}
</style>
