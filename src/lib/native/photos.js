import { Capacitor } from '@capacitor/core'

/**
 * Pick one or more images. On native (Capacitor) this uses the Camera plugin
 * (system camera / photo library). On web it uses the same hidden-file-input UX.
 * @param {{ multiple?: boolean }} [opts]
 * @returns {Promise<File[]>} empty array if the user cancels
 */
export async function selectImages ({ multiple = false } = {}) {
  if (Capacitor.isNativePlatform()) {
    return selectNativeImages(multiple)
  }
  return selectWebImages(multiple)
}

async function selectNativeImages (multiple) {
  const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera')

  try {
    if (multiple) {
      const result = await Camera.pickImages({ quality: 90, limit: 20 })
      const files = await Promise.all((result.photos || []).map(photoToFile))
      return files.filter(Boolean)
    }

    const photo = await Camera.getPhoto({
      quality: 90,
      resultType: CameraResultType.Uri,
      source: CameraSource.Prompt,
      saveToGallery: false
    })
    const file = await photoToFile(photo)
    return file ? [file] : []
  } catch (error) {
    if (isCancel(error)) return []
    throw error
  }
}

async function photoToFile (photo) {
  const src = photo?.webPath
  if (!src) return null
  const response = await fetch(src)
  const blob = await response.blob()
  const ext = photo.format || 'jpeg'
  const type = blob.type || `image/${ext}`
  return new File([blob], `photo.${ext}`, { type, lastModified: Date.now() })
}

function selectWebImages (multiple) {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.multiple = multiple
    input.onchange = () => resolve(Array.from(input.files || []))
    input.oncancel = () => resolve([])
    input.click()
  })
}

function isCancel (error) {
  const message = String(error?.message || error || '')
  return /cancel|dismiss|user cancelled/i.test(message)
}
