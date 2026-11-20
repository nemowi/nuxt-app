import { checkHazards, type HazardPoint } from '~/entities/hazard/api/hazard.api'
import { distanceMeters } from '~/shared/lib/geo'
import { useGeoPosition } from '~/shared/lib/useGeoPosition'

const POLL_MS = 5000 // как часто обновляем список у бэка
const DEFAULT_SPEED = 10 // м/с (~36 км/ч): для оценки времени, если мы стоим

export interface DangerItem {
  id: number
  title: string
  description: string | null
  photoUrl: string | null
  distance: number // м
  minutes: number // оценка времени до точки
}

/** Список опасностей рядом: бэк отдаёт точки в радиусе 5 км, расстояние считаем сами */
export const useDangersList = () => {
  const api = useRuntimeConfig().public.apiUrl
  const geo = useGeoPosition()

  const hazards = shallowRef<HazardPoint[]>([])
  const status = ref<'loading' | 'ok' | 'error'>('loading')

  let running = false
  let timer: ReturnType<typeof setTimeout> | null = null

  // путь к фото на бэке; если у вас другой адрес файлов — поправьте здесь
  const photoUrl = (path: string | null): string | null => {
    if (!path) return null
    if (/^https?:\/\//.test(path)) return path
    return `${api}/storage/${path.replace(/^\/+/, '')}`
  }

  const items = computed<DangerItem[]>(() => {
    const pos = geo.position.value
    if (!pos) return []
    const v = geo.speed.value > 1 ? geo.speed.value : DEFAULT_SPEED

    return hazards.value
      .map((h) => {
        const distance = distanceMeters(pos, { lat: h.latitude, lng: h.longitude })
        return {
          id: h.id,
          title: h.title,
          description: h.description,
          photoUrl: photoUrl(h.photo_path),
          distance,
          minutes: distance / v / 60,
        }
      })
      .sort((a, b) => a.distance - b.distance)
  })

  const poll = async () => {
    if (!running) return
    const started = Date.now()
    const pos = geo.position.value
    let delay: number

    if (!pos) {
      delay = 500 
    } else {
      try {
        const res = await checkHazards({ lat: pos.lat, lng: pos.lng })
        if (!running) return
        hazards.value = res.hazards
        status.value = 'ok'
      } catch {
        status.value = 'error'
      }
      delay = Math.max(0, POLL_MS - (Date.now() - started))
    }
    timer = setTimeout(poll, delay)
  }

  const start = () => {
    if (running) return
    running = true
    geo.start()
    poll()
  }

  const stop = () => {
    running = false
    if (timer) clearTimeout(timer)
    geo.stop()
  }

  /** Повторить запрос сразу (кнопка «Повторить») */
  const reload = () => {
    if (timer) clearTimeout(timer)
    status.value = 'loading'
    poll()
  }

  return { items, status, geoError: geo.error, start, stop, reload }
}