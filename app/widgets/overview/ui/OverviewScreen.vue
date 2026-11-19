<template>
  <section class="overview">
    <header class="overview__header">
      <img class="overview__logo" :src="logo" alt="РЖД" />
      <span class="overview__status" :class="{ 'overview__status--error': hasProblem }">
        <i class="overview__dot" />
        {{ statusText }}
      </span>
    </header>

    <div class="overview__info">
      <p class="overview__value" :class="{active: isNear}">{{ valueText }}</p>
      <p class="overview__caption">{{ captionText }}</p>
    </div>

    <TrainScene
      :distance="distance"
      :moving="isMoving"
      :speed="speed"
      :hazard-key="hazardId"
    />
  </section>
</template>

<script setup>
import logo from '~/common/icon/logo.svg'
import TrainScene from '~/widgets/train-scene/ui/TrainScene.vue'
import { useHazardTracker } from '~/entities/hazard/model/useHazardTracker'

const { isDemo, hazardId, hazardTitle, distance, status, isMoving, speed, geoError, start, stop } =
  useHazardTracker()

onMounted(start)
onBeforeUnmount(stop)

const hasProblem = computed(() => !isDemo && (status.value === 'error' || !!geoError.value))

const statusText = computed(() => {
  if (isDemo) return 'Демо-режим'
  if (geoError.value) return geoError.value
  if (status.value === 'error') return 'Нет связи'
  return 'Система активна'
})

const valueText = computed(() => {
  const d = distance.value
  if (d == null) return 'Всё чисто'
  return d >= 1000 ? `${(d / 1000).toFixed(1)} км` : `${Math.round(d)} м`
})

const captionText = computed(() =>
  distance.value == null ? 'опасностей рядом нет' : hazardTitle,
)

const isNear = computed(() => {
  return distance.value !== null && distance.value <= 50
});

</script>

<style lang="scss" scoped>
$title: #0f172a;
$text: #475569;
$red: #f0261c;

.overview {
  max-width: 550px;
  margin: 0 auto;
  overflow: hidden;
  font-family: 'Inter', 'SF Pro Display', -apple-system, 'Segoe UI', Roboto, sans-serif;
  background-color: #fcfcfd;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24px 24px 0;
  }

  &__logo {
    width: 88px;
    height: auto;
  }

  &__status {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: $text;

    &--error .overview__dot {
      background: #f0261c;
    }
  }

  &__dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #3fb950;
  }

  &__info {
    padding: 36px 24px 0;
    text-align: center;
  }

  &__value {
    margin: 0;
    font-size: 64px;
    line-height: 1.05;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: $title;
  }

  &__caption {
    margin: 8px 0 0;
    font-size: 26px;
    font-weight: 500;
    color: $text;
  }

  &__value.active {
    color: $red;
  }
}
</style>