import { md5 } from 'js-md5'

import HUYALIB from './lib'

const HUYA = HUYALIB.HUYA
const Taf = HUYALIB.Taf
const TafMx = HUYALIB.TafMx

let platformList = []

const textEncoder = new TextEncoder('utf-8')
const textDecoder = new TextDecoder('utf-8')

// 斗鱼弹幕编码(小端)
const douyuReadInt = function (buffer, start, len) {
  let result = 0
  for (let i = 0; i < len; i++)
    result += 256 ** (len - i - 1) * buffer[start - i]

  return result
}
const douyuWriteInt = function (buffer, start, len, value) {
  let i = 0
  while (i < len) {
    buffer[start - i] = value / 256 ** (len - i - 1)
    i++
  }
}
const douyuEncode = function (str) {
  let data = textEncoder.encode(str)
  const packetLen = 9 + data.byteLength
  const header = [0, 0, 0, 0, 0, 0, 0, 0, 177, 2, 0, 0]
  douyuWriteInt(header, 3, 4, packetLen)
  douyuWriteInt(header, 7, 4, packetLen)
  data = textEncoder.encode(`${str}\0`)
  return (new Uint8Array(header.concat(...data))).buffer
}
const douyuDecode = function (blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = function (e) {
      const buffer = new Uint8Array(e.target.result)
      const result = {}
      const packetLen = douyuReadInt(buffer, 3, 4)
      const op = douyuReadInt(buffer, 9, 2)
      if (op === 690) {
        const data = buffer.slice(12, packetLen + 2)
        let body = textDecoder.decode(data)
        body = body.replaceAll('@=', '":"').replaceAll('/', '","')
        body = body.replaceAll('@A', '@').replaceAll('@S', '/')
        const json = eval(`(` + `{"${body}"}` + `)`)
        result.type = json.type
        result.body = json
      }
      resolve(result)
    }
    reader.readAsArrayBuffer(blob)
  })
}

const byteToMsg = function (buf) {
  // If the buffer is backed by a Uint8Array, a faster version will work
  if (buf instanceof Uint8Array) {
    // If the buffer isn't a subarray, return the underlying ArrayBuffer
    if (buf.byteOffset === 0 && buf.byteLength === buf.buffer.byteLength) {
      return buf.buffer
    }
    else if (typeof buf.buffer.slice === 'function') {
      // Otherwise we need to get a proper copy
      return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
    }
  }

  if (Buffer.isBuffer(buf)) {
    // This is the slow version that will work with any Buffer
    // implementation (even in old browsers)
    const arrayCopy = new Uint8Array(buf.length)
    const len = buf.length
    for (let i = 0; i < len; i++)
      arrayCopy[i] = buf[i]

    return arrayCopy.buffer
  }
  else {
    throw new TypeError('Argument must be a Buffer')
  }
}

// 虎牙弹幕相关
const huyaSendPingReq = function () {
  const currTime = Date.now()
  const i = new HUYA.VideoGatewayProxy2VGPingReq()
  i.lLocalTime = 0.001 * currTime >> 0
  return _send_wup('videogateway', 'videoGatewayProxy2VGPing', i)
}
const _bind_ws_info = function (yyuid) {
  const ws_user_info = new HUYA.WSUserInfo()
  ws_user_info.lUid = yyuid
  ws_user_info.bAnonymous = yyuid == 0
  // ws_user_info.sGuid = this._main_user_id.sGuid
  ws_user_info.sToken = ''
  // ws_user_info.lTid = this._info.topsid
  // ws_user_info.lSid = this._info.subsid
  ws_user_info.lGroupId = yyuid
  ws_user_info.lGroupType = 3
  let jce_stream = new Taf.JceOutputStream()
  ws_user_info.writeTo(jce_stream)
  const ws_command = new HUYA.WebSocketCommand()
  ws_command.iCmdType = HUYA.EWebSocketCommandType.EWSCmd_RegisterReq
  ws_command.vData = jce_stream.getBinBuffer()
  jce_stream = new Taf.JceOutputStream()
  ws_command.writeTo(jce_stream)
  return jce_stream.getBuffer()
}

const _send_wup = function (action, callback, req) {
  try {
    const wup = new Taf.Wup()
    wup.setServant(action)
    wup.setFunc(callback)
    wup.writeStruct('tReq', req)
    const command = new HUYA.WebSocketCommand()
    command.iCmdType = HUYA.EWebSocketCommandType.EWSCmd_WupReq
    command.vData = wup.encode()
    const stream = new Taf.JceOutputStream()
    command.writeTo(stream)
    return stream.getBuffer()
  }
  catch (err) {
    console.log(`_send_wup异常${err}`)
  }
}
const _on_mes = function (data) {
  try {
    let stream = new Taf.JceInputStream(data)
    const command = new HUYA.WebSocketCommand()
    command.readFrom(stream)
    switch (command.iCmdType) {
      case HUYA.EWebSocketCommandType.EWSCmdS2C_MsgPushReq:
        stream = new Taf.JceInputStream(command.vData.buffer)
        var msg = new HUYA.WSPushMessage()
        msg.readFrom(stream)
        stream = new Taf.JceInputStream(msg.sMsg.buffer)
        if (TafMx.UriMapping[msg.iUri]) {
          const map = new (TafMx.UriMapping[msg.iUri])()
          map.readFrom(stream)
          const msg_obj = {
            type: 'chat',
            time: new Date().getTime(),
            name: map.tUserInfo.sNickName,
            id: md5(JSON.stringify(map)),
            content: map.sContent,
          }
          return msg_obj
        }
        break
      default:
        break
    }
  }
  catch (e) {
    console.log('接收信息出错', e)
  }
}

const setPlatformList = function (platformList1) {
  platformList = platformList1
}

const getPlatform = function (platForm) {
  let name = ''
  platformList.forEach((platformInfo) => {
    if (platformInfo.code === platForm)
      name = platformInfo.name
  })
  return name
}

const getPlatformList = function () {
  return platformList
}

export default {
  douyuEncode,
  douyuDecode,
  byteToMsg,
  huyaSendPingReq,
  _on_mes,
  _bind_ws_info,
  getPlatform,
  setPlatformList,
  getPlatformList,
  platformList,
}
