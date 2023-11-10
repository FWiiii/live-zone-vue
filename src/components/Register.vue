<script setup>
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { md5 } from 'js-md5'
import { useUserStore } from '../store/userStore'

const userStore = useUserStore()

const model = reactive({
  username: '',
  password: '',
  nickname: '',
  rePassword: '',
  email: '',
})
const loading = ref(false)
const rules = reactive({
  username: [
    {
      required: true,
      message: '用户名不能为空',
      trigger: 'blur',
    },
    {
      min: 3,
      max: 16,
      message: '用户名长度在3-16个字符之间',
      trigger: 'blur',
    },
  ],
  nickname: [
    {
      required: true,
      message: '昵称不能为空',
      trigger: 'blur',
    },
    {
      min: 3,
      max: 16,
      message: '昵称长度在3-16个字符之间',
      trigger: 'blur',
    },
  ],
  password: [
    { required: true, message: 'Password is required', trigger: 'blur' },
    {
      min: 5,
      message: 'Password length should be at least 5 characters',
      trigger: 'blur',
    },
  ],
})

const form = ref(null)

async function simulateLogin() {
  const formdata = new FormData()
  formdata.append('username', model.username)
  formdata.append('password', md5(model.password))
  const res = await fetch('http://live.yj1211.work/api/login', {
    method: 'POST',
    body: formdata,
  })
  const data = await res.json()
  return data
}
async function login() {
  const valid = await form.value.validate()
  if (!valid)
    return

  loading.value = true
  const data = await simulateLogin()
  loading.value = false
  if (data.code === 200) {
    ElMessage({
      message: '登陆成功',
      type: 'success',
    })
    userStore.login(data.data)
    userStore.showLoginDialog = false
  }
  else {
    ElMessage.error(data.message)
  }
}
</script>

<template>
  <div class="bg-black/20" z-99 absolute top-0 left-0 right-0 bottom-0 m-auto />
  <div z-100 h-135 w-100 absolute top-0 left-0 right-0 bottom-0 m-auto>
    <el-card h-full w-full px-8 box-border>
      <div mb-4 flex justify-between items-center mt-4>
        <span>注册</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 32 32" @click="userStore.showLoginDialog = false">
          <path fill="currentColor" d="M16 2C8.2 2 2 8.2 2 16s6.2 14 14 14s14-6.2 14-14S23.8 2 16 2zm0 26C9.4 28 4 22.6 4 16S9.4 4 16 4s12 5.4 12 12s-5.4 12-12 12z" /><path fill="currentColor" d="M21.4 23L16 17.6L10.6 23L9 21.4l5.4-5.4L9 10.6L10.6 9l5.4 5.4L21.4 9l1.6 1.6l-5.4 5.4l5.4 5.4z" />
        </svg>
      </div>
      <el-form
        ref="form"
        :model="model"
        :rules="rules"
        label-position="top"
        style="width:100%"
        @submit.native.prevent="login"
      >
        <el-form-item prop="username" label="用户名">
          <el-input v-model="model.username" placeholder="Username" />
        </el-form-item>
        <el-form-item prop="nickname" label="昵称">
          <el-input v-model="model.nickname" placeholder="Nickname" />
        </el-form-item>
        <el-form-item prop="password" label="密码">
          <el-input
            v-model="model.password"
            placeholder="Password"
            type="password"
          />
        </el-form-item>
        <el-form-item prop="rePassword" label="确认密码">
          <el-input
            v-model="model.rePassword"
            placeholder="Password"
            type="password"
          />
        </el-form-item>
        <el-form-item prop="email" label="邮箱">
          <el-input v-model="model.email" placeholder="Email" />
        </el-form-item>
        <el-form-item>
          <el-button
            :loading="loading"
            type="primary"
            native-type="submit"
            block
          >
            注册
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>
