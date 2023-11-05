<script setup>
import { useUserStore } from '../store/userStore'

const userStore = useUserStore()

const options = [
  {
    value: 'douyu',
    label: '斗鱼',
  },
  {
    value: 'huya',
    label: '虎牙',
  },
  {
    value: 'bilibili',
    label: '哔哩哔哩',
  },
]

const platform = ref('douyu')
const query = ref('')
const router = useRouter()

function handleSearch() {
  if (!query.value)
    return
  router.push({ path: '/search', query: { q: query.value, platform: platform.value } })
}

const favRoom = ref([])
async function getFavRoom() {
  const res = await fetch(`http://live.yj1211.work/api/live/getRoomsOn?uid=${userStore.userInfo.uid}`)
  const data = await res.json()
  favRoom.value = data.data
}
async function showFavRoom(e) {
  if (!e)
    return
  await getFavRoom()
  console.log(favRoom.value)
}

const livingFavRoom = computed(() => {
  return favRoom.value.filter(item => item.isLive)
})
</script>

<template>
  <el-header flex justify-between items-center border-b="~ black solid" class="h-12! px-20!">
    <router-link :to="{ path: '/' }" decoration-none text-black>
      Live Zone
    </router-link>
    <div flex items-center>
      <el-select v-model="platform" class="w-35" placeholder="Select">
        <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <el-input v-model="query" class="w-50 m-2" />

      <el-button @click="handleSearch">
        搜索
      </el-button>
    </div>
    <div flex items-center gap-5>
      <el-dropdown cursor-pointer trigger="click" @visible-change="showFavRoom">
        <div class="el-dropdown-link">
          我的关注
        </div>
        <template #dropdown>
          <div>
            <el-dropdown-item v-for="room, index in livingFavRoom" :key="index">
              <router-link :to="{ path: '/live', query: { id: room.roomId, platform: room.platForm } }" decoration-none>
                <el-card body-style="padding:10px;display:flex;width:170px">
                  <img :src="room.ownerHeadPic" alt="" h-10 w-10 rounded-full mr-5>
                  <div flex flex-col justify-between items-start>
                    <span>{{ room.ownerName }}</span>
                    <div bg-red-400 rounded-xl px-1>
                      直播中
                    </div>
                  </div>
                </el-card>
              </router-link>
            </el-dropdown-item>
          </div>
        </template>
      </el-dropdown>
      <template v-if="!userStore.isLogin">
        <el-button @click="userStore.showLoginDialog = true">
          登录
        </el-button>
      </template>
      <template v-else>
        <el-dropdown cursor-pointer>
          <div class="el-dropdown-link">
            {{ userStore.userInfo.userName }}
          </div>
          <template #dropdown>
            <div>
              <el-dropdown-item>
                信息修改
              </el-dropdown-item>
              <el-dropdown-item>
                绑定邮箱
              </el-dropdown-item>
              <el-dropdown-item>
                修改密码
              </el-dropdown-item>
              <el-dropdown-item @click="userStore.logout">
                退出
              </el-dropdown-item>
            </div>
          </template>
        </el-dropdown>
      </template>
    </div>
  </el-header>
</template>
