export function formatDate(iso?: string | null): string {
  if (!iso) return '—'
  const date = new Date(iso)
  return new Intl.DateTimeFormat('ar', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

export function formatDateTime(iso?: string | null): string {
  if (!iso) return '—'
  const date = new Date(iso)
  return new Intl.DateTimeFormat('ar', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function formatDuration(days: number | null | undefined): string {
  if (days == null || days == null) return '—'
  if (days < 1) {
    const hours = Math.round(days * 24)
    return `${hours} ساعة`
  }
  return `${days} يوم`
}

export function maskPhone(phone: string): string {
  if (phone.length <= 4) return phone
  return phone.slice(0, 2) + '****' + phone.slice(-2)
}