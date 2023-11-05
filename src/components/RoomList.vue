<script setup>
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
})

const emits = defineEmits(['loadMore', 'getAreaData'])

const cardWrapper = ref(null)
const cardWrapperHeight = ref(0)
const loading = ref(false)
async function handleScroll(e) {
  cardWrapperHeight.value = cardWrapper.value.clientHeight
  if (cardWrapperHeight.value - e.scrollTop - 555 < 2 && cardWrapperHeight.value - e.scrollTop - 555 > -2) {
    loading.value = true
    emits('loadMore')
    loading.value = false
    cardWrapperHeight.value = cardWrapper.value.clientHeight
  }
}

const currSelectedArea = ref('')
const currSelectedIndex = ref(0)
function getAllLiveData({ platform, typeName }) {
  if (typeName !== '全部')
    return
  else
    currSelectedArea.value = ''
  emits('getAreaData', { platform, areaName: 'all' })
}

function selectArea(item, index) {
  emits('getAreaData', { platform: item.platform, areaName: item.areaName })
  currSelectedArea.value = item.areaName
  currSelectedIndex.value = index
}
</script>

<template>
  <div ml-16>
    <div font-700 text-2xl mt-2>
      {{ props.title }}
    </div>
    <div h-10 flex items-center>
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
    <el-scrollbar height="555px" @scroll="handleScroll">
      <div v-if="props.liveData" flex flex-col justify-center items-center>
        <div ref="cardWrapper" flex flex-wrap gap-5 items-center>
          <template v-for="room in props.liveData" :key="room.roomId">
            <RoomCard :room="room" />
          </template>
        </div>
        <span v-if="props.liveData.length && props.loading" w-full text-center line-height-8 bg-gray-200 h-8 py-2 text-sm op-50>
          加载中
        </span>
      </div>
    </el-scrollbar>
  </div>
</template>
