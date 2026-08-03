import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BarChart3, ClipboardCheck, Clock, FileText, CheckCircle2, ArrowLeft } from 'lucide-react'
import { fetchAdminStats, fetchStatuses } from '@/services/adminService'
import type { Report, ReportStatus } from '@/types'
import Card from '@/components/ui/Card'
import Spinner from '@/components/ui/Spinner'
import StatusBadgeSingle from '@/components/ui/StatusBadge'
import { ADMIN_BASE } from '@/lib/constants'
import { formatDateTime, formatDuration } from '@/utils/format'

// عرض نوع الحالة بالاسم مباشرة عبر STATUS_META
function StatusBadge({ statusId, statuses }: { statusId: string; statuses: ReportStatus[] }) {
  const st = statuses.find((s) => s.id === statusId)
  if (!st) return null
  return <StatusBadgeSingle statusSlug={st.slug} />
}

export default function Dashboard() {
  const [reports, setReports] = useState<Report[]>([])
  const [statuses, setStatuses] = useState<ReportStatus[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([fetchAdminStats(), fetchStatuses()])
      .then(([r, s]) => {
        setReports(r)
        setStatuses(s)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner className="h-10 w-10" />

  const bySlug = (slug: string) => {
    const st = statuses.find((s) => s.slug === slug)
    if (!st) return 0
    return reports.filter((r) => r.status_id === st.id).length
  }

  const avgDays =
    reports.length > 0
      ? reports.filter((r) => r.resolved_at).reduce((sum, r) => {
          const diff = new Date(r.resolved_at!).getTime() - new Date(r.created_at).getTime()
          return sum + diff / 86400000
        }, 0) /
        reports.filter((r) => r.resolved_at).length
      : 0

  const cards = [
    { label: 'إجمالي البلاغات', value: reports.length, icon: FileText, color: '#054239' },
    { label: 'جديدة', value: bySlug('new'), icon: ClipboardCheck, color: '#B9A779' },
    { label: 'قيد التنفيذ', value: bySlug('in_review') + bySlug('in_progress'), icon: Clock, color: '#988561' },
    { label: 'منجزة', value: bySlug('completed'), icon: CheckCircle2, color: '#1E7A4C' },
  ]

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-ink">لوحة المعلومات</h1>
          <p className="text-sm text-ink-secondary">نظرة عامة على بلاغات المدينة.</p>
        </div>
      </div>

      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="card p-5">
            <div
              className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl text-white"
              style={{ backgroundColor: card.color }}
            >
              <card.icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-black">{card.value}</p>
            <p className="text-sm font-bold text-ink-secondary">{card.label}</p>
          </div>
        ))}
      </div>

      {/* متوسط مدة الإنجاز */}
      <Card className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface text-brand">
            <BarChart3 className="h-6 w-6" />
          </div>
          <div>
            <p className="font-black">متوسط مدة الإنجاز</p>
            <p className="text-sm text-ink-secondary">من استلام البلاغ حتى إنجازه</p>
          </div>
        </div>
        <p className="text-2xl font-black text-brand">
          {reports.some((r) => r.resolved_at)
            ? formatDuration(avgDays)
            : '—'}
        </p>
      </Card>

      {/* أحدث البلاغات */}
      <Card
        title="أحدث البلاغات"
        subtitle="آخر البلاغات الواردة"
      >
        {reports.length === 0 ? (
          <p className="py-6 text-center text-ink-secondary">لا توجد بلاغات بعد.</p>
        ) : (
          <div className="divide-y divide-brand/10">
            {reports.slice(0, 5).map((report) => (
              <div key={report.id} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="truncate font-bold text-ink">{report.title}</p>
                  <p className="text-xs text-ink-muted" dir="ltr">
                    {report.report_number} • {formatDateTime(report.created_at)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <StatusBadge statusId={report.status_id} statuses={statuses} />
                  <Link
                    to={`${ADMIN_BASE}/reports/${report.id}`}
                    className="flex items-center gap-1 text-sm font-bold text-brand hover:text-brand-hover"
                  >
                    فتح
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
        <Link to={`${ADMIN_BASE}/reports`} className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-brand hover:text-brand-hover">
          عرض جميع البلاغات
          <ArrowLeft className="h-4 w-4" />
        </Link>
      </Card>
    </div>
  )
}