import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  const showLoginDialog = ref(false)
  const userInfo = ref({})
  const isLogin = ref(false)

  function login(data) {
    userInfo.value = data
    isLogin.value = true
  }

  function logout() {
    userInfo.value = {}
    isLogin.value = false
  }

  return { showLoginDialog, userInfo, isLogin, login, logout }
}, {
  persist: true,
})
