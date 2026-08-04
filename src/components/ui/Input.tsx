import { forwardRef, type InputHTMLAttributes } from 'react'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, Props>(function Input({ label, error, className = '', ...props }, ref) {
  return (
    <div>
      <label className="label">{label}</label>
      <input ref={ref} className={`input ${error ? 'border-error' : ''} ${className}`} {...props} />
      {error && <p className="mt-1 text-sm text-error">{error}</p>}
    </div>
  )
})

export default Input
