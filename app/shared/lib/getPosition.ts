import type { LatLng } from './geo'

/** Ошибка геолокации с текстом, который можно показать пользователю */
export class GeoError extends Error {}

/** Разовое получение текущих координат (в отличие от watchPosition) */
export const getCurrentPosition = (): Promise<LatLng & { accuracy: number }> =>
  new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new GeoError('Геолокация не поддерживается'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (p) =>
        resolve({
          lat: p.coords.latitude,
          lng: p.coords.longitude,
          accuracy: p.coords.accuracy,
        }),
      (e) =>
        reject(
          new GeoError(
            e.code === e.PERMISSION_DENIED
              ? 'Нет доступа к геолокации'
              : 'Не удалось определить местоположение',
          ),
        ),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 },
    )
  })