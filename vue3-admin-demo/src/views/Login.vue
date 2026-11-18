<template>
  <div class="login-page">
    <el-card class="login-card">
      <h2 class="title">Vue3 Admin 登录</h2>
      <el-form :model="form" label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="form.role" placeholder="请选择角色">
            <el-option label="管理员 (admin)" value="admin" />
            <el-option label="普通用户 (user)" value="user" />
          </el-select>
        </el-form-item>
        <el-button type="primary" class="login-btn" @click="handleLogin">登录</el-button>
      </el-form>
      <p class="tip">演示权限：admin 能看到全部菜单；user 看不到「系统管理」</p>
    </el-card>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../store/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const form = reactive({ username: '', role: '' })

const handleLogin = () => {
  if (!form.username) return ElMessage.warning('请输入用户名')
  if (!form.role) return ElMessage.warning('请选择角色')
  userStore.login({ username: form.username, role: form.role })
  ElMessage.success('登录成功')
  // 回跳到登录前想访问的页面，没有则回首页
  router.push(route.query.redirect || '/home')
}
</script>

<style scoped>
.login-page {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f2f5;
}
.login-card {
  width: 400px;
}
.title {
  text-align: center;
  margin-bottom: 20px;
}
.login-btn {
  width: 100%;
}
.tip {
  margin-top: 15px;
  font-size: 12px;
  color: #999;
}
</style>
