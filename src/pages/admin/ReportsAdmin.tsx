import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ClipboardList, Search } from 'lucide-react'
import { fetchAdminStats, fetchStatuses } from '@/services/adminService'
import type { Report, ReportStatus } from '@/types'
import Card from '@/components/ui/Card'
import Spinner from '@/components/ui/Spinner'
import StatusBadge from '@/components/ui/StatusBadge'
import { ADMIN_BASE, SEVERITY_META } from '@/lib/constants'
import { formatDateTime } from '@/utils/format'

export default function ReportsAdmin() {
  const [reports, setReports] = useState<Report[]>([])
  const [statuses, setStatuses] = useState<ReportStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    Promise.all([fetchAdminStats(), fetchStatuses()])
      .then(([r, s]) => {
        setReports(r)
        setStatuses(s)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    return reports.filter((r) => {
      const matchesSearch =
        !search ||
        r.title.includes(search) ||
        r.report_number.includes(search) ||
        r.citizen_name.includes(search)
      const matchesStatus =
        statusFilter === 'all' || r.status_id === statusFilter
      return matchesSearch && matchesStatus
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reports, search, statusFilter])

  const statusById = (id: string) => statuses.find((s) => s.id === id)

  if (loading) return <Spinner className="h-10 w-10" />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-ink">إدارة البلاغات</h1>
        <p className="text-sm text-ink-secondary">عرض وإدارة جميع بلاغات المواطنين.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالرقم، الاسم، أو العنوان..."
            className="input pr-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input sm:w-56"
        >
          <option value="all">جميع الحالات</option>
          {statuses.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <Card>
        {filtered.length === 0 ? (
          <p className="flex flex-col items-center gap-2 py-12 text-ink-secondary">
            <ClipboardList className="h-10 w-10 text-gold" />
            لا توجد بلاغات مطابقة.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-brand/10 text-right text-xs font-black text-ink-secondary">
                  <th className="pb-3 pl-4">رقم البلاغ</th>
                  <th className="pb-3 pl-4">الموضوع</th>
                  <th className="pb-3 pl-4">مقدم البلاغ</th>
                  <th className="pb-3 pl-4">الخطورة</th>
                  <th className="pb-3 pl-4">الحالة</th>
                  <th className="pb-3 pl-4">التاريخ</th>
                  <th className="pb-3 pl-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand/5">
                {filtered.map((r) => {
                  const st = statusById(r.status_id)
                  const sv = SEVERITY_META[r.severity]
                  return (
                    <tr key={r.id} className="hover:bg-surface/40">
                      <td className="py-3 pl-4 font-bold text-brand" dir="ltr">
                        {r.report_number}
                      </td>
                      <td className="py-3 pl-4 font-bold">{r.title}</td>
                      <td className="py-3 pl-4 text-ink-secondary">{r.citizen_name}</td>
                      <td className="py-3 pl-4">
                        {sv && (
                          <span className="chip" style={{ color: sv.color, backgroundColor: `${sv.color}1A` }}>
                            {sv.label}
                          </span>
                        )}
                      </td>
                      <td className="py-3 pl-4">
                        {st && <StatusBadge statusSlug={st.slug} />}
                      </td>
                      <td className="py-3 pl-4 text-xs text-ink-secondary">
                        {formatDateTime(r.created_at)}
                      </td>
                      <td className="py-3">
                        <Link
                          to={`${ADMIN_BASE}/reports/${r.id}`}
                          className="flex items-center gap-1 text-sm font-bold text-brand hover:text-brand-hover"
                        >
                          فتح
                          <ArrowLeft className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}