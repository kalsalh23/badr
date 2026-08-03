import { useEffect, useState } from 'react'
import { BarChart3, Clock, ClipboardCheck, FileText, CheckCircle2, Loader } from 'lucide-react'
import { fetchPublicStats } from '@/services/reportService'
import type { PublicStats } from '@/types'
import Spinner from '@/components/ui/Spinner'
import { formatDuration } from '@/utils/format'

export default function Statistics() {
  const [stats, setStats] = useState<PublicStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPublicStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const items = [
    { label: 'إجمالي البلاغات', value: stats?.total, icon: FileText, color: '#054239' },
    { label: 'البلاغات الجديدة', value: stats?.new, icon: ClipboardCheck, color: '#B9A779' },
    { label: 'قيد التنفيذ', value: stats?.in_progress, icon: Loader, color: '#988561' },
    { label: 'تم الإنجاز', value: stats?.completed, icon: CheckCircle2, color: '#1E7A4C' },
    { label: 'متوسط مدة الإنجاز', value: stats ? formatDuration(stats.avg_resolution_days) : '—', icon: Clock, color: '#6B1F2A' },
  ]

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-card bg-brand text-white">
          <BarChart3 className="h-7 w-7" />
        </div>
        <h1 className="text-3xl font-black text-ink">إحصائيات البلاغات</h1>
        <p className="mt-2 text-ink-secondary">
          نظرة عامة على بلاغات المواطنين في مدينة طيبة الإمام.
        </p>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <div key={item.label} className="card p-6 text-center">
                <div
                  className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl text-white"
                  style={{ backgroundColor: item.color }}
                >
                  <item.icon className="h-6 w-6" />
                </div>
                <p className="text-3xl font-black text-ink">{item.value ?? '—'}</p>
                <p className="mt-1 text-sm font-bold text-ink-secondary">{item.label}</p>
              </div>
            ))}
          </div>

          {/* شريط التقدم النسبي */}
          <div className="card mt-8 p-6">
            <h3 className="mb-5 text-lg font-black text-ink">توزيع البلاغات حسب الحالة</h3>
            <div className="space-y-4">
              {[
                { label: 'جديد', value: stats?.new ?? 0, color: '#B9A779' },
                { label: 'قيد التنفيذ', value: stats?.in_progress ?? 0, color: '#988561' },
                { label: 'تم الإنجاز', value: stats?.completed ?? 0, color: '#1E7A4C' },
              ].map((row) => {
                const total = stats?.total || 1
                const pct = Math.round((row.value / total) * 100)
                return (
                  <div key={row.label}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="font-bold">{row.label}</span>
                      <span className="font-bold text-ink-secondary">{row.value}</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-surface">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: row.color }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}