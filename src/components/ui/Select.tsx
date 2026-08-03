import type { SelectHTMLAttributes } from 'react'

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  error?: string
  children: React.ReactNode
}

export default function Select({ label, error, children, className = '', ...props }: Props) {
  return (
    <div>
      <label className="label">{label}</label>
      <select className={`input ${error ? 'border-error' : ''} ${className}`} {...props}>
        {children}
      </select>
      {error && <p className="mt-1 text-sm text-error">{error}</p>}
    </div>
  )
}