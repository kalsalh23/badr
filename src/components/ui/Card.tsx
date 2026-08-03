import { type ReactNode } from 'react'

interface Props {
  title?: string
  subtitle?: string
  children: ReactNode
  className?: string
}

export default function Card({ title, subtitle, children, className = '' }: Props) {
  return (
    <div className={`card p-6 ${className}`}>
      {(title || subtitle) && (
        <div className="mb-5">
          {title && <h3 className="text-xl font-bold text-ink">{title}</h3>}
          {subtitle && <p className="mt-1 text-sm text-ink-secondary">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  )
}