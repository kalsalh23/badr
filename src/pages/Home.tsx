import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BarChart3, FileText, Info, MapPin, Clock, ClipboardCheck, CheckCircle } from 'lucide-react'
import { fetchPublicStats, fetchReportLocations } from '@/services/reportService'
import type { PublicReportLocation, PublicStats } from '@/types'
import { MUNICIPALITY_NAME, PLATFORM_NAME, MEDIA_SPONSOR } from '@/lib/constants'
import MapView from '@/components/map/Map'
import Spinner from '@/components/ui/Spinner'
import { formatDuration } from '@/utils/format'

const statsCards: {
  key: keyof PublicStats
  label: string
  icon: typeof FileText
}[] = [
  { key: 'total', label: 'إجمالي البلاغات', icon: FileText },
  { key: 'new', label: 'البلاغات الجديدة', icon: ClipboardCheck },
  { key: 'in_progress', label: 'قيد التنفيذ', icon: Clock },
  { key: 'completed', label: 'تم الإنجاز', icon: CheckCircle },
  { key: 'avg_resolution_days', label: 'متوسط مدة الإنجاز', icon: BarChart3 },
]

export default function Home() {
  const [stats, setStats] = useState<PublicStats | null>(null)
  const [locations, setLocations] = useState<PublicReportLocation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    Promise.all([fetchPublicStats(), fetchReportLocations()])
      .then(([s, l]) => {
        if (!mounted) return
        setStats(s)
        setLocations(l)
      })
      .catch(() => {})
      .finally(() => mounted && setLoading(false))
    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="space-y-12">
      {/* البطل */}
      <section className="rounded-card bg-brand p-8 text-center text-white md:p-14">
        <p className="mx-auto mb-4 flex w-fit items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-sm font-bold">
          <span className="h-2 w-2 rounded-full bg-gold" />
          {MEDIA_SPONSOR}
        </p>
        <h1 className="text-4xl font-black md:text-6xl">{PLATFORM_NAME}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-white/90 md:text-lg">
          منصة رسمية مقدمة من {MUNICIPALITY_NAME} لاستقبال بلاغات المواطنين ومتابعة معالجتها.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to="/report" className="btn-gold w-full sm:w-auto">
            إرسال بلاغ
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link to="/about" className="btn w-full border-2 border-white/30 text-white hover:border-white hover:bg-white hover:text-brand sm:w-auto">
            من نحن
            <Info className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* بطاقات الإحصائيات */}
      <section>
        <div className="mb-6 flex items-center gap-3">
          <BarChart3 className="h-6 w-6 text-gold" />
          <h2 className="text-2xl font-black text-ink">إحصائيات البلاغات</h2>
        </div>
        {loading ? (
          <Spinner />
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            {statsCards.map((card) => (
              <div key={card.key} className="card p-5 text-center">
                <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-surface text-brand">
                  <card.icon className="h-5 w-5" />
                </div>
                <p className="text-3xl font-black text-brand">
                  {card.key === 'avg_resolution_days'
                    ? formatDuration(stats?.[card.key])
                    : stats?.[card.key] ?? '—'}
                </p>
                <p className="mt-1 text-sm font-bold text-ink-secondary">{card.label}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* خريطة المدينة */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MapPin className="h-6 w-6 text-gold" />
            <h2 className="text-2xl font-black text-ink">خريطة البلاغات</h2>
          </div>
          <Link to="/map" className="text-sm font-bold text-brand hover:text-brand-hover">
            عرض الخريطة كاملة ←
          </Link>
        </div>
        <MapView
          className="h-[420px]"
          markers={locations.map((l) => ({
            lat: l.lat,
            lng: l.lng,
            title: l.title,
            subtitle: `${l.type_name} • ${l.status_name}`,
          }))}
        />
      </section>
    </div>
  )
}