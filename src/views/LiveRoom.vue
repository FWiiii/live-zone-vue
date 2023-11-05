<script setup>
import { nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import Artplayer from 'artplayer'
import flvjs from 'flv.js'
import Hls from 'hls.js'
import Global from '../utils/danmaku'
import { nummberFormat } from '../utils/index'

const comp = reactive({
  ws: null,
  interval: null,
  art: null,
})

const route = useRoute()
const id = route.query.id
const platform = route.query.platform
const liveRoomInfo = ref(null)
const liveSource = ref(null)
async function getLiveRoomInfo() {
  const p1 = fetch(`http://live.yj1211.work/api/live/getRoomInfo?platform=${platform}&roomId=${id}`).then(res => res.json())
  const p2 = fetch(`http://live.yj1211.work/api/live/getRealUrlMultiSource?platform=${platform}&roomId=${id}`).then(res => res.json())
  const allPromise = Promise.all([p1, p2])
  const [d1, d2] = await allPromise
  liveRoomInfo.value = d1.data
  liveSource.value = d2.data
}

const liveSourceInfo = reactive({
  selectSource: '',
  selectRate: '',
  rateSourceSelector: [],
  sourceAndRateMap: new Map(),
  rateSelector: [],
  playUrl: '',
})

function setLiveSourceInfo() {
  const d = liveSource.value
  const qualityMap = new Map()

  for (const key in d) {
    if (d.hasOwnProperty(key))
      qualityMap.set(key, d[key])
  }

  const lastSelectSource = localStorage.getItem(`urlSource${liveRoomInfo.value.platform}`)
  const lastSelectRate = localStorage.getItem(`urlRate${liveRoomInfo.value.platform}`)

  // 设置当前选中的线路(需要根据上次选中的线路判断)
  if (lastSelectSource != null && qualityMap.has(lastSelectSource))
    liveSourceInfo.selectSource = lastSelectSource

  else
    liveSourceInfo.selectSource = qualityMap.keys().next().value

  // 设置当前选中的清晰度(需要根据上次选中的判断)
  const lastSelectQualityList = qualityMap.get(liveSourceInfo.selectSource)
  if (lastSelectRate != null) {
    lastSelectQualityList.forEach((quality) => {
      if (quality.qualityName === lastSelectRate)
        liveSourceInfo.selectRate = lastSelectRate
    })
  }
  if (liveSourceInfo.selectRate === '')
    liveSourceInfo.selectRate = lastSelectQualityList[0].qualityName

  qualityMap.forEach((qualityList, sourceName) => {
    // 渲染线路
    const isSelectSource = liveSourceInfo.selectSource === sourceName
    liveSourceInfo.rateSourceSelector.push({
      default: isSelectSource,
      html: sourceName,
    })

    // 处理清晰度
    qualityList.forEach((quality) => {
      const rateName = quality.qualityName
      if (rateName.includes('PRO'))
        return

      const isSelectRate = liveSourceInfo.selectRate === rateName
      liveSourceInfo.sourceAndRateMap.set(`${sourceName}===${rateName}`, quality.playUrl)
      // 渲染清晰度
      if (isSelectSource) {
        liveSourceInfo.rateSelector.push({
          default: isSelectRate,
          html: rateName,
        })
        if (isSelectRate)
          liveSourceInfo.playUrl = quality.playUrl
      }
    })
  })
}

function createPlayer() {
  comp.art = new Artplayer({
    container: '.artplayer-app',
    autoplay: true, // 自动播放
    isLive: true, // 直播
    url: liveSourceInfo.playUrl,
    type: liveSourceInfo.playUrl.indexOf('m3u8') > 0 ? 'customHls' : 'flv',
    autoSize: true, // 固定视频比例
    pip: true, // 画中画
    fullscreen: true, // 全屏按钮
    aspectRatio: true, // 长宽比
    setting: true, // 设置按钮
    fullscreenWeb: true, // 网页全屏按钮
    volume: 0, // 默认音量
    flip: true, // 翻转
    screenshot: true, // 截图
    mutex: false, // 假如页面里同时存在多个播放器，是否只能让一个播放器播放
    lang: 'zh-cn', //
    airplay: true,
    customType: {
      customHls(video, url, art) {
        console.log('播放customHls')
        if (Hls.isSupported()) {
          console.log('customHls==isSupported')
          const hls = new Hls()
          hls.loadSource(url)
          hls.attachMedia(video)
          // optional
          art.hls = hls
          art.once('destroy', () => hls.destroy())
        }
        else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          console.log('application/vnd.apple.mpegurl')
          video.src = url
        }
        else {
          console.log('Unsupported playback format: m3u8')
          art.notice.show = 'Unsupported playback format: m3u8'
        }
      },
      flv(video, url, art) {
        if (flvjs.isSupported()) {
          console.log('播放flv')
          const flv = flvjs.createPlayer({ type: 'flv', url })
          try {
            flv.attachMediaElement(video)
          }
          catch (error) {
            console.log(error)
          }
          flv.load()
          // optional
          art.flv = flv
          art.on('destroy', () => {
            console.log('destroyFlv')
            flv.destroy()
          })
        }
        else {
          art.notice.show = 'Unsupported playback format: flv'
        }
      },
    },
    controls: [
      // {
      // 	tooltip: '弹幕开关',
      // 	position: 'right',
      // 	html: '<i class="iconfont icon-danmukaiqi" style="font-size: 25px"></i>',
      // 	click: function () {
      // 		_this.danmuShow = !_this.danmuShow;
      // 		if (_this.danmuShow) {
      // 			document
      // 				.getElementsByClassName('iconfont icon-danmuguanbi')[0]
      // 				.setAttribute('class', 'iconfont icon-danmukaiqi');
      // 			_this.danmaku.show();
      // 		} else {
      // 			document
      // 				.getElementsByClassName('iconfont icon-danmukaiqi')[0]
      // 				.setAttribute('class', 'iconfont icon-danmuguanbi');
      // 			_this.danmaku.hide();
      // 		}
      // 	}
      // },
      {
        name: 'rateSource',
        position: 'right',
        html: liveSourceInfo.selectSource,
        style: {
          marginRight: '5px',
        },
        selector: liveSourceInfo.rateSourceSelector,
        onSelect(item) {
          changPlayUrl(item.html, liveSourceInfo.selectRate, comp.art)
          return item.html
        },
      },
      {
        name: 'rate',
        position: 'right',
        html: liveSourceInfo.selectRate,
        selector: liveSourceInfo.rateSelector,
        onSelect(item) {
          changPlayUrl(liveSourceInfo.selectSource, item.html, comp.art)
          return item.html
        },
      },
    ],
  })
}

