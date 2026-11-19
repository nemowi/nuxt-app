// entities/user/model/useAuth.ts
import type { User } from "../auth.api"

export const useAuth = () => {
  const token = useCookie<string | null>('auth_token', {
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'lax',
    secure: !import.meta.dev,
  })
  const user = useState<User | null>('auth_user', () => null)

  const isAuthed = computed(() => !!token.value)

  const setSession = (payload: { token: string; user: User }) => {
    token.value = payload.token
    user.value = payload.user
  }

  const logout = async () => {
    token.value = null
    user.value = null
    await navigateTo('/login')
  }

  return { token, user, isAuthed, setSession, logout }
}