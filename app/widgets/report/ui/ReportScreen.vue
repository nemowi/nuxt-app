<template>
  <section class="report">
    <header class="report__header">
      <img class="report__logo" :src="logo" alt="РЖД" />
    </header>

    <form class="report__form" novalidate @submit.prevent="submit">
      <h1 class="report__title">Новый репорт</h1>
      <p class="report__subtitle">Сообщите об опасности на пути</p>

      <!-- Фото -->
      <input
        ref="fileInput"
        class="report__file"
        type="file"
        accept="image/*"
        @change="onFileChange"
      />
      <button class="report__photo" type="button" @click="fileInput?.click()">
        <img v-if="photoPreview" class="report__preview" :src="photoPreview" alt="Фото опасности" />
        <template v-else>
          <svg class="report__camera" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M5 11.5A2.5 2.5 0 0 1 7.5 9H10l1.6-2.5h8.8L22 9h2.5a2.5 2.5 0 0 1 2.5 2.5v11A2.5 2.5 0 0 1 24.5 25h-17A2.5 2.5 0 0 1 5 22.5z" />
            <circle cx="16" cy="16.5" r="4" />
          </svg>
          <span class="report__photo-label">Добавить фото</span>
        </template>
      </button>
      <button v-if="photoPreview" class="report__photo-remove" type="button" @click="removePhoto">
        Убрать фото
      </button>

      <!-- Название -->
      <label class="report__label" for="report-title">Название опасности</label>
      <input
        id="report-title"
        v-model="form.title"
        class="report__input"
        type="text"
        maxlength="30"
        placeholder="Например, упавшее дерево"
        autocomplete="off"
      />

      <!-- Описание -->
      <label class="report__label" for="report-description">Описание</label>
      <textarea
        id="report-description"
        v-model="form.description"
        class="report__input report__input--area"
        rows="3"
        placeholder="Опишите место и обстоятельства…"
      />
      
      <!--
       <p v-if="errorMessage" class="report__message report__message--error" role="alert">
        {{ errorMessage }}
      </p>
      <p v-if="successMessage" class="report__message report__message--success" role="status">
        {{ successMessage }}
      </p>
      -->
     
      <button class="report__submit" type="submit" :disabled="isLoading">
        <svg class="report__send" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z" />
        </svg>
        {{ isLoading ? 'Отправка…' : 'Отправить' }}
      </button>
    </form>
  </section>

</template>

<script setup>
import logo from '~/common/icon/logo.svg'
import { useReportForm } from '~/widgets/report/model/useReportForm'

const { form, photoPreview, isLoading, errorMessage, successMessage, setPhoto, removePhoto, submit } =
  useReportForm()

const fileInput = ref(null)

const onFileChange = (event) => {
  setPhoto(event.target.files?.[0] ?? null)
  event.target.value = '' // чтобы можно было выбрать тот же файл повторно
}

</script>

<style lang="scss" scoped>
$red: #f0261c;
$red-dark: #d81f16;
$title: #0f172a;
$text: #475569;
$placeholder: #8b94a7;
$border: #dfe4ec;

.report {
  max-width: 550px;
  margin: 0 auto;
  padding: 0;
  font-family: 'Inter', 'SF Pro Display', -apple-system, 'Segoe UI', Roboto, sans-serif;

  &__header {
    padding-top: 0px;
  }

  &__logo {
    width: 88px;
    height: auto;
  }

  &__form {
    display: flex;
    flex-direction: column;
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
    margin: 0 0 22px;
    font-size: 18px;
    color: $text;
  }

  &__file {
    display: none;
  }

  &__photo {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    width: 100%;
    height: 160px;
    padding: 0;
    overflow: hidden;
    border: 0;
    border-radius: 22px;
    background: #e9ecf2;
    color: #4b5568;
    font: inherit;
    cursor: pointer;
  }

  &__camera {
    width: 48px;
    height: 48px;
  }

  &__photo-label {
    font-size: 17px;
    font-weight: 500;
  }

  &__preview {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__photo-remove {
    align-self: flex-start;
    margin-top: 8px;
    padding: 0;
    border: 0;
    background: none;
    font: inherit;
    font-size: 15px;
    color: $red;
    text-decoration: underline;
    cursor: pointer;
  }

  &__label {
    margin: 22px 0 8px;
    font-size: 17px;
    font-weight: 700;
    color: $title;
  }

  &__input {
    width: 90%;
    height: 56px;
    padding: 0 20px;
    border: 1.5px solid $border;
    border-radius: 18px;
    outline: 0;
    background: #fff;
    font: inherit;
    font-size: 17px;
    color: $title;
    transition: border-color 0.2s, box-shadow 0.2s;

    &::placeholder {
      color: $placeholder;
    }

    &:focus {
      border-color: $red;
      box-shadow: 0 0 0 3px rgba($red, 0.12);
    }

    &--area {
      height: auto;
      min-height: 92px;
      padding: 16px 20px;
      resize: none;
    }
  }

  &__message {
    margin: 16px 0 0;
    font-size: 15px;
    line-height: 1.4;
    text-align: center;

    &--error {
      color: $red;
    }

    &--success {
      color: #1f9d55;
    }
  }

  &__submit {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    width: 100%;
    height: 60px;
    margin-top: 22px;
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

  &__send {
    width: 26px;
    height: 26px;
  }

  &__note {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin: 18px 0 0;
    font-size: 14px;
    line-height: 1.4;
    color: $text;
  }

  &__info {
    flex: none;
    width: 22px;
    height: 22px;
  }
}
</style>