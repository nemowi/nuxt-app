export interface User {
  id: number
  name: string
  email: string
  email_verified_at: string | null
  role: string
  created_at: string | null
  updated_at: string | null
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface AuthResponse {
  user: User
  token: string
}

export const registration = (payload: RegisterPayload) => {
  const api = useRuntimeConfig().public.apiUrl
  return $fetch<AuthResponse>(`${api}/api/register`, {
    method: 'POST',
    body: payload,
  })
}

export const login = (payload: LoginPayload) => {
  const api = useRuntimeConfig().public.apiUrl
  return $fetch<AuthResponse>(`${api}/api/login`, {
    method: 'POST',
    body: payload,
  })
}