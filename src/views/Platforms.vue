<script setup>
import { ref } from 'vue'

const platforms = ref([])
async function getAllPlatform() {
  const res = await fetch('http://live.yj1211.work/api/live/getAllSupportPlatforms')
  const data = await res.json()
  platforms.value = data.data.platformList
}

getAllPlatform()
</script>

<template>
  <div pt-10 px-30>
    <el-row :gutter="24" flex justify-between>
      <el-col v-for="pf in platforms" :key="pf.code" :span="10">
        <router-link :to="{ path: '/platform', query: { platform: pf.code } }" decoration-none>
          <el-card mb-6>
            <div flex flex-col items-center gap-8>
              <img h-20 w-20 rounded-full :src="pf.logoImage" alt="">
              <span>{{ pf.name }}</span>
            </div>
          </el-card>
        </router-link>
      </el-col>
    </el-row>
  </div>
</template>
