import { AlertCircle, CheckCircle2, Info } from 'lucide-react'
import type { ReactNode } from 'react'

type Tone = 'success' | 'error' | 'info'

interface Props {
  tone?: Tone
  children: ReactNode
}

const styles: Record<Tone, { bg: string; text: string; icon: ReactNode }> = {
  success: {
    bg: 'bg-success/10 border-success/30',
    text: 'text-success',
    icon: <CheckCircle2 className="h-5 w-5" />,
  },
  error: {
    bg: 'bg-error/10 border-error/30',
    text: 'text-error',
    icon: <AlertCircle className="h-5 w-5" />,
  },
  info: {
    bg: 'bg-brand/10 border-brand/30',
    text: 'text-brand',
    icon: <Info className="h-5 w-5" />,
  },
}

export default function Alert({ tone = 'info', children }: Props) {
  const s = styles[tone]
  return (
    <div
      className={`flex items-start gap-3 rounded-card border p-4 text-sm ${s.bg}`}
      role="alert"
    >
      <span className={`mt-0.5 ${s.text}`}>{s.icon}</span>
      <div className={`font-semibold ${s.text}`}>{children}</div>
    </div>
  )
}