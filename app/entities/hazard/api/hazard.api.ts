import { useAuth } from "~/entities/user/api/model/useAuth"

export interface HazardPoint {
  id: number
  title: string
  description: string | null
  latitude: number
  longitude: number
  danger_radius: number
  photo_path: string | null
  status: string
  created_by: number
  moderated_by: number | null
  created_at: string | null
  updated_at: string | null
}

export interface CheckHazardsPayload {
  lat: number
  lng: number
}

export interface CheckHazardsResponse {
  danger: boolean
  nearest_hazard: HazardPoint | null
  distance_to_nearest: number | null
  hazards: HazardPoint[]
}

export const checkHazards = (payload: CheckHazardsPayload) => {
  const api = useRuntimeConfig().public.apiUrl
  const { token } = useAuth()

  return $fetch<CheckHazardsResponse>(`${api}/api/hazards/check`, {
    method: 'POST',
    body: payload,
    headers: token.value ? { Authorization: `Bearer ${token.value}` } : {},
  })
}