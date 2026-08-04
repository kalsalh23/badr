import { forwardRef, type TextareaHTMLAttributes } from 'react'

interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
}

const Textarea = forwardRef<HTMLTextAreaElement, Props>(function Textarea({ label, error, ...props }, ref) {
  return (
    <div>
      <label className="label">{label}</label>
      <textarea ref={ref} className={`input min-h-[120px] resize-y ${error ? 'border-error' : ''}`} {...props} />
      {error && <p className="mt-1 text-sm text-error">{error}</p>}
    </div>
  )
})

export default Textarea