function changPlayUrl(source, rate, art) {
  const playUrl = liveSourceInfo.sourceAndRateMap.get(`${source}===${rate}`)
  localStorage.setItem(`urlSource${liveRoomInfo.value.platform}`, source)
  localStorage.setItem(`urlRate${liveRoomInfo.value.platform}`, rate)
  console.info(`切换直播源:${source}===${rate}`)
  // 关闭之前的流
  switch (art.type) {
    case 'flv':
      art.flv.unload()
      break
    case 'customHls':
      art.hls.stopLoad()
      break
    default:
      break
  }
  if (playUrl.includes('.flv'))
    art.type = 'flv'

  else
    art.type = 'customHls'

  console.log(playUrl)
  art.switchUrl(playUrl)
}

const danmuList = ref([])
const danmuLength = ref(100)

function initDouyuWs() {
  const ws = new WebSocket('wss://danmuproxy.douyu.com:8503/')
  comp.ws = ws
  const roomId = id
  // const _this = this
  ws.onopen = function () {
    const loginMsg = Global.douyuEncode(`type@=loginreq/roomid@=${roomId}/`)
    const joinGroupMsg = Global.douyuEncode(`type@=joingroup/rid@=${roomId}/gid@=1/`)
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
        console.log('获取直播间弹幕成功')
        break
      case 'chatmsg':
        // if (_this.isBanned(packet.body.level, packet.body.txt))
        // _this.emitDanmu(packet.body.txt, packet.body.nn)
        if (danmuList.value.length <= danmuLength.value) { danmuList.value.push({ msg: packet.body.txt, user: packet.body.nn, id: createRandomId(2) }) }
        else {
          danmuList.value.shift()
          danmuList.value.push({ msg: packet.body.txt, user: packet.body.nn, id: createRandomId(2) })
        }

        break
    }
  }
}

function initHuyaWs() {
  fetch(
        `http://live.yj1211.work/api/live/getHuyaInfo?roomId=${id}`,
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
            if (danmuList.value.length <= danmuLength.value) { danmuList.value.push({ msg: msg_obj.content, user: msg_obj.name, id: createRandomId(2) }) }
            else {
              danmuList.value.shift()
              danmuList.value.push({ msg: msg_obj.content, user: msg_obj.name, id: createRandomId(2) })
            }
          }
        }
      }
    })
}

function createRandomId(length) {
  return +(Math.random().toString().substring(2, length) + Date.now()).toString(36)
}

function initDanmu() {
  if (platform === 'douyu')
    initDouyuWs()
  else if (platform === 'huya')
    initHuyaWs()
}

const danmuScroll = ref(null)
const danmuWrapper = ref(null)
const lockScroll = ref(true)

watch(() => danmuList.value[danmuList.value.length - 1], () => {
  if (!lockScroll.value)
    return
  nextTick(() => {
    danmuScroll.value.setScrollTop(danmuWrapper.value.clientHeight + 100)
  })
})

onMounted(async () => {
  await getLiveRoomInfo()
  setLiveSourceInfo()
  createPlayer()
  initDanmu()
})

onBeforeUnmount(() => {
  if (comp.interval)
    clearInterval(comp.interval)
  if (comp.ws)
    comp.ws.close()
  if (comp.art)
    comp.art.destroy()
})
</script>

<template>
  <el-container h-full w-full>
    <el-main class="p-0!">
      <div h-full flex flex-col>
        <div class="artplayer-app h-570px" bg-black w-full flex items-center />
        <div v-if="liveRoomInfo" flex-1 h-full flex items-center p-2 box-border>
          <img :src="liveRoomInfo.ownerHeadPic" alt="" h-16 w-16 rounded-full mr-4>
          <div flex flex-col justify-between h-full>
            <div text-sm>
              <span font-bold>{{ liveRoomInfo.ownerName }}</span>
              <span :class="[+liveRoomInfo.isLive ? 'bg-black text-white' : 'bg-gray']" ml-2 p-1 rounded-xl font-thin>{{ +liveRoomInfo.isLive ? 'Online' : 'Offline' }}</span>
            </div>
            <span font-800>{{ liveRoomInfo.roomName }}</span>
            <span text-xs font-light>
              {{ liveRoomInfo.platForm }}
              {{ liveRoomInfo.categoryName }}
              🔥{{ nummberFormat(liveRoomInfo.online) }}
            </span>
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
