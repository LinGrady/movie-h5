import dayjs from "dayjs"

/**
 * 格式化电影上映时间
 * @param {number} timestamp - 时间戳
 * @param {boolean} showWeek - 是否显示星期
 * @returns {string} 格式化后的时间字符串
 */
export function formatPremiereTime(timestamp, showWeek = true) {
  if (!timestamp) return "待定"
  
  const date = dayjs.unix(timestamp)
  const today = dayjs()
  
  // 基本日期格式
  let dateStr = date.format("MM月DD日")
  
  // 如果需要显示星期
  if (showWeek) {
    const weekDays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"]
    const weekDay = weekDays[date.day()]
    dateStr += ` ${weekDay}`
  }
  
  // 如果是今年，不显示年份；否则显示年份
  if (date.year() !== today.year()) {
    dateStr = date.format("YYYY年") + dateStr
  }
  
  return dateStr
}

/**
 * 处理演员列表
 * @param {Array} actors - 演员数组
 * @returns {string} 演员名称字符串
 */
export function formatActors(actors) {
  if (!actors || actors.length === 0) {
    return "暂无主演"
  }
  
  return actors.map(actor => {
    return typeof actor === 'string' ? actor : actor.name
  }).join(" ")
} 