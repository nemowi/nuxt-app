
export const formatDistance = (m: number): string => {
  if (m < 1000) return `${Math.round(m)} м`
  const km = m / 1000
  const s = km >= 10 ? String(Math.round(km)) : km.toFixed(1).replace(/\.0$/, '').replace('.', ',')
  return `${s} км`
}

export const formatMinutes = (min: number): string => {
  if (min < 1) return '< 1 мин'
  if (min < 60) return `${Math.round(min)} мин`
  const h = Math.floor(min / 60)
  const m = Math.round(min % 60)
  return m ? `${h} ч ${m} мин` : `${h} ч`
}

export const pluralize = (n: number, forms: [string, string, string]): string => {
  const a = Math.abs(n) % 100
  const b = a % 10
  if (a > 10 && a < 20) return forms[2]
  if (b > 1 && b < 5) return forms[1]
  if (b === 1) return forms[0]
  return forms[2]
}