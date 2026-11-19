import { checkHazards, type HazardPoint } from '../api/hazard.api'
import { distanceMeters, type LatLng } from '~/shared/lib/geo'
import { useGeoPosition, type GeoPosition } from '~/shared/lib/useGeoPosition'

const POLL_MS = 2000 // как часто обновляем СПИСОК опасных точек у бэка (30 запросов/мин)
const TICK_MS = 100 // как часто сглаживаем число на экране
const PASS_NEAR = 30 // м: подошли ближе → считаем, что были «на точке»
const PASS_MARGIN = 15 // м: и отдалились от минимума на столько → проехали

// демо-режим (?demo=1): без GPS и бэка, опасности едут навстречу
const DEMO_SPEED = 12 // м/с

/**
 * Бэк раз в POLL_MS отдаёт список опасных точек в радиусе 5 км.
 * Расстояние до них мы считаем САМИ при каждом обновлении GPS —
 * поэтому число на экране не зависит от задержки сети.
 */
export const useHazardTracker = () => {
  const route = useRoute()
  const isDemo = route.query.demo !== undefined

  const geo = useGeoPosition()

  const hazardId = ref<number | null>(null)
  const distance = ref<number | null>(null) // плавное расстояние для UI, м
  const status = ref<'idle' | 'ok' | 'error'>('idle')

  const isMoving = computed(() => isDemo || geo.isMoving.value)
  const speed = computed(() => (isDemo ? DEMO_SPEED : geo.speed.value))

  // --- внутреннее состояние ---
  const passed = new Set<number>() // уже проехали
  const minDist = new Map<number, number>() // минимальное расстояние до точки
  let hazards: HazardPoint[] = [] // последний список от бэка
  let filtered: LatLng | null = null // позиция после фильтра шума
  let target: number | null = null // куда плавно тянется distance
  let running = false
  let pollTimer: ReturnType<typeof setTimeout> | null = null
  let tickTimer: ReturnType<typeof setInterval> | null = null
  let wakeLock: WakeLockSentinel | null = null

  const clear = () => {
    hazardId.value = null
    distance.value = null
    target = null
  }

  // ---------- фильтр «дрожания» GPS ----------
  // Если позиция сдвинулась меньше половины погрешности — это шум, игнорируем.
  // Если больше — двигаем отфильтрованную точку на половину сдвига (сглаживание).
  const filterPosition = (p: GeoPosition) => {
    if (!filtered) {
      filtered = { lat: p.lat, lng: p.lng }
      return
    }
    const moved = distanceMeters(filtered, p)
    if (moved < Math.max(3, p.accuracy * 0.5)) return
    filtered = {
      lat: filtered.lat + (p.lat - filtered.lat) * 0.5,
      lng: filtered.lng + (p.lng - filtered.lng) * 0.5,
    }
  }

  // ---------- расстояние до ближайшей непройденной точки ----------
  const recompute = () => {
    if (!filtered) return

    let best: HazardPoint | null = null
    let bestD = Infinity

    for (const h of hazards) {
      if (passed.has(h.id)) continue
      const d = distanceMeters(filtered, { lat: h.latitude, lng: h.longitude })

      // проехали: подошли близко и начали удаляться
      const min = Math.min(minDist.get(h.id) ?? Infinity, d)
      minDist.set(h.id, min)
      if (min < PASS_NEAR && d > min + PASS_MARGIN) {
        passed.add(h.id)
        continue
      }

      if (d < bestD) {
        bestD = d
        best = h
      }
    }

    if (!best) {
      clear()
      return
    }

    if (hazardId.value !== best.id) distance.value = bestD // новая точка — сразу
    hazardId.value = best.id
    target = bestD
  }

  // каждое новое положение GPS → пересчёт без сети
  watch(geo.position, (p) => {
    if (!p) return
    filterPosition(p)
    recompute()
  })

  // ---------- плавность числа на экране ----------
  let demoId = 1
  let demoDist = 300

  const tick = () => {
    if (isDemo) {
      demoDist -= (DEMO_SPEED * TICK_MS) / 1000
      if (demoDist <= 0) {
        demoId++
        demoDist = 250 + (demoId % 3) * 50
      }
      hazardId.value = demoId
      distance.value = demoDist
      return
    }

    if (target == null) return
    const cur = distance.value
    distance.value =
      cur == null || Math.abs(cur - target) > 80 ? target : cur + (target - cur) * 0.3
  }

  // ---------- опрос бэка: только обновляем список точек ----------
  const poll = async () => {
    if (!running) return
    const started = Date.now()
    const pos = geo.position.value
    let delay: number

    if (!pos) {
      delay = 500 // координат ещё нет — проверяем чаще
    } else {
      try {
        const res = await checkHazards({ lat: pos.lat, lng: pos.lng })
        if (!running) return
        hazards = res.danger ? res.hazards : []
        status.value = 'ok'
        recompute()
      } catch {
        status.value = 'error'
      }
      // ровно POLL_MS между стартами запросов, а не «POLL_MS + время ответа»
      delay = Math.max(0, POLL_MS - (Date.now() - started))
    }
    pollTimer = setTimeout(poll, delay)
  }

  const requestWakeLock = async () => {
    try {
      // экран не гаснет, пока открыт обзор
      wakeLock = (await navigator.wakeLock?.request('screen')) ?? null
    } catch {
      /* не критично */
    }
  }

  const start = () => {
    if (running) return
    running = true
    tickTimer = setInterval(tick, TICK_MS)

    if (isDemo) {
      status.value = 'ok'
      return
    }
    geo.start()
    poll()
    requestWakeLock()
  }

  const stop = () => {
    running = false
    if (pollTimer) clearTimeout(pollTimer)
    if (tickTimer) clearInterval(tickTimer)
    geo.stop()
    wakeLock?.release().catch(() => {})
    wakeLock = null
  }

  /** Забыть «проехали» (например, для повторной демонстрации на той же точке) */
  const resetPassed = () => {
    passed.clear()
    minDist.clear()
  }

  return {
    isDemo,
    hazardId,
    distance,
    status,
    isMoving,
    speed,
    geoError: geo.error,
    start,
    stop,
    resetPassed,
  }
}