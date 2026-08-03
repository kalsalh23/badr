import { useEffect, useState } from 'react'
import { ImagePlus, X } from 'lucide-react'

interface Props {
  files: File[]
  setFiles: (files: File[]) => void
  title?: string
  hint?: string
}

export default function ImageUploader({ files, setFiles, title, hint }: Props) {
  const [previews, setPreviews] = useState<string[]>([])

  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f))
    setPreviews(urls)
    return () => urls.forEach((u) => URL.revokeObjectURL(u))
  }, [files])

  function handleAdd(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files || [])
    setFiles([...files, ...selected].slice(0, 5))
    e.target.value = ''
  }

  function handleRemove(index: number) {
    setFiles(files.filter((_, i) => i !== index))
  }

  return (
    <div>
      <label className="label">{title || 'صور البلاغ (اختياري)'}</label>
      <p className="-mt-2 mb-3 text-xs text-ink-muted">
        {hint || 'يمكنك رفع ما يصل إلى 5 صور. يتم ضغط الصور تلقائياً قبل الرفع.'}
      </p>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {previews.map((src, i) => (
          <div key={src} className="relative aspect-square overflow-hidden rounded-card border border-brand/10">
            <img src={src} alt={`صورة ${i + 1}`} className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => handleRemove(i)}
              className="absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-error text-white"
              aria-label="حذف الصورة"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}

        {files.length < 5 && (
          <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed border-brand/30 text-brand transition hover:border-brand hover:bg-brand/5">
            <ImagePlus className="h-7 w-7" />
            <span className="text-xs font-bold">إضافة صورة</span>
            <input type="file" accept="image/*" multiple onChange={handleAdd} className="hidden" />
          </label>
        )}
      </div>
    </div>
  )
}