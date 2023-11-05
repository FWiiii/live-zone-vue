<script setup>
const route = useRoute()
const platform = route.query.platform

const title = platform.toUpperCase()

const recommendLiveData = ref([])
const areas = ref([])
const currPage = ref(1)
const currSize = ref(20)

async function getInitData() {
  const p1 = fetch(`http://live.yj1211.work/api/live/getRecommendByPlatform?platform=${platform}&page=${currPage.value}&size=${currSize.value}`).then(res => res.json())
  const p2 = fetch(`http://live.yj1211.work/api/live/getAreas?platform=${platform}`).then(res => res.json())
  const [res1, res2] = await Promise.all([p1, p2])
  recommendLiveData.value = res1.data
  areas.value = res2.data
  areas.value.unshift([
    {
      platform,
      typeName: '全部',
    },
  ])
}

const areaName = ref('all')

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
  areaName.value = data.areaName
  if (data.areaName === 'all') {
    areaName.value = 'all'
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

  recommendLiveData.value = [...recommendLiveData.value, ...res]
  loading.value = false
}

getInitData()
</script>

<template>
  <RoomList :title="title" :live-data="recommendLiveData" :areas="areas" :loading="loading" @load-more="loadMore" @get-area-data="getLiveData" />
</template>
