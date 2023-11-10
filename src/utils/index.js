export function stringFormat(str, n) {
  return str.length > n ? `${str.slice(0, n)} ... ` : str
}

export function nummberFormat(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export function getPlatformName(platform) {
  switch (platform) {
    case 'huya':
      return '虎牙'
    case 'douyu':
      return '斗鱼'
    case 'bilibili':
      return '哔哩哔哩'
    case 'douyin':
      return '抖音'
    case 'cc':
      return '网易CC'
  }
}
