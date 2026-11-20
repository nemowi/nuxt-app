<template>
  <div class="train-scene">
    <svg class="train-scene__svg" viewBox="0 0 524 668" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <linearGradient id="ts-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#fcfcfd" />
          <stop offset="1" stop-color="#eef1f6" />
        </linearGradient>
        <linearGradient id="ts-ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#e8ecf2" />
          <stop offset="1" stop-color="#f5f6f9" />
        </linearGradient>
        <radialGradient id="ts-glow">
          <stop offset="0" stop-color="#f0261c" stop-opacity="0.28" />
          <stop offset="1" stop-color="#f0261c" stop-opacity="0" />
        </radialGradient>
      </defs>

      <!-- небо и земля -->
      <rect x="0" y="0" width="524" height="166" fill="url(#ts-sky)" />
      <rect x="0" y="166" width="524" height="502" fill="url(#ts-ground)" />
      <image :href="hillsUrl" x="0" y="64" width="524" height="180" />

      <!-- шпалы (бегут к зрителю) -->
      <g fill="#dde2ea">
        <rect
          v-for="s in frame.sleepers"
          :key="s.key"
          :x="s.x"
          :y="s.y"
          :width="s.w"
          :height="s.h"
          :opacity="s.opacity"
          rx="1"
        />
      </g>

      <image :href="railsUrl" x="0" y="0" width="524" height="668" />

      <!-- столбы, деревья, кусты, камни -->
      <image
        v-for="o in frame.objects"
        :key="o.key"
        :href="o.url"
        :x="o.x - (o.w * 5 - o.w) / 2"
        :y="o.y - (o.h * 4 - o.h)"
        :width="o.w * 5"
        :height="o.h * 5"
        :opacity="o.opacity"
        />

      <!-- знак опасности -->
      <g v-if="warn" :key="hazardKey" class="train-scene__warn">
        <circle class="train-scene__glow" :cx="warn.cx" :cy="warn.cy" :r="warn.w * 1.1" fill="url(#ts-glow)" />
        <image :href="warningUrl" :x="warn.x" :y="warn.y" :width="warn.w" :height="warn.h" />
      </g>

      <!-- поезд стоит на месте, чуть покачивается -->
      <g class="train-scene__train" :class="{ 'train-scene__train--moving': moving }">
        <image :href="trainUrl" x="110" y="380" width="300" height="500" />
      </g>
    </svg>
  </div>
</template>

<script setup>
import hillsUrl from '~/assets/svg/01_hills.svg'
import railsUrl from '~/assets/svg/02_rails.svg'
import trainUrl from '~/assets/svg/03_train.svg'
import poleUrl from '~/assets/svg/04_pole.svg'
import treeUrl from '~/assets/svg/05_tree.svg'
import bushUrl from '~/assets/svg/06_bush.svg'
import rockUrl from '~/assets/svg/07_rock.svg'
import warningUrl from '~/assets/svg/08_warning.svg'

const props = defineProps({
  /** расстояние до опасности, м (null — опасности нет) */
  distance: { type: Number, default: null },
  /** едет ли пользователь */
  moving: { type: Boolean, default: false },
  /** скорость, м/с */
  speed: { type: Number, default: 0 },
  /** меняется при смене опасности — проигрывает анимацию появления */
  hazardKey: { type: [String, Number], default: null },
})

// ---------- геометрия сцены (координаты из 02_rails.svg) ----------
const HORIZON = 166 // линия горизонта, y
const GROUND = 668 - HORIZON // высота «земли»
const CX = 262 // центр, где сходятся рельсы
const TRAIN_U = 0.5 // «глубина» носа поезда (0 — горизонт, 1 — низ экрана)
const D0 = 18 // подгонка перспективы для значка опасности, м

// «мир»: z — расстояние от зрителя, u = 1/z — масштаб в перспективе
const Z_MIN = 0.55
const Z_FAR = 12
const LEN = Z_FAR - Z_MIN
const SLEEPER_STEP = 0.45
const SLEEPER_COUNT = Math.ceil(LEN / SLEEPER_STEP)
const OBJECT_COUNT = 12

