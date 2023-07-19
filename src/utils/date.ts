import { formatTime } from '@/plugins/dayjs'

const formatListTime = (list_time: number | undefined) => {
  if (list_time === 0) {
    return formatTime(new Date())
  }
  return list_time ? formatTime(typeof list_time === 'number' ? list_time * 1000 : list_time) : '-'
}

export { formatListTime }
