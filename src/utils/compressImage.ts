/**
 * ضغط الصور قبل رفعها إلى التخزين.
 * يحوّل الصورة إلى تنسيق WebP بحجم أقصى ويضغطها بمستوى جودة 0.7.
 */
export const MAX_IMAGE_DIMENSION = 1280
export const IMAGE_QUALITY = 0.7

const SUPPORTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export async function compressImage(file: File): Promise<File> {
  if (!SUPPORTED_TYPES.includes(file.type)) {
    return file
  }

  const bitmap = await createImageBitmap(file)
  let width = bitmap.width
  let height = bitmap.height

  if (Math.max(width, height) > MAX_IMAGE_DIMENSION) {
    const ratio = MAX_IMAGE_DIMENSION / Math.max(width, height)
    width = Math.round(width * ratio)
    height = Math.round(height * ratio)
  }

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return file

  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  return new Promise<File>((resolve) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          resolve(file)
          return
        }
        const name = file.name.replace(/\.[^.]+$/, '.webp')
        resolve(new File([blob], name, { type: blob.type, lastModified: Date.now() }))
      },
      'image/webp',
      IMAGE_QUALITY
    )
  })
}

export async function compressMultiple(files: File[]): Promise<File[]> {
  const results = await Promise.all(files.map((f) => compressImage(f)))
  return results.filter((f): f is File => Boolean(f))
}