const KINDS = [
  { url: poleUrl, w: 56, ratio: 180 / 64, lat: [600, 840] },
  { url: treeUrl, w: 130, ratio: 150 / 120, lat: [600, 1040] },
  { url: bushUrl, w: 120, ratio: 80 / 140, lat: [560, 840] },
  { url: rockUrl, w: 90, ratio: 60 / 100, lat: [560, 800] },
]

const mod = (a, n) => ((a % n) + n) % n
const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
// детерминированный «рандом» — одинаков на сервере и клиенте
const hash = (n) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

// ---------- кадр: всё считается из пройденного пути dist ----------
const frame = shallowRef({ sleepers: [], objects: [] })
let dist = 0

const build = () => {
  const sleepers = []
  for (let k = 0; k < SLEEPER_COUNT; k++) {
    const z = mod(k * SLEEPER_STEP - dist, LEN) + Z_MIN
    const u = 1 / z
    const y = HORIZON + GROUND * u
    const left = 242 - 222 * u - 8 * u // внешний край левой рельсы
    const right = 282 + 222 * u + 8 * u
    const h = 14 * u
    sleepers.push({
      key: k,
      x: left,
      y: y - h / 2,
      w: right - left,
      h,
      opacity: clamp((u - 0.07) / 0.1, 0, 1),
    })
  }
  

  const objects = []
  for (let i = 0; i < OBJECT_COUNT; i++) {
    const rel = (i * LEN) / OBJECT_COUNT - dist
    const lap = Math.floor(rel / LEN)
    const z = mod(rel, LEN) + Z_MIN
    const seed = i * 17 + lap * 101
    const kind = KINDS[Math.floor(hash(seed) * KINDS.length)]
    const side = hash(seed + 1) < 0.5 ? -1 : 1
    const lat = kind.lat[0] + hash(seed + 2) * (kind.lat[1] - kind.lat[0])
    const u = 1 / z
    const w = kind.w * u
    const h = w * kind.ratio
    objects.push({
      key: i,
      url: kind.url,
      z,
      x: CX + side * lat * u - w / 2,
      y: HORIZON + GROUND * u - h,
      w,
      h,
      opacity: clamp((u - 0.08) / 0.1, 0, 1),
    })
  }
  objects.sort((a, b) => b.z - a.z) // дальние рисуем первыми

  frame.value = { sleepers, objects }
}

build()

// ---------- анимация ----------
let raf = 0
let lastT = 0
let curSpeed = 0 // плавная «визуальная» скорость, ед. мира/с

const loop = (t) => {
  const dt = lastT ? Math.min((t - lastT) / 1700, 0.1) : 0
  lastT = t

  const target = props.moving ? 3 + Math.min(props.speed, 30) * 0.25 : 0
  curSpeed += (target - curSpeed) * Math.min(1, dt * 2.5)

  if (curSpeed > 0.001) {
    dist += curSpeed * dt
    build()
  }
  raf = requestAnimationFrame(loop)
}

onMounted(() => {
  raf = requestAnimationFrame(loop)
})
onBeforeUnmount(() => cancelAnimationFrame(raf))

// ---------- значок опасности ----------
const warn = computed(() => {
  if (props.distance == null) return null
  const d = Math.max(0, props.distance)
  const u = TRAIN_U / (1 + d / D0) // далеко → у горизонта, близко → у поезда
  const w = 56 + 70 * u
  const h = w * 0.9
  const groundY = HORIZON + GROUND * u
  return { x: CX - w / 2, y: groundY - h, w, h, cx: CX, cy: groundY - h / 2 }
})
</script>

<style lang="scss" scoped>
.train-scene {
  position: relative;
  width: 100%;
  aspect-ratio: 524 / 668;
  overflow: hidden;

  &__svg {
    display: block;
    width: 100%;
    height: 100%;
  }

  &__warn {
    animation: warn-in 0.5s ease-out;
  }

  &__glow {
    transform-box: fill-box;
    transform-origin: center;
    animation: glow-pulse 1.6s ease-in-out infinite;
  }

  &__train {
    animation: train-bob 0.5s ease-in-out infinite alternate;
    animation-play-state: paused;

    &--moving {
      animation-play-state: running;
    }
  }
}

@keyframes train-bob {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-10px);
  }
}

@keyframes glow-pulse {
  0%,
  100% {
    transform: scale(0.9);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
  }
}

@keyframes warn-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>