import { forwardRef, type ReactNode, type SelectHTMLAttributes } from 'react'

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  error?: string
  children: ReactNode
}

const Select = forwardRef<HTMLSelectElement, Props>(function Select({ label, error, children, className = '', ...props }, ref) {
  return (
    <div>
      <label className="label">{label}</label>
      <select ref={ref} className={`input ${error ? 'border-error' : ''} ${className}`} {...props}>
        {children}
      </select>
      {error && <p className="mt-1 text-sm text-error">{error}</p>}
    </div>
  )
})

export default Select