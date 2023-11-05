<script setup>
import { ElMessage } from 'element-plus'
import { md5 } from 'js-md5'
import { useUserStore } from '../store/userStore'

const userStore = useUserStore()

const model = reactive({
  username: '',
  password: '',
})
const loading = ref(false)
const rules = reactive({
  username: [
    {
      required: true,
      message: 'Username is required',
      trigger: 'blur',
    },
    {
      min: 4,
      message: 'Username length should be at least 5 characters',
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
  <div z-100 h-70 w-100 absolute top-0 left-0 right-0 bottom-0 m-auto>
    <el-card h-full w-full>
      <div mb-4 flex justify-between items-center ps-2>
        <span>登录</span>
        <span @click="userStore.showLoginDialog = false">x</span>
      </div>
      <el-form
        ref="form"
        :model="model"
        :rules="rules"
        @submit.native.prevent="login"
      >
        <el-form-item prop="username">
          <el-input v-model="model.username" placeholder="Username" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="model.password"
            placeholder="Password"
            type="password"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            :loading="loading"
            type="primary"
            native-type="submit"
            block
          >
            Login
          </el-button>
        </el-form-item>
        <span text-xs mr-8>忘记密码?</span>
        <span text-xs>注册</span>
      </el-form>
    </el-card>
  </div>
</template>
