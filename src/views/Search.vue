<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { stringFormat } from '../utils/index'
import { useUserStore } from '../store/userStore'

const route = useRoute()
const userStore = useUserStore()

const searchData = ref([])
async function getSearchData() {
  const q = route.query.q
  const platform = route.query.platform
  const res = await fetch(`http://live.yj1211.work/api/live/search?platform=${platform}&keyWords=${q}&uid=${userStore.userInfo.uid}`)
  const data = await res.json()
  searchData.value = data.data
}

watch(() => route.fullPath, () => {
  getSearchData()
}, { immediate: true })
</script>

<template>
  <div p-8>
    <el-row :gutter="5">
      <el-col v-for="item in searchData" :key="item.roomId" :span="6" mb-8>
        <router-link
          :to="{ path: '/live', query: { id: item.roomId, platform: item.platform } }"
          decoration-none text-inherit
        >
          <div
            hover:scale-105 duration-300 w-55 cursor-pointer flex items-center p-4 border-1 border-solid border-gray-300 rounded-lg
          >
            <img :src="item.headPic" alt="" h-15 w-15 mr-6 rounded-full>
            <div flex flex-col text-xs gap-1>
              <div>{{ item.platform }} · {{ stringFormat(item.nickName, 7) }}</div>
              <div>分区：{{ item.cateName }}</div>
              <div rounded>
                <span rounded p-0.5 :class="[+item.isLive ? 'bg-red/50' : 'bg-gray/50']">{{ +item.isLive ? '直播中' : '未开播' }}</span>
              </div>
              <div>粉丝：{{ item.followers }}人</div>
            </div>
          </div>
        </router-link>
      </el-col>
    </el-row>
  </div>
</template>
