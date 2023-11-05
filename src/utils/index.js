export function stringFormat(str, n) {
  return str.length > n ? `${str.slice(0, n)} ... ` : str
}

export function nummberFormat(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}
