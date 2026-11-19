<template>
  <main class="register-page">
    <div class="register-page__content">
      <img class="register-page__logo" :src="logo" alt="РЖД" />

      <header class="register-page__header">
        <h1 class="register-page__title">Регистрация</h1>
        <p class="register-page__subtitle">
          Создайте учётную запись<br />для работы с сервисом
        </p>
      </header>

      <form class="register-form" novalidate @submit.prevent="onSubmit">
        <!-- Имя -->
        <label class="register-form__field">
          <svg class="register-form__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="8" r="3.5" />
            <path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6" />
          </svg>
          <input
            v-model="form.name"
            class="register-form__input"
            type="text"
            placeholder="Имя"
            autocomplete="name"
          />
        </label>

        <!-- Почта -->
        <label class="register-form__field">
          <svg class="register-form__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="3.5" y="5.5" width="17" height="13" rx="3" />
            <path d="M4.5 8.5l7.5 5 7.5-5" />
          </svg>
          <input
            v-model="form.email"
            class="register-form__input"
            type="email"
            placeholder="Почта"
            autocomplete="email"
          />
        </label>

        <!-- Пароль -->
        <label class="register-form__field">
          <svg class="register-form__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="5" y="10.5" width="14" height="10" rx="3" />
            <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
            <circle cx="12" cy="15.5" r="0.8" fill="currentColor" />
          </svg>
          <input
            v-model="form.password"
            class="register-form__input"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Пароль"
            autocomplete="new-password"
          />
          <button
            class="register-form__toggle"
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

        <!-- Подтверждение пароля -->
        <label class="register-form__field">
          <svg class="register-form__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="5" y="10.5" width="14" height="10" rx="3" />
            <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
            <circle cx="12" cy="15.5" r="0.8" fill="currentColor" />
          </svg>
          <input
            v-model="form.passwordConfirm"
            class="register-form__input"
            :type="showPasswordConfirm ? 'text' : 'password'"
            placeholder="Подтвердите пароль"
            autocomplete="new-password"
          />
          <button
            class="register-form__toggle"
            type="button"
            :aria-label="showPasswordConfirm ? 'Скрыть пароль' : 'Показать пароль'"
            @click="showPasswordConfirm = !showPasswordConfirm"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
              <circle cx="12" cy="12" r="3" />
              <path v-if="!showPasswordConfirm" d="M4 4l16 16" />
            </svg>
          </button>
        </label>

        <p v-if="errorMessage" class="register-form__error" role="alert">{{ errorMessage }}</p>

        <button class="register-form__submit" type="submit" :disabled="isLoading">
          Зарегистрироваться
        </button>

        <NuxtLink class="register-form__link" to="/login">Войти</NuxtLink>
      </form>
    </div>

    <img class="register-page__bg" :src="railway" alt="" aria-hidden="true" />
  </main>
</template>

<script setup>
import logo from '~/common/icon/logo.svg'
import railway from '~/common/icon/railway-bottom.svg'
import { registration } from '~/entities/user/api/auth.api'

definePageMeta({ layout: 'auth' })

const form = reactive({
  name: '',
  email: '',
  password: '',
  passwordConfirm: '',
})

const showPassword = ref(false)
const showPasswordConfirm = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')

const getErrorMessage = (error, fallback) => {
  const errors = error?.data?.errors
  if (errors) return Object.values(errors).flat()[0]
  return error?.data?.message || fallback
}

const onSubmit = async () => {
  errorMessage.value = ''

  if (!form.name.trim()) {
    errorMessage.value = 'Введите имя'
    return
  }
  if (!form.email.trim()) {
    errorMessage.value = 'Введите почту'
    return
  }
  if (!form.password) {
    errorMessage.value = 'Введите пароль'
    return
  }
  if (form.password !== form.passwordConfirm) {
    errorMessage.value = 'Пароли не совпадают'
    return
  }

  isLoading.value = true
  try {
    await registration({
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
    })
    await navigateTo('/login')
  } catch (error) {
    errorMessage.value = getErrorMessage(error, 'Не удалось зарегистрироваться')
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

.register-page {
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
    padding: 55px 40px;
  }

  &__logo {
    width: 132px;
    height: auto;
    margin-bottom: 40px;
  }

  &__header {
    text-align: center;
    margin-bottom: 36px;
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

.register-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;

  &__field {
    display: flex;
    align-items: center;
    gap: 14px;
    width: 100%;
    height: 62px;
    margin-bottom: 18px;
    padding: 0 20px;
    background: #fff;
    border: 1.5px solid $border;
    border-radius: 20px;
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
    height: 62px;
    margin-top: 12px;
    border: 0;
    border-radius: 20px;
    background: $red;
    color: #fff;
    font: inherit;
    font-size: 19px;
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
    margin-top: 15px;
    font-size: 17px;
    font-weight: 500;
    color: $red;
    text-decoration: underline;
    text-underline-offset: 3px;
  }
}
</style>