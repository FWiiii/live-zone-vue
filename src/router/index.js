import { createRouter, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useLayoutStore } from '../store/layoutStore'
import { useUserStore } from '../store/userStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'index',
      component: () => import('../components/Layout.vue'),
      redirect: '/recommend',
      children: [
        {
          path: '/recommend',
          name: 'recommend',
          component: () => import('../views/Recommend.vue'),
        },
        {
          path: '/platforms',
          name: 'platforms',
          component: () => import('../views/Platforms.vue'),
        },
        {
          path: '/platform',
          name: 'platform',
          component: () => import('../views/Platform.vue'),
        },
        {
          path: '/search',
          name: 'search',
          component: () => import('../views/Search.vue'),
        },
        {
          path: '/live',
          name: 'live',
          component: () => import('../views/LiveRoom.vue'),
        },
        {
          path: '/follow',
          name: 'follow',
          component: () => import('../views/Follow.vue'),
        },
        {
          path: '/areas',
          name: 'areas',
          component: () => import('../views/Areas.vue'),
        },
        {
          path: '/area',
          name: 'area',
          component: () => import('../views/AreaRecommend.vue'),
        },
      ],
    },

  ],
})

router.beforeEach((to, from, next) => {
  const layoutStore = useLayoutStore()
  const userStore = useUserStore()
  if (to.path === '/search') {
    if (!userStore.userInfo?.uid) {
      ElMessage.error('请先登录')
      next({ path: from.path })
    }
    else {
      layoutStore.showAside = false
      next()
    }
  }
  else if (to.path === '/live') {
    layoutStore.showAside = false
    next()
  }
  else {
    layoutStore.showAside = true
    next()
  }
})

export default router
