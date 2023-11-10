<script setup>
import { onMounted, ref } from 'vue'
import RoomList from '../components/RoomList.vue'
import { useUserStore } from '../store/userStore'

const userStore = useUserStore()
const followData = ref([])
const LiveData = ref([])
const title = '我的关注'
const areas = [
  [{
    platform: 'none',
    typeName: '直播中',
  }],
  [{
    platform: 'none',
    typeName: '未开播',
  }],
]
const uid = userStore.userInfo.uid

async function getFollowData() {
  const res = await fetch(`http://live.yj1211.work/api/live/getRoomsOn?uid=${uid}`)
  const data = await res.json()
  LiveData.value = data.data.filter(item => item.roomId !== null)
}

async function getLiveData(data) {
  if (data.areaName === 'live')
    followData.value = LiveData.value.filter(item => item.isLive)
  else
    followData.value = LiveData.value.filter(item => !item.isLive)
}

const hasMore = ref(false)

onMounted(async () => {
  await getFollowData()
  await getLiveData({ areaName: 'live', platform: 'none' })
})
</script>

<template>
  <RoomList v-if="userStore.isLogin" :live-data="followData" :has-more="hasMore" :title="title" :areas="areas" @get-area-data="getLiveData" />
  <div flex justify-center items-center h-full>
    <span v-if="!userStore.isLogin">请先登录</span>
  </div>
</template>
