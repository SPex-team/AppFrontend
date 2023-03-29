import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone' // 导入插件
import utc from 'dayjs/plugin/utc' // 导入插件

dayjs.extend(timezone)
dayjs.extend(utc)

export default dayjs

export function formatTime(date) {
  if (!date) return '-'

  return dayjs.tz(new Date(date), dayjs.tz.guess()).format('YYYY-MM-DD HH:mm:ss')
}
