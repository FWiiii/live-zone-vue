<script setup>
import { ref } from 'vue'
import RoomCard from './RoomCard.vue'

const props = defineProps({
  liveData: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
  areas: {
    type: Array,
    default: () => [],
  },
  hasMore: {
    type: Boolean,
    default: true,
  },
})

const emits = defineEmits(['loadMore', 'getAreaData'])

function loadMore() {
  emits('loadMore')
}

const currSelectedArea = ref('')
const currSelectedIndex = ref(0)
function getAllLiveData({ platform, typeName }) {
  if (typeName === '全部') {
    emits('getAreaData', { platform, areaName: 'all' })
    currSelectedArea.value = ''
  }
  else if (typeName === '直播中') { emits('getAreaData', { platform, areaName: 'live' }) }
  else if (typeName === '未开播') { emits('getAreaData', { platform, areaName: 'no-live' }) }
}

function selectArea(item, index) {
  emits('getAreaData', { platform: item.platform, areaName: item.areaName })
  currSelectedArea.value = item.areaName
  currSelectedIndex.value = index
}
</script>

<template>
  <div h-645px>
    <el-scrollbar height="100%">
      <div font-700 text-2xl mt-2 pl-18>
        {{ props.title }}
      </div>
      <div v-if="props.areas.length > 0" h-10 flex items-center pl-18>
        <template v-for="area, index in areas" :key="index">
          <el-dropdown mr-4 cursor-pointer>
            <div class="el-dropdown-link" :class="{ 'text-blue-500': currSelectedIndex === index && currSelectedArea }" @click="getAllLiveData(area[0])">
              <span>{{ area[0].typeName }} </span>
              <span v-if="currSelectedIndex === index && currSelectedArea">  {{ ` · ${currSelectedArea}` }}</span>
            </div>
            <template v-if="area.length > 1" #dropdown>
              <div h-100>
                <el-dropdown-item v-for="item in area" :key="item.id" @click="selectArea(item, index)">
                  {{ item.areaName }}
                </el-dropdown-item>
              </div>
            </template>
          </el-dropdown>
        </template>
      </div>
      <div flex flex-wrap gap-5 items-center pl-18>
        <template v-for="room in props.liveData" :key="room.roomId">
          <RoomCard :room="room" />
        </template>
      </div>
      <div v-if="props.liveData.length" w-full text-center line-height-8 h-8 py-2 text-sm op-50>
        <span v-if="props.loading || !props.hasMore">
          {{ hasMore ? '加载中' : '没有更多' }}
        </span>
        <el-button v-else type="primary" @click="loadMore">
          加载更多
        </el-button>
      </div>
    </el-scrollbar>
  </div>
</template>
