import { useEffect, useMemo, useState } from 'react'
import { ListFilter, MapPin } from 'lucide-react'
import { fetchReportLocations } from '@/services/reportService'
import type { PublicReportLocation } from '@/types'
import MapView from '@/components/map/Map'
import Spinner from '@/components/ui/Spinner'

interface MarkerWithType extends PublicReportLocation {}

export default function ReportsMap() {
  const [locations, setLocations] = useState<MarkerWithType[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchReportLocations()
      .then(setLocations)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    if (filter === 'all') return locations
    return locations.filter((l) => l.status_slug === filter)
  }, [locations, filter])

  const types = useMemo(() => {
    const map = new Map<string, number>()
    locations.forEach((l) => map.set(l.type_name, (map.get(l.type_name) || 0) + 1))
    return [...map.entries()]
  }, [locations])

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-card bg-brand text-white">
          <MapPin className="h-7 w-7" />
        </div>
        <h1 className="text-3xl font-black text-ink">خريطة البلاغات</h1>
        <p className="mt-2 text-ink-secondary">
          مواقع البلاغات الواردة من المواطنين في مدينة طيبة الإمام.
        </p>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          {/* القائمة الجانبية */}
          <div className="card p-5">
            <div className="mb-4 flex items-center gap-2">
              <ListFilter className="h-5 w-5 text-gold" />
              <h3 className="text-lg font-black">الفلترة</h3>
            </div>

            <div className="mb-6 space-y-1">
              {[
                { slug: 'all', label: 'جميع البلاغات' },
                { slug: 'new', label: 'جديد' },
                { slug: 'in_review', label: 'قيد المراجعة' },
                { slug: 'in_progress', label: 'قيد التنفيذ' },
                { slug: 'completed', label: 'تم الإنجاز' },
                { slug: 'closed', label: 'مغلق' },
              ].map((f) => (
                <button
                  key={f.slug}
                  onClick={() => setFilter(f.slug)}
                  className={`flex w-full items-center justify-between rounded-xl px-4 py-2 text-sm font-bold transition ${
                    filter === f.slug ? 'bg-brand text-white' : 'text-ink-secondary hover:bg-surface'
                  }`}
                >
                  {f.label}
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      filter === f.slug ? 'bg-white/20' : 'bg-surface'
                    }`}
                  >
                    {f.slug === 'all'
                      ? locations.length
                      : locations.filter((l) => l.status_slug === f.slug).length}
                  </span>
                </button>
              ))}
            </div>

            <p className="label">حسب نوع البلاغ</p>
            <ul className="space-y-1 text-sm">
              {types.map(([name, count]) => (
                <li
                  key={name}
                  className="flex justify-between rounded-lg bg-surface/50 px-3 py-2"
                >
                  <span className="font-bold">{name}</span>
                  <span className="font-black text-brand">{count}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* الخريطة */}
          <div className="space-y-4">
            <MapView
              className="h-[560px]"
              markers={filtered.map((l) => ({
                lat: l.lat,
                lng: l.lng,
                title: l.title,
                subtitle: `${l.report_number} • ${l.type_name} • ${l.status_name}`,
              }))}
            />
            <p className="text-sm text-ink-muted" dir="rtl">
              يعرض الخريطة {filtered.length} بلاغاً. اضغط على أي علامة لعرض التفاصيل.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}