/**
 * 日期时间工具函数
 */

/**
 * 格式化时间戳为易读格式
 * @param {number|Date} timestamp - 时间戳（毫秒）或 Date 对象
 * @param {string} format - 格式类型
 * @returns {string} - 格式化后的日期字符串
 * 
 * 格式类型：
 * - 'simple': '月日 时:分' (默认) 例: 2月24日 14:30
 * - 'full': 'YYYY-MM-DD HH:mm:ss' 例: 2026-02-24 14:30:00
 * - 'date': 'YYYY-MM-DD' 例: 2026-02-24
 * - 'datetime': 'YYYY年MM月DD日 HH:mm' 例: 2026年02月24日 14:30
 * - 'cn-date': 'YYYY年MM月DD日' 例: 2026年02月24日
 * - 'short': 'MM-DD' 例: 02-24
 * - 'time': 'HH:mm' 例: 14:30
 * - 'month': 'YYYY-MM' 例: 2026-02
 * - 'year': 'YYYY' 例: 2026
 */
export function formatDate(timestamp, format = 'simple') {
  if (!timestamp) return ''
  
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  
  const mm = String(month).padStart(2, '0')
  const dd = String(day).padStart(2, '0')
  
  switch (format) {
    case 'simple':
      return `${month}月${day}日 ${hours}:${minutes}`
    case 'full':
      return `${year}-${mm}-${dd} ${hours}:${minutes}:${seconds}`
    case 'date':
      return `${year}-${mm}-${dd}`
    case 'datetime':
      return `${year}年${mm}月${dd}日 ${hours}:${minutes}`
    case 'cn-date':
      return `${year}年${mm}月${dd}日`
    case 'short':
      return `${mm}-${dd}`
    case 'time':
      return `${hours}:${minutes}`
    case 'month':
      return `${year}-${mm}`
    case 'year':
      return `${year}`
    default:
      return `${month}月${day}日 ${hours}:${minutes}`
  }
}

/**
 * 获取今天的日期字符串 (YYYY-MM-DD)
 * @returns {string}
 */
export function getTodayStr() {
  return formatDate(new Date(), 'date')
}

/**
 * 获取当前年份
 * @returns {number}
 */
export function getCurrentYear() {
  return new Date().getFullYear()
}

/**
 * 获取当前月份 (1-12)
 * @returns {number}
 */
export function getCurrentMonth() {
  return new Date().getMonth() + 1
}

/**
 * 获取当前日期 (1-31)
 * @returns {number}
 */
export function getCurrentDate() {
  return new Date().getDate()
}

/**
 * 获取当前小时 (0-23)
 * @returns {number}
 */
export function getCurrentHour() {
  return new Date().getHours()
}

/**
 * 获取相对时间描述（刚刚、几分钟前、几小时前等）
 * @param {number} timestamp - 时间戳（毫秒）
 * @returns {string} - 相对时间描述
 */
export function getRelativeTime(timestamp) {
  if (!timestamp) return ''
  
  const now = Date.now()
  const diff = now - timestamp
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (seconds < 60) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  
  // 超过 7 天显示具体日期
  return formatDate(timestamp, 'simple')
}