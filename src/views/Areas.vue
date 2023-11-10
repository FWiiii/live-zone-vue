<script setup>
import { onMounted, ref } from 'vue'
import AreaCard from '../components/AreaCard.vue'

const areas = ref([])
const areasData = ref([])
async function getAllAreas() {
  const res = await fetch('http://live.yj1211.work/api/live/getAllAreas')
  const data = await res.json()
  areasData.value = data.data
}

function getAreaData(index) {
  areas.value = areasData.value[index]
}

onMounted(async () => {
  await getAllAreas()
  getAreaData(0)
})
</script>

<template>
  <div h-645px>
    <el-scrollbar height="100%">
      <div font-700 text-2xl mt-2 pl-18>
        分区列表
      </div>
      <div h-10 flex items-center pl-18>
        <span v-for="areaName, index in areasData" :key="index" hover:text-blue-300 cursor-pointer mr-4 @click="getAreaData(index)">{{ areaName[0].typeName }}</span>
      </div>
      <div flex flex-wrap gap-5 items-center pl-18>
        <template v-for="area in areas" :key="area.id">
          <AreaCard :area="area" />
        </template>
      </div>
    </el-scrollbar>
  </div>
</template>
