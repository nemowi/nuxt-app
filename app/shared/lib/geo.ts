export interface LatLng {
  lat: number
  lng: number
}

const EARTH_RADIUS = 6371000
const rad = (deg: number) => (deg * Math.PI) / 180

/** Расстояние между двумя точками в метрах (формула гаверсинуса) */
export const distanceMeters = (a: LatLng, b: LatLng): number => {
  const dLat = rad(b.lat - a.lat)
  const dLng = rad(b.lng - a.lng)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_RADIUS * Math.asin(Math.sqrt(h))
}