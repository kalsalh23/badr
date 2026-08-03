interface Props {
  className?: string
}

export default function Spinner({ className = 'h-8 w-8' }: Props) {
  return (
    <div role="status" aria-label="جارٍ التحميل" className="flex justify-center py-10">
      <div
        className={`animate-spin rounded-full border-4 border-brand/20 border-t-brand ${className}`}
      />
    </div>
  )
}