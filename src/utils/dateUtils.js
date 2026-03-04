export function getTodayString() {
  const now = new Date()
  return formatDate(now)
}

export function formatDate(date) {
  const d = date instanceof Date ? date : new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function formatDateJP(dateStr) {
  const d = new Date(dateStr)
  const month = d.getMonth() + 1
  const day = d.getDate()
  const weekdays = ['日', '月', '火', '水', '木', '金', '土']
  const weekday = weekdays[d.getDay()]
  return `${month}月${day}日（${weekday}）`
}

export function formatDateShort(dateStr) {
  const d = new Date(dateStr)
  const month = d.getMonth() + 1
  const day = d.getDate()
  return `${month}/${day}`
}

export function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

export function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay()
}

export function getWeekdayLabel(date) {
  const weekdays = ['日', '月', '火', '水', '木', '金', '土']
  const d = date instanceof Date ? date : new Date(date)
  return weekdays[d.getDay()]
}
