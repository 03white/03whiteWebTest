<script setup>
import { computed, nextTick, reactive, ref, watch } from 'vue'
import { departments, userStatuses } from '../../data/users'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  user: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue', 'submit'])

const formRef = ref(null)

// 本地草稿：新增用空值，编辑从传入用户复制，取消时不会污染 store。
const form = reactive({
  name: '',
  email: '',
  department: '',
  status: 'active',
})

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const isEdit = computed(() => Boolean(props.user?.id))

const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: ['blur', 'change'] },
  ],
  department: [{ required: true, message: '请选择部门', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
}

function resetForm() {
  form.name = props.user?.name || ''
  form.email = props.user?.email || ''
  form.department = props.user?.department || ''
  form.status = props.user?.status || 'active'
  // 下一次打开时清掉上一次留下的红色校验提示。
  nextTick(() => formRef.value?.clearValidate())
}

// 每次打开都重置，保证“取消后重新打开”看到的是正确初始值。
watch(
  () => props.modelValue,
  (open) => {
    if (open) resetForm()
  },
)

watch(
  () => props.user,
  () => {
    if (props.modelValue) resetForm()
  },
)

function handleConfirm() {
  formRef.value?.validate((valid) => {
    if (!valid) return

    // 提交时去掉首尾空格，校验通过后才把数据交给父组件。
    emit('submit', {
      name: form.name.trim(),
      email: form.email.trim(),
      department: form.department,
      status: form.status,
    })
  })
}
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑用户' : '新增用户'"
    width="480px"
    @closed="formRef?.clearValidate()"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="72px">
      <el-form-item label="姓名" prop="name">
        <el-input v-model="form.name" maxlength="20" placeholder="请输入姓名" />
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="form.email" placeholder="name@example.com" />
      </el-form-item>
      <el-form-item label="部门" prop="department">
        <el-select v-model="form.department" placeholder="请选择部门" style="width: 100%">
          <el-option v-for="item in departments" :key="item" :label="item" :value="item" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="form.status">
          <el-radio v-for="item in userStatuses" :key="item.value" :value="item.value">
            {{ item.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleConfirm">保存</el-button>
    </template>
  </el-dialog>
</template>
