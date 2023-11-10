<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import Danmaku from 'danmaku/dist/esm/danmaku.canvas.js'
import { useRoute } from 'vue-router'
import Global from '../utils/danmaku'
import { getPlatformName, nummberFormat } from '../utils/index'
import { useUserStore } from '../store/userStore'
import Artplayer from '../components/Artplayer.vue'

const comp = {
  ws: null,
  interval: null,
  art: null,
  danmaku: null,
}

const route = useRoute()
const id = ref('')
const platform = ref('')
const liveRoomInfo = ref(null)
const userStore = useUserStore()
const uid = userStore.userInfo.uid

id.value = route.query.id
platform.value = route.query.platform
async function getLiveRoomInfo() {
  const res = await fetch(`http://live.yj1211.work/api/live/getRoomInfo?platform=${platform.value}&roomId=${id.value}&uid=${uid}`)
  const data = await res.json()
  liveRoomInfo.value = data.data
}

const danmuShow = ref(true)

function setCompArt(art) {
  comp.art = art
}

const danmuList = ref([])
const danmuLength = ref(100)

function initDouyuWs() {
  const ws = new WebSocket('wss://danmuproxy.douyu.com:8503/')
  comp.ws = ws
  const roomId = id
  ws.onopen = function () {
    const loginMsg = Global.douyuEncode(`type@=loginreq/roomid@=${roomId.value}/`)
    const joinGroupMsg = Global.douyuEncode(`type@=joingroup/rid@=${roomId.value}/gid@=1/`)
    const heartBeatMsg = Global.douyuEncode('type@=mrkl/')
    ws.send(heartBeatMsg)
    ws.send(loginMsg)
    ws.send(joinGroupMsg)
  }
  comp.interval = setInterval(() => {
    const heartBeatMsg = Global.douyuEncode('type@=mrkl/')
    ws.send(heartBeatMsg)
  }, 45000)
  ws.onmessage = async function (msg) {
    const packet = await Global.douyuDecode(msg.data)
    switch (packet.body.type) {
      case 'loginres':
        // console.log('获取直播间弹幕成功')
        break
      case 'chatmsg':
        // if (_this.isBanned(packet.body.level, packet.body.txt))
        // _this.emitDanmu(packet.body.txt, packet.body.nn)
        if (danmuList.value.length > danmuLength.value)
          danmuList.value.shift()
        danmuList.value.push({ msg: packet.body.txt, user: packet.body.nn, id: createRandomId(2) })
        emitDanmu(packet.body.txt)

        break
    }
  }
}

function initHuyaWs() {
  fetch(
        `http://live.yj1211.work/api/live/getHuyaInfo?roomId=${id.value}`,
  )
    .then(async (response) => {
      const res = await response.json()
      const data = res.data
      const ws = new WebSocket('wss://cdnws.api.huya.com/')
      comp.ws = ws
      ws.onopen = function () {
        const inRoomMsg = Global._bind_ws_info(data.luid)
        const loginMsg = Global.huyaSendPingReq()
        ws.send(inRoomMsg)
        ws.send(loginMsg)
      }
      comp.interval = setInterval(() => {
        const heartBeatMsg = Global.huyaSendPingReq()
        ws.send(heartBeatMsg)
      }, 30 * 1000)

      ws.onmessage = async function (msg) {
        const reader = new FileReader()
        reader.readAsArrayBuffer(msg.data)
        reader.onload = function () {
          const msg_obj = Global._on_mes(this.result) || ''
          if (msg_obj.type === 'chat') {
            // if (_this.isBanned('999', msg_obj.content))
            if (danmuList.value.length > danmuLength.value)
              danmuList.value.shift()
            danmuList.value.push({ msg: msg_obj.content, user: msg_obj.name, id: createRandomId(2) })
            emitDanmu(msg_obj.content)
          }
        }
      }
    })
}

