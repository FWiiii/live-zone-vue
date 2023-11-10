<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import RoomList from '../components/RoomList.vue'

const route = useRoute()
const recommendLiveData = ref([])
const typeName = route.query.typeName
const areaName = route.query.areaName

const currPage = ref(1)
// const currSize = ref(20)

async function getRecommendLiveData() {
  const res = await fetch(`
http://live.yj1211.work/api/live/getRecommendByAreaAll?areaType=${typeName}&area=${areaName}&page=${currPage.value}`)
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
  <RoomList :title="areaName" :live-data="recommendLiveData" :loading="loading" @load-more="loadMore" />
</template>
