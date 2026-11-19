import { createHazard } from '~/entities/hazard/api/hazard.api'
import { GeoError, getCurrentPosition } from '~/shared/lib/getPosition'

const MAX_PHOTO_BYTES = 5120 * 1024 // лимит бэка: 5120 КБ

// Laravel отдаёт ошибки валидации (422) в data.errors
const getErrorMessage = (error: any): string => {
  if (error instanceof GeoError) return error.message
  const errors = error?.data?.errors
  if (errors) return Object.values(errors).flat()[0] as string
  return error?.data?.message || 'Не удалось отправить репорт'
}

export const useReportForm = () => {
  const form = reactive({ title: '', description: '' })
  const photo = shallowRef<File | null>(null)
  const photoPreview = ref<string | null>(null)

  const isLoading = ref(false)
  const errorMessage = ref('')
  const successMessage = ref('')

  const revokePreview = () => {
    if (photoPreview.value) URL.revokeObjectURL(photoPreview.value)
    photoPreview.value = null
  }

  const removePhoto = () => {
    revokePreview()
    photo.value = null
  }

  const setPhoto = (file: File | null) => {
    errorMessage.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      errorMessage.value = 'Выберите изображение'
      return
    }
    if (file.size > MAX_PHOTO_BYTES) {
      errorMessage.value = 'Фото больше 5 МБ'
      return
    }
    revokePreview()
    photo.value = file
    photoPreview.value = URL.createObjectURL(file)
  }

  const reset = () => {
    form.title = ''
    form.description = ''
    removePhoto()
  }

  const submit = async () => {
    errorMessage.value = ''
    successMessage.value = ''

    if (!form.title.trim()) {
      errorMessage.value = 'Введите название опасности'
      return
    }

    isLoading.value = true
    try {
      // координаты берём один раз — в момент отправки
      const pos = await getCurrentPosition()

      const body = new FormData()
      body.append('title', form.title.trim())
      if (form.description.trim()) body.append('description', form.description.trim())
      body.append('latitude', String(pos.lat))
      body.append('longitude', String(pos.lng))
      if (photo.value) body.append('photo', photo.value)

      await createHazard(body)

      successMessage.value = 'Репорт отправлен на проверку'
      reset()
    } catch (error) {
      errorMessage.value = getErrorMessage(error)
    } finally {
      isLoading.value = false
    }
  }

  onBeforeUnmount(revokePreview)

  return {
    form,
    photoPreview,
    isLoading,
    errorMessage,
    successMessage,
    setPhoto,
    removePhoto,
    submit,
  }
  
}