function initBilibiliWs() {
  const ws = new WebSocket('wss://broadcastlv.chat.bilibili.com:2245/sub')
  comp.ws = ws
  ws.onopen = function () {
    const sendInfo = Global.encode(JSON.stringify({
      roomid: Number(id.value),
    }), 7)
    ws.send(sendInfo)
  }
  comp.interval = setInterval(() => {
    ws.send(Global.encode('', 2))
  }, 30000)
  ws.onmessage = async function (msgEvent) {
    const packet = await Global.decode(msgEvent.data)
    switch (packet.op) {
      case 8:
        console.log('获取直播间弹幕成功')
        break
      case 5:
        packet.body.forEach((body) => {
          switch (body.cmd) {
            case 'DANMU_MSG':
              // if (_this.isBanned(body.info[4][0], `${body.info[1]}`))
              if (danmuList.value.length > danmuLength.value)
                danmuList.value.shift()
              danmuList.value.push({ msg: body.info[1], user: body.info[2][1], id: createRandomId(2) })
              emitDanmu(body.info[1])
              break
          }
        })
        break
    }
  }
}

function createRandomId(length) {
  return +(Math.random().toString().substring(2, length) + Date.now()).toString(36)
}

function initDanmuWs() {
  if (platform.value === 'douyu')
    initDouyuWs()
  else if (platform.value === 'huya')
    initHuyaWs()
  else if (platform.value === 'bilibili')
    initBilibiliWs()
}

function initDanmaku(el) {
  comp.danmaku = new Danmaku({
    container: el,
    engine: 'canvas',
  })
}

function resizeDanmaku() {
  comp.danmaku.resize()
}

function toggledanmukuShow(show) {
  danmuShow.value = !danmuShow.value
  if (show)
    comp.danmaku.show()
  else
    comp.danmaku.hide()
  comp.danmaku.clear()
}

function emitDanmu(text) {
  const someDanmakuAObj = {
    text,
    style: {
      font: '20px sans-serif',
      textAlign: 'start',
      textBaseline: 'bottom',
      direction: 'inherit',
      fillStyle: '#fff',
      strokeStyle: '#fff',
      lineWidth: 1.0,
    },
  }
  comp.danmaku.emit(someDanmakuAObj)
}

const danmuScroll = ref(null)
const danmuWrapper = ref(null)
const lockScroll = ref(true)

watch(() => danmuList.value[danmuList.value.length - 1], () => {
  if (!lockScroll.value)
    return
  danmuScroll.value && danmuScroll.value.setScrollTop(danmuWrapper.value.clientHeight + 100)
}, { flush: 'post' })

const followLoading = ref(false)
async function handleFollow() {
  followLoading.value = true
  if (liveRoomInfo.value.isFollowed) {
    await fetch(`http://live.yj1211.work/api/live/unFollow?platform=${platform.value}&roomId=${id.value}&uid=${uid}`)
    liveRoomInfo.value.isFollowed = false
  }
  else {
    await fetch(`http://live.yj1211.work/api/live/follow?platform=${platform.value}&roomId=${id.value}&uid=${uid}`)
    liveRoomInfo.value.isFollowed = true
  }
  followLoading.value = false
}

function getUrl() {
  if (platform.value === 'bilibili')
    return `https://live.bilibili.com/${id.value}`

  if (platform.value === 'douyu')
    return `https://www.douyu.com/${id.value}`

  if (platform.value === 'huya')
    return `https://m.huya.com/${id.value}`

  if (platform.value === 'cc')
    return `https://cc.163.com/${id.value}`
}

function unmount() {
  danmuList.value = []
  if (comp.interval)
    clearInterval(comp.interval)
  if (comp.ws)
    comp.ws.close()
  if (comp.art?.destroy)
    comp.art.destroy()
  if (comp.danmaku)
    comp.danmaku.destroy()
  document.title = 'Live Zone'
}

async function init() {
  const danmuInterval = setInterval(() => {
    const el = document.querySelector('.art-danmuku')
    if (el) {
      initDanmaku(el)
      clearInterval(danmuInterval)
      initDanmuWs()
    }
  }, 500)
  await getLiveRoomInfo()
  document.title = liveRoomInfo.value.ownerName
}

onMounted(async () => {
  init()
})

onBeforeUnmount(() => {
  unmount()
})
</script>

