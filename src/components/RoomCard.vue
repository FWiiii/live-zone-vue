<script setup>
import { getPlatformName, nummberFormat, stringFormat } from '../utils/index'

const props = defineProps({
  room: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <router-link :to="{ path: '/live', query: { id: props.room.roomId, platform: props.room.platForm } }" decoration-none>
    <el-card :body-style="{ padding: '0px' }" w-70 hover:scale-110 transition="all 0.2s">
      <div relative>
        <img
          v-lazy="props.room.roomPic"
          h-40
          w-full
          object-cover
        >
        <div absolute top-35 left-2 rounded op-70 bg-black text-white px-2 text-xs>
          🔥{{ nummberFormat(props.room.online) }}
        </div>
      </div>

      <div flex items-center gap-2 p-2>
        <img v-lazy="room.ownerHeadPic" h-10 w-10 rounded-full alt="">
        <div flex flex-col text-xs>
          <span font-bold>{{ stringFormat(props.room.roomName, 15) }}</span>
          <span op-70>{{ props.room.ownerName }}</span>
          <span op-70>  {{ `${getPlatformName(props.room.platForm)} ${props.room.categoryName}` }}</span>
        </div>
      </div>
    </el-card>
  </router-link>
</template>
