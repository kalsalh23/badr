import { STATUS_META } from '@/lib/constants'

interface Props {
  statusSlug: string
}

export default function StatusBadge({ statusSlug }: Props) {
  const meta = STATUS_META[statusSlug]
  if (!meta) return null
  return (
    <span
      className="chip"
      style={{ backgroundColor: `${meta.color}1A`, color: meta.color }}
    >
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: meta.color }} />
      {meta.label}
    </span>
  )
}