<template>
  <el-container h-full w-full>
    <el-main class="p-0!">
      <div h-full flex flex-col>
        <Artplayer :id="id" :platform="platform" :comp="comp" :danmu-show="danmuShow" @resizeDanmaku="resizeDanmaku" @toggledanmuShow="danmuShow = !danmuShow" @toggledanmukuShow="toggledanmukuShow" @setCompArt="setCompArt" />
        <div v-if="liveRoomInfo" flex-1 h-full flex justify-between items-center px-8 py-2 box-border>
          <div flex items-center h-full>
            <img :src="liveRoomInfo.ownerHeadPic" alt="" h-16 w-16 rounded-full mr-4>
            <div flex flex-col justify-between h-full>
              <div>
                <span font-600 text-sm>{{ liveRoomInfo.ownerName }}</span>
                <span :class="[+liveRoomInfo.isLive ? 'bg-#9f1239/50' : 'bg-#e5e5e5/50']" ml-2 text-xs rounded font-light>{{ +liveRoomInfo.isLive ? 'Online' : 'Offline' }}</span>
              </div>
              <span font-800>{{ liveRoomInfo.roomName }}</span>
              <span text-xs font-light>
                {{ getPlatformName(liveRoomInfo.platForm) }}
                {{ liveRoomInfo.categoryName }}
                🔥{{ nummberFormat(liveRoomInfo.online) }}
              </span>
            </div>
          </div>
          <div>
            <el-button v-if="true" mr-2 plain text-center h-7 line-height-7 :loading="followLoading" @click="handleFollow">
              <template #icon>
                <svg
                  v-if="liveRoomInfo.isFollowed
                  " xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32"
                >
                  <path fill="currentColor" d="m16 2l-4.55 9.22l-10.17 1.47l7.36 7.18L6.9 30l9.1-4.78L25.1 30l-1.74-10.13l7.36-7.17l-10.17-1.48Z" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                  <path fill="currentColor" d="m16 6.52l2.76 5.58l.46 1l1 .15l6.16.89l-4.38 4.3l-.75.73l.18 1l1.05 6.13l-5.51-2.89L16 23l-.93.49l-5.51 2.85l1-6.13l.18-1l-.74-.77l-4.42-4.35l6.16-.89l1-.15l.46-1L16 6.52M16 2l-4.55 9.22l-10.17 1.47l7.36 7.18L6.9 30l9.1-4.78L25.1 30l-1.74-10.13l7.36-7.17l-10.17-1.48Z" />
                </svg>
              </template>
              {{ !!liveRoomInfo.isFollowed ? '已关注' : '关注' }}
            </el-button>
            <a :href="getUrl()" target="_blank">
              <el-button plain text-center h-7 line-height-7>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32">
                  <path fill="currentColor" d="M29.25 6.76a6 6 0 0 0-8.5 0l1.42 1.42a4 4 0 1 1 5.67 5.67l-8 8a4 4 0 1 1-5.67-5.66l1.41-1.42l-1.41-1.42l-1.42 1.42a6 6 0 0 0 0 8.5A6 6 0 0 0 17 25a6 6 0 0 0 4.27-1.76l8-8a6 6 0 0 0-.02-8.48Z" /><path fill="currentColor" d="M4.19 24.82a4 4 0 0 1 0-5.67l8-8a4 4 0 0 1 5.67 0A3.94 3.94 0 0 1 19 14a4 4 0 0 1-1.17 2.85L15.71 19l1.42 1.42l2.12-2.12a6 6 0 0 0-8.51-8.51l-8 8a6 6 0 0 0 0 8.51A6 6 0 0 0 7 28a6.07 6.07 0 0 0 4.28-1.76l-1.42-1.42a4 4 0 0 1-5.67 0Z" />
                </svg>
              </el-button>
            </a>
          </div>
        </div>
      </div>
    </el-main>
    <el-aside width="330px" border-l="~ black solid" class="p-2 pt-0">
      <div flex flex-col h-full>
        <div h-10 border-b="~ black solid" flex gap-2 justify-center items-center mb-1>
          <span>直播弹幕</span>
          <span cursor-pointer text-xs font-thin op-60 bg-black text-white rounded-sm px-1 @click="lockScroll = !lockScroll">{{ lockScroll ? '固定' : '自由' }}</span>
        </div>
        <el-scrollbar ref="danmuScroll" flex-1 height="100%">
          <div ref="danmuWrapper" of-x-hidden>
            <div v-for="danmu in danmuList" :key="danmu.id" block>
              <span font-bold>{{ danmu.user.trim() }}</span> : <span text-sm>{{ danmu.msg.trim() }}</span>
            </div>
          </div>
        </el-scrollbar>
      </div>
    </el-aside>
  </el-container>
</template>
