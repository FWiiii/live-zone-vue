<script setup>
import { nummberFormat, stringFormat } from '../utils/index'

const props = defineProps({
  room: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <router-link :to="{ path: '/live', query: { id: props.room.roomId, platform: props.room.platForm } }" decoration-none>
    <el-card :body-style="{ padding: '0px' }" w-70>
      <div relative>
        <img
          h-40
          w-full
          object-cover
          :src="room.roomPic"
          class="image"
        >
        <div absolute top-35 left-2 rounded op-70 bg-black text-white px-2 text-xs>
          🔥{{ nummberFormat(props.room.online) }}
        </div>
      </div>

      <div flex items-center gap-2 p-2>
        <img h-10 w-10 rounded-full :src="room.ownerHeadPic" alt="">
        <div flex flex-col text-xs>
          <span font-bold>{{ stringFormat(props.room.roomName, 25) }}</span>
          <span op-70>{{ props.room.ownerName }}</span>
          <span op-70>{{ props.room.categoryName }}</span>
        </div>
      </div>
    </el-card>
  </router-link>
</template>
