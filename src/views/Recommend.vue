<script setup>
const recommendLiveData = ref([])
const title = '首页推荐'

const currPage = ref(1)
const currSize = ref(20)
async function getRecommendLiveData() {
  const res = await fetch(`http://live.yj1211.work/api/live/getRecommend?page=${currPage.value}&size=${currSize.value}`)
  const data = await res.json()
  recommendLiveData.value = [...recommendLiveData.value, ...data.data]
  currPage.value++
}
getRecommendLiveData()

const loading = ref(false)
async function loadMore() {
  loading.value = true
  await getRecommendLiveData()
  loading.value = false
}
</script>

<template>
  <RoomList :title="title" :live-data="recommendLiveData" :loading="loading" @load-more="loadMore" />
</template>
