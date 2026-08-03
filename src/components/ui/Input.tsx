import type { InputHTMLAttributes } from 'react'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export default function Input({ label, error, className = '', ...props }: Props) {
  return (
    <div>
      <label className="label">{label}</label>
      <input className={`input ${error ? 'border-error' : ''} ${className}`} {...props} />
      {error && <p className="mt-1 text-sm text-error">{error}</p>}
    </div>
  )
}