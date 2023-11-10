<script setup>
import { useRoute } from 'vue-router'
import { ref } from 'vue'
import RoomList from '../components/RoomList.vue'
import { getPlatformName } from '../utils/index.js'

const route = useRoute()
const platform = route.query.platform

const title = platform.toLowerCase()

const recommendLiveData = ref([])
const areas = ref([])
const currPage = ref(1)
const currSize = ref(20)

async function getAreasDataByPlatform() {
  // const res1 = await fetch(`http://live.yj1211.work/api/live/getRecommendByPlatform?platform=${platform}&page=${currPage.value}&size=${currSize.value}`)
  const res2 = await fetch(`http://live.yj1211.work/api/live/getAreas?platform=${platform}`)
  // const data1 = await res1.json()
  const data2 = await res2.json()
  // recommendLiveData.value = data1.data
  areas.value = data2.data
  areas.value.unshift([
    {
      platform,
      typeName: '全部',
    },
  ])
}

const areaName = ref('')

async function getAllLiveData() {
  const res = await fetch(`http://live.yj1211.work/api/live/getRecommendByPlatform?platform=${platform}&page=${currPage.value}&size=${currSize.value}`)
  const data = await res.json()
  return data.data
}

async function getAreaLiveData() {
  const res = await fetch(`http://live.yj1211.work/api/live/getRecommendByPlatformArea?platform=${platform}&area=${areaName.value}&page=${currPage.value}&size=20`)
  const data = await res.json()
  return data.data
}

async function getLiveData(data) {
  recommendLiveData.value = []
  currPage.value = 1
  areaName.value = data?.areaName || 'all'
  if (areaName.value === 'all') {
    const res = await getAllLiveData()
    recommendLiveData.value = res
  }
  else {
    const res = await getAreaLiveData()
    recommendLiveData.value = res
  }
}

const hasMore = ref(true)

const loading = ref(false)
async function loadMore() {
  currPage.value++
  let res
  loading.value = true
  if (areaName.value === 'all')
    res = await getAllLiveData()
  else
    res = await getAreaLiveData()
  res.length === 0 ? hasMore.value = false : hasMore.value = true
  recommendLiveData.value = [...recommendLiveData.value, ...res]

  loading.value = false
}

getAreasDataByPlatform()
getLiveData()
</script>

<template>
  <RoomList :title="getPlatformName(title)" :live-data="recommendLiveData" :areas="areas" :loading="loading" :has-more="hasMore" @load-more="loadMore" @get-area-data="getLiveData" />
</template>
