<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Star, StarFilled } from '@element-plus/icons-vue'
import PageHeader from '../components/common/PageHeader.vue'
import UserStatusTag from '../components/business/UserStatusTag.vue'
import { useUsersStore } from '../stores/users'

const route = useRoute()
const router = useRouter()
const usersStore = useUsersStore()
const { users, favoriteIds } = storeToRefs(usersStore)

// useRoute 读取当前地址：params.id 来自 /users/:id。
const userId = computed(() => String(route.params.id))
const user = computed(() => users.value.find((item) => item.id === userId.value) || null)
const isFavorite = computed(() => favoriteIds.value.includes(userId.value))

function toggleFavorite() {
  if (!user.value) return
  const willFavorite = !isFavorite.value
  usersStore.toggleFavorite(user.value.id)
  ElMessage.success(willFavorite ? '已加入收藏' : '已取消收藏')
}

function goBack() {
  // 只接受站内列表来源，避免把用户手动拼的 query 当成任意跳转地址。
  const from = route.query.from
  if (typeof from === 'string' && from.startsWith('/users')) {
    router.push(from)
    return
  }
  router.push({ name: 'users' })
}
</script>

<template>
  <div class="page">
    <PageHeader
      :title="user ? `${user.name} 的用户详情` : '用户详情'"
      description="useRoute() 负责读取动态参数，useRouter() 负责发起跳转。"
    >
      <template #actions>
        <el-button :icon="ArrowLeft" @click="goBack">返回列表</el-button>
        <el-button
          v-if="user"
          :type="isFavorite ? 'warning' : 'primary'"
          :icon="isFavorite ? StarFilled : Star"
          @click="toggleFavorite"
        >
          {{ isFavorite ? '取消收藏' : '收藏用户' }}
        </el-button>
      </template>
    </PageHeader>

    <template v-if="user">
      <section class="surface">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="用户 ID">{{ user.id }}</el-descriptions-item>
          <el-descriptions-item label="姓名">{{ user.name }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ user.email }}</el-descriptions-item>
          <el-descriptions-item label="部门">{{ user.department }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <UserStatusTag :status="user.status" />
          </el-descriptions-item>
          <el-descriptions-item label="创建日期">{{ user.createdAt }}</el-descriptions-item>
        </el-descriptions>
      </section>

      <section class="surface">
        <h2 class="section-title">这一页用到了什么</h2>
        <ul class="muted tips">
          <li><code>route.params.id</code> 是路径的一部分，用来定位唯一用户。</li>
          <li><code>route.query.from</code> 记录来源列表地址，用来恢复筛选和页码。</li>
          <li>用户对象来自 store，收藏状态变化后这里会自动重新计算。</li>
        </ul>
      </section>
    </template>

    <section v-else class="surface">
      <el-empty description="用户不存在">
        <el-button type="primary" @click="goBack">返回用户列表</el-button>
      </el-empty>
    </section>
  </div>
</template>

<style scoped>
.tips {
  margin: 0;
  padding-left: 20px;
  line-height: 2;
}

code {
  padding: 1px 5px;
  background: #eef2f7;
  border-radius: 4px;
  font-size: 12px;
}
</style>
