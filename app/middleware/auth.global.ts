import { useAuth } from "~/entities/user/api/model/useAuth"

const PUBLIC_PAGES = ['/login', '/register']

export default defineNuxtRouteMiddleware((to) => {
  const {isAuthed} = useAuth();
  const isPublic = PUBLIC_PAGES.includes(to.path)

  // не авторизован и идёт на закрытую страницу → на вход
  if (!isAuthed.value && !isPublic) {
    return navigateTo('/login')
  }

  // уже авторизован и открывает вход/регистрацию → на главную
  if (isAuthed.value && isPublic) {
    return navigateTo('/')
  }
})