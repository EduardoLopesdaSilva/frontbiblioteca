export function pad2(n: number) {
  return String(n).padStart(2, '0')
}

export function formatDateBR(yyyyMmDd: string) {
  const [y, m, d] = yyyyMmDd.split('-').map(Number)
  if (!y || !m || !d) return yyyyMmDd
  return `${pad2(d)}/${pad2(m)}/${y}`
}

export function formatTimeBR(hhMm: string) {
  return hhMm
}

export function toISODate(date: Date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
}

export function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60_000)
}

export function buildDateTime(dateISO: string, timeHHmm: string) {
  // Local time
  return new Date(`${dateISO}T${timeHHmm}:00`)
}

