<template>
  <nav class="bottom-nav" aria-label="Основное меню">
    <div class="bottom-nav__list">
      <button
        class="bottom-nav__button"
        :class="{ 'bottom-nav__button--active': modelValue === 'overview' }"
        type="button"
        @click="emit('update:modelValue', 'overview')"
      >
        <svg class="bottom-nav__icon" viewBox="0 0 32 32" aria-hidden="true">
          <circle cx="16" cy="16" r="11.5" />
          <path d="M21 11l-3 7.5L10.5 21l3-7.5z" />
        </svg>
        <span class="bottom-nav__label">Обзор</span>
      </button>

      <button
        class="bottom-nav__button"
        :class="{ 'bottom-nav__button--active': modelValue === 'report' }"
        type="button"
        @click="emit('update:modelValue', 'report')"
      >
        <svg class="bottom-nav__icon" viewBox="0 0 32 32" aria-hidden="true">
          <path class="bottom-nav__fill" d="M5 11.5A2.5 2.5 0 0 1 7.5 9H10l1.6-2.5h8.8L22 9h2.5a2.5 2.5 0 0 1 2.5 2.5v11A2.5 2.5 0 0 1 24.5 25h-17A2.5 2.5 0 0 1 5 22.5z" />
          <circle class="bottom-nav__detail" cx="16" cy="16.5" r="4" />
        </svg>
        <span class="bottom-nav__label">Сообщить</span>
      </button>

      <button
        class="bottom-nav__button"
        :class="{ 'bottom-nav__button--active': modelValue === 'dangers' }"
        type="button"
        @click="emit('update:modelValue', 'dangers')"
      >
        <svg class="bottom-nav__icon" viewBox="0 0 32 32" aria-hidden="true">
          <path class="bottom-nav__fill" d="M16 5.5 28 25.5H4z" />
          <path class="bottom-nav__detail" d="M16 13v6M16 22.2h.01" />
        </svg>
        <span class="bottom-nav__label">Опасности</span>
      </button>
    </div>
  </nav>
</template>

<script setup>
defineProps({
  modelValue: { type: String, required: true },
})
const emit = defineEmits(['update:modelValue'])
</script>

<style lang="scss" scoped>
$red: #f0261c;
$inactive: #7b8497;

.bottom-nav {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
  display: flex;
  justify-content: center;
  padding-bottom: env(safe-area-inset-bottom, 0px);
  background: #fff;
  border-radius: 28px 28px 0 0;
  box-shadow: 0 -8px 24px rgba(15, 23, 42, 0.06);

  &__list {
    display: flex;
    width: 100%;
    max-width: 440px;
    padding: 14px 12px 12px;
  }

  &__button {
    position: relative;
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 6px 0 14px;
    border: 0;
    background: transparent;
    color: $inactive;
    font: inherit;
    cursor: pointer;
    transition: color 0.2s;

    // красная линия под активной вкладкой
    &::after {
      content: '';
      position: absolute;
      left: 50%;
      bottom: 0;
      width: 0;
      height: 3px;
      border-radius: 2px;
      background: $red;
      transform: translateX(-50%);
      transition: width 0.2s;
    }

    &--active {
      color: $red;

      &::after {
        width: 80px;
      }

      // у камеры и треугольника в активном состоянии заливка
      .bottom-nav__fill {
        fill: currentColor;
      }
      .bottom-nav__detail {
        stroke: #fff;
      }
    }
  }

  &__icon {
    width: 32px;
    height: 32px;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.8;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  &__label {
    font-size: 15px;
    font-weight: 500;
    line-height: 1.2;
  }
}
</style>