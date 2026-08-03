import type { TextareaHTMLAttributes } from 'react'

interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
}

export default function Textarea({ label, error, ...props }: Props) {
  return (
    <div>
      <label className="label">{label}</label>
      <textarea className={`input min-h-[120px] resize-y ${error ? 'border-error' : ''}`} {...props} />
      {error && <p className="mt-1 text-sm text-error">{error}</p>}
    </div>
  )
}