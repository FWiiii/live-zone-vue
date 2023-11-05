<script setup>
import { useLayoutStore } from '../store/layoutStore'
import { useUserStore } from '../store/userStore'

const layoutStore = useLayoutStore()
const userStore = useUserStore()

const direClass = computed(() => {
  return !layoutStore.showAside ? 'vertical' : ''
})
</script>

<template>
  <el-container direction="vertical" h-full of-hidden>
    <LayoutHeader />
    <el-container :direction="direClass" :class="[!layoutStore.showAside ? 'h-full of-hidden' : '']">
      <el-aside v-if="layoutStore.showAside" width="200px">
        <el-menu>
          <router-link to="/recommend">
            <el-menu-item index="1">
              推荐
            </el-menu-item>
          </router-link>

          <el-menu-item index="2">
            <span>关注</span>
          </el-menu-item>

          <router-link to="/platforms">
            <el-menu-item index="3">
              平台
            </el-menu-item>
          </router-link>

          <el-menu-item index="4">
            <span>分区</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main class="m-0! p-0!">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
  <Login v-if="userStore.showLoginDialog" />
</template>
