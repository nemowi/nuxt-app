import { useAuth } from '~/entities/user/api/model/useAuth'

export default defineNuxtPlugin(() => {
  const { token, logout } = useAuth()

  globalThis.$fetch = $fetch.create({
    onRequest({ options }) {
      if (token.value) {
        options.headers = new Headers(options.headers)
        options.headers.set('Authorization', `Bearer ${token.value}`)
      }
    },
    async onResponseError({ response }) {
      if (response.status === 401) await logout()
    },
  })
})