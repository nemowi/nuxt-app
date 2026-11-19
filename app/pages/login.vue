<template>
  <main class="login-page">
    <div class="login-page__content">
      <img class="login-page__logo" :src="logo" alt="РЖД" />

      <header class="login-page__header">
        <h1 class="login-page__title">Вход в систему</h1>
        <p class="login-page__subtitle">
          Для доступа к сервису<br />безопасности на железной дороге
        </p>
      </header>

      <form class="login-form" novalidate @submit.prevent="onSubmit">
        <!-- Почта -->
        <label class="login-form__field">
          <svg class="login-form__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="3.5" y="5.5" width="17" height="13" rx="3" />
            <path d="M4.5 8.5l7.5 5 7.5-5" />
          </svg>
          <input
            v-model="form.email"
            class="login-form__input"
            type="email"
            placeholder="Почта"
            autocomplete="email"
          />
        </label>

        <!-- Пароль -->
        <label class="login-form__field">
          <svg class="login-form__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="5" y="10.5" width="14" height="10" rx="3" />
            <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
            <circle cx="12" cy="15.5" r="0.8" fill="currentColor" />
          </svg>
          <input
            v-model="form.password"
            class="login-form__input"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Пароль"
            autocomplete="current-password"
          />
          <button
            class="login-form__toggle"
            type="button"
            :aria-label="showPassword ? 'Скрыть пароль' : 'Показать пароль'"
            @click="showPassword = !showPassword"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
              <circle cx="12" cy="12" r="3" />
              <path v-if="!showPassword" d="M4 4l16 16" />
            </svg>
          </button>
        </label>

        <p v-if="errorMessage" class="login-form__error" role="alert">{{ errorMessage }}</p>

        <button class="login-form__submit" type="submit" :disabled="isLoading">
          Войти
        </button>

        <NuxtLink class="login-form__link" to="/register">Зарегистрироваться</NuxtLink>
      </form>
    </div>

    <img class="login-page__bg" :src="railway" alt="" aria-hidden="true" />
  </main>
</template>

<script setup>
import logo from '~/common/icon/logo.svg'
import railway from '~/common/icon/railway-bottom.svg'
import { login } from '~/entities/user/api/auth.api'
import { useAuth } from '~/entities/user/api/model/useAuth'

definePageMeta({ layout: 'auth' })

const { setSession } = useAuth()

const form = reactive({
  email: '',
  password: '',
})

const showPassword = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')

const onSubmit = async () => {
  errorMessage.value = ''

  if (!form.email.trim() || !form.password) {
    errorMessage.value = 'Введите почту и пароль'
    return
  }

  isLoading.value = true
  try {
    const res = await login({
      email: form.email.trim(),
      password: form.password,
    })
    setSession(res)
    await navigateTo('/')
  } catch (error) {
    errorMessage.value =
      error?.statusCode === 401
        ? 'Неверная почта или пароль'
        : error?.data?.message || 'Не удалось выполнить вход'
  } finally {
    isLoading.value = false
  }
}
</script>

<style lang="scss" scoped>
$red: #f0261c;
$red-dark: #d81f16;
$title: #0f172a;
$text: #475569;
$placeholder: #8b94a7;
$border: #dfe4ec;

.login-page {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  overflow: hidden;
  background: #fcfcfd;
  font-family: 'Inter', 'SF Pro Display', -apple-system, 'Segoe UI', Roboto, sans-serif;

  &__content {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 75%;
    max-width: 440px;
    padding: 80px 24px 0;
  }

  &__logo {
    width: 132px;
    height: auto;
    margin-bottom: 40px;
  }

  &__header {
    text-align: center;
    margin-bottom: 40px;
  }

  &__title {
    margin: 0 0 14px;
    font-size: 34px;
    line-height: 1.15;
    font-weight: 700;
    letter-spacing: -0.01em;
    color: $title;
  }

  &__subtitle {
    margin: 0;
    font-size: 18px;
    line-height: 1.6;
    color: $text;
  }

  &__bg {
    position: absolute;
    left: 0;
    bottom: 0;
    z-index: 0;
    width: 100%;
    height: auto;
    max-height: 40vh;
    object-fit: cover;
    object-position: bottom center;
    pointer-events: none;
    user-select: none;
  }
}

.login-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;

  &__field {
    display: flex;
    align-items: center;
    gap: 14px;
    width: 100%;
    height: 66px;
    margin-bottom: 22px;
    padding: 0 22px;
    background: #fff;
    border: 1.5px solid $border;
    border-radius: 22px;
    color: #3b4558;
    transition: border-color 0.2s, box-shadow 0.2s;

    &:focus-within {
      border-color: $red;
      box-shadow: 0 0 0 3px rgba($red, 0.12);
    }
  }

  &__icon {
    flex: none;
    width: 24px;
    height: 24px;
  }

  &__input {
    flex: 1;
    min-width: 0;
    height: 100%;
    padding: 0;
    border: 0;
    outline: 0;
    background: transparent;
    font: inherit;
    font-size: 18px;
    color: $title;

    &::placeholder {
      color: $placeholder;
    }
  }

  &__toggle {
    flex: none;
    display: grid;
    place-items: center;
    width: 28px;
    height: 28px;
    padding: 0;
    border: 0;
    background: transparent;
    color: #3b4558;
    cursor: pointer;

    svg {
      width: 24px;
      height: 24px;
    }
  }

  &__error {
    width: 100%;
    margin: 0 0 4px;
    font-size: 15px;
    line-height: 1.4;
    text-align: center;
    color: $red;
  }

  &__submit {
    width: 100%;
    height: 67px;
    margin-top: 22px;
    border: 0;
    border-radius: 22px;
    background: $red;
    color: #fff;
    font: inherit;
    font-size: 21px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 8px 20px rgba($red, 0.22);
    transition: background 0.2s, transform 0.1s;

    &:hover {
      background: $red-dark;
    }

    &:active {
      transform: translateY(1px);
    }

    &:disabled {
      opacity: 0.6;
      cursor: default;
    }
  }

  &__link {
    margin-top: 24px;
    font-size: 18px;
    font-weight: 500;
    color: $red;
    text-decoration: underline;
    text-underline-offset: 3px;
  }
}
</style>