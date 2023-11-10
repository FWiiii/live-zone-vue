<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../store/userStore'
import darkIcon from './dark.vue'
import lightIcon from './light.vue'

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
  {
    value: 'douyin',
    label: '抖音',
  },
  {
    value: 'cc',
    label: '网易CC',
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
}

const livingFavRoom = computed(() => {
  return favRoom.value.filter(item => item.isLive)
})

onMounted(() => {
  getFavRoom()
})

const isDark = ref(false || JSON.parse(localStorage.getItem('darkMode')))
function toggleDark(v) {
  isDark.value = v
  if (v)
    document.documentElement.classList.remove('dark')
  else
    document.documentElement.classList.add('dark')
  localStorage.setItem('darkMode', JSON.stringify(v))
}
toggleDark(isDark.value)
</script>

<template>
  <el-header flex justify-between items-center border-b="~ black solid" class="h-12! px-20!">
    <router-link :to="{ path: '/' }" decoration-none text-inherit>
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
      <el-dropdown v-if="userStore.userInfo.uid" cursor-pointer trigger="click" @visible-change="showFavRoom">
        <div class="el-dropdown-link">
          我的关注
        </div>
        <template #dropdown>
          <div>
            <el-dropdown-item v-for="room, index in livingFavRoom" :key="index">
              <router-link :to="{ path: '/live', query: { id: room.roomId, platform: room.platForm } }" decoration-none>
                <el-card body-style="padding:10px;display:flex;width:160px">
                  <div flex items-center>
                    <img :src="room.ownerHeadPic" alt="" h-10 w-10 rounded-full mr-2>
                    <div flex flex-col justify-between items-start>
                      <span>{{ room.ownerName }}</span>
                      <div bg-red-400 rounded-xl px-1>
                        直播中
                      </div>
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
      <el-switch
        v-model="isDark"
        inline-prompt
        size="large"
        :active-icon="lightIcon"
        :inactive-icon="darkIcon"
        style="--el-switch-off-color: rgba(101, 117, 133, .16);--el-switch-on-color:#f2f2f2"
        @change="toggleDark"
      />
    </div>
  </el-header>
</template>
