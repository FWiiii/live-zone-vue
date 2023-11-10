<script setup>
const props = defineProps({
  area: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <!-- <router-link decoration-none> -->
  <div mr-6>
    <router-link :to="{ path: '/area', query: { typeName: props.area.typeName, areaName: props.area.areaName } }" decoration-none>
      <el-card :body-style="{ padding: '0px' }" hover:scale-110 transition="all 0.2s">
        <img
          v-lazy="props.area.areaPic"
          h-50
          w-50
          object-cover
        >
      </el-card>
    </router-link>
    <div text-center mt-2>
      {{ props.area.areaName }}
    </div>
  </div>
  <!-- </router-link> -->
</template>
