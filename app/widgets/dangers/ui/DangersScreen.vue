<template>
  <section class="dangers">
    <header class="dangers__header">
      <img class="dangers__logo" :src="logo" alt="РЖД" />
    </header>

    <h1 class="dangers__title">Опасности впереди</h1>
    <p class="dangers__subtitle">{{ subtitle }}</p>

    <!-- состояния -->
    <p v-if="geoError" class="dangers__state dangers__state--error">{{ geoError }}</p>
    <p v-else-if="status === 'loading' && !items.length" class="dangers__state">
      Определяем местоположение…
    </p>
    <div v-else-if="status === 'error' && !items.length" class="dangers__state dangers__state--error">
      <p>Не удалось загрузить опасности</p>
      <button class="dangers__retry" type="button" @click="reload">Повторить</button>
    </div>
    <p v-else-if="!items.length" class="dangers__state">Опасностей поблизости нет</p>

    <!-- список -->
    <ul v-else class="dangers__list">
      <li v-for="item in items" :key="item.id" class="dangers__item">
        <button
          class="dangers__card"
          type="button"
          :aria-expanded="opened === item.id"
          @click="opened = opened === item.id ? null : item.id"
        >
          <div class="dangers__photo">
            <img
              v-if="item.photoUrl && !broken.has(item.id)"
              class="dangers__img"
              :src="item.photoUrl"
              :alt="item.title"
              @error="broken.add(item.id)"
            >
            <svg v-else class="dangers__placeholder" viewBox="0 0 112 108" aria-hidden="true">
              <rect width="112" height="108" fill="#e6e9f0" />
              <circle cx="78" cy="30" r="9" fill="#d5dae4" />
              <path d="M0 96 34 52l22 26 18-22 38 40v6H0z" fill="#cdd3df" />
            </svg>
          </div>

          <div class="dangers__body">
            <h2 class="dangers__name">{{ item.title }}</h2>
            <p class="dangers__row">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" />
                <circle cx="12" cy="10" r="2.3" />
              </svg>
              {{ formatDistance(item.distance) }}
            </p>
            <p class="dangers__row">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
              {{ formatMinutes(item.minutes) }}
            </p>
          </div>

          <svg
            class="dangers__chevron"
            :class="{ 'dangers__chevron--open': opened === item.id }"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="m9 5 7 7-7 7" />
          </svg>
        </button>

        <p v-if="opened === item.id" class="dangers__desc">
          {{ item.description || 'Описание не указано' }}
        </p>
      </li>
    </ul>

    <!-- выход из аккаунта (в макете нет — удалите, если не нужен) -->
    <button class="dangers__logout" type="button" @click="logout">Выйти</button>
  </section>
</template>

<script setup>
import logo from '~/common/icon/logo.svg'
import { useDangersList } from '~/widgets/dangers/model/useDangersList'
import { useAuth } from '~/entities/user/api/model/useAuth'
import { formatDistance, formatMinutes, pluralize } from '~/shared/lib/format'

const { items, status, geoError, start, stop, reload } = useDangersList()
const { logout } = useAuth()

onMounted(start)
onBeforeUnmount(stop)

const opened = ref(null) // карточка с раскрытым описанием
const broken = reactive(new Set()) // фото, которые не загрузились

const subtitle = computed(() => {
  const n = items.value.length
  if (!n) return 'На вашем маршруте'
  return `На вашем маршруте · ${n} ${pluralize(n, ['опасность', 'опасности', 'опасностей'])}`
})
</script>

<style lang="scss" scoped>
$red: #f0261c;
$title: #0f172a;
$text: #475569;

.dangers {
  max-width: 550px;
  margin: 0 auto;
  padding: 24px 24px calc(120px + env(safe-area-inset-bottom, 0px));
  font-family: 'Inter', 'SF Pro Display', -apple-system, 'Segoe UI', Roboto, sans-serif;

  &__logo {
    width: 88px;
    height: auto;
  }

  &__title {
    margin: 28px 0 6px;
    font-size: 34px;
    line-height: 1.15;
    font-weight: 800;
    letter-spacing: -0.01em;
    color: $title;
  }

  &__subtitle {
    margin: 0 0 24px;
    font-size: 18px;
    color: $text;
  }

  &__state {
    margin: 48px 0 0;
    font-size: 17px;
    text-align: center;
    color: $text;

    &--error {
      color: $red;
    }
  }

  &__retry {
    margin-top: 12px;
    padding: 10px 22px;
    border: 0;
    border-radius: 14px;
    background: $red;
    color: #fff;
    font: inherit;
    font-weight: 600;
    cursor: pointer;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin: 0;
    padding: 0;
    list-style: none;
    padding-bottom: 50px;
  }

  &__item {
    position: relative;
    overflow: hidden;
    border-radius: 24px;
    background: #fff;
    box-shadow: 0 6px 20px rgba(15, 23, 42, 0.07);

    // красная полоса слева
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 14px;
      bottom: 14px;
      width: 4px;
      border-radius: 0 4px 4px 0;
      background: $red;
    }
  }

  &__card {
    display: flex;
    align-items: center;
    gap: 18px;
    width: 100%;
    padding: 14px 16px 14px 20px;
    border: 0;
    background: transparent;
    font: inherit;
    text-align: left;
    cursor: pointer;
  }

  &__photo {
    flex: none;
    width: 112px;
    height: 108px;
    overflow: hidden;
    border-radius: 16px;
    background: #e6e9f0;
  }

  &__img,
  &__placeholder {
    display: block;
    width: 100%;
    height: 100%;
  }

  &__img {
    object-fit: cover;
  }

  &__body {
    flex: 1;
    min-width: 0;
  }

  &__name {
    margin: 0 0 8px;
    font-size: 21px;
    line-height: 1.2;
    font-weight: 700;
    color: $title;
    overflow-wrap: anywhere;
  }

  &__row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 6px 0 0;
    font-size: 17px;
    font-weight: 500;
    color: $title;

    svg {
      flex: none;
      width: 22px;
      height: 22px;
      color: #5b6579;
    }
  }

  &__chevron {
    flex: none;
    width: 26px;
    height: 26px;
    color: $red;
    transition: transform 0.2s;

    &--open {
      transform: rotate(90deg);
    }
  }

  &__desc {
    margin: 0;
    padding: 0 20px 18px 20px;
    font-size: 16px;
    line-height: 1.5;
    color: $text;
  }

  &__logout {
    display: block;
    margin: 32px auto 0;
    padding: 0;
    border: 0;
    background: none;
    font: inherit;
    font-size: 15px;
    color: #8b94a7;
    text-decoration: underline;
    cursor: pointer;
  }
}
</style>