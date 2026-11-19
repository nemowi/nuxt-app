import { distanceMeters } from './geo'

export interface GeoPosition {
  lat: number
  lng: number
  accuracy: number
  timestamp: number
}

const MOVING_SPEED = 0.001 // м/с: быстрее считаем, что пользователь едет/идёт
const STOP_AFTER_MS = 5000 // столько без движения → считаем, что остановился

/** Слежение за геопозицией + определение «движется / стоит» */
export const useGeoPosition = () => {
  const position = shallowRef<GeoPosition | null>(null)
  const speed = ref(0) // м/с
  const isMoving = ref(false)
  const error = ref<string | null>(null)

  let watchId: number | null = null
  let anchor: GeoPosition | null = null
  let stopTimer: ReturnType<typeof setTimeout> | null = null

  const onPosition = (p: GeolocationPosition) => {
    error.value = null
    const cur: GeoPosition = {
      lat: p.coords.latitude,
      lng: p.coords.longitude,
      accuracy: p.coords.accuracy,
      timestamp: p.timestamp,
    }

    let v = Number.isFinite(p.coords.speed) ? (p.coords.speed as number) : null

    if (v === null) {
      // скорости нет — считаем сами по сдвигу от опорной точки
      v = 0
      if (!anchor) {
        anchor = cur
      } else {
        const d = distanceMeters(anchor, cur)
        const dt = (cur.timestamp - anchor.timestamp) / 1000
        // сдвиг меньше погрешности GPS считаем шумом
        if (dt > 0 && d > Math.max(cur.accuracy * 0.5, 3)) {
          v = d / dt
          anchor = cur
        } else if (dt > 6) {
          anchor = cur
        }
      }
    } else {
      anchor = cur
    }

    position.value = cur

    if (v >= MOVING_SPEED) {
      speed.value = v
      isMoving.value = true
      if (stopTimer) clearTimeout(stopTimer)
      stopTimer = setTimeout(() => {
        isMoving.value = false
        speed.value = 0
      }, STOP_AFTER_MS)
    }
  }

  const onError = (e: GeolocationPositionError) => {
    error.value =
      e.code === e.PERMISSION_DENIED
        ? 'Нет доступа к геолокации'
        : 'Не удалось определить местоположение'
  }

  const start = () => {
    if (watchId !== null) return
    if (!('geolocation' in navigator)) {
      error.value = 'Геолокация не поддерживается'
      return
    }
    watchId = navigator.geolocation.watchPosition(onPosition, onError, {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 10000,
    })
  }

  const stop = () => {
    if (watchId !== null) navigator.geolocation.clearWatch(watchId)
    watchId = null
    if (stopTimer) clearTimeout(stopTimer)
    isMoving.value = false
    speed.value = 0
  }

  return { position, speed, isMoving, error, start, stop }
}