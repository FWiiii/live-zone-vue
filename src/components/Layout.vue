<script setup>
import { computed } from 'vue'
import { useLayoutStore } from '../store/layoutStore'
import { useUserStore } from '../store/userStore'
import LayoutHeader from './LayoutHeader.vue'
import Login from './Login.vue'
import Register from './Register.vue'

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
          <router-link to="/recommend" decoration-none>
            <el-menu-item index="1">
              推荐
            </el-menu-item>
          </router-link>

          <router-link to="/follow" decoration-none>
            <el-menu-item index="2">
              关注
            </el-menu-item>
          </router-link>

          <router-link to="/platforms" decoration-none>
            <el-menu-item index="3">
              平台
            </el-menu-item>
          </router-link>
          <router-link to="/areas" decoration-none>
            <el-menu-item index="4">
              分区
            </el-menu-item>
          </router-link>
        </el-menu>
      </el-aside>
      <el-main class="m-0! p-0!">
        <router-view :key="$route.name + ($route.query.id || '') + ($route.query.platform || '')" />
      </el-main>
    </el-container>
  </el-container>
  <Login v-if="userStore.showLoginDialog" />
  <!-- <Register v-if="true" /> -->
</template>
