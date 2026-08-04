import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ChevronLeft, ChevronRight, ClipboardList, Search } from 'lucide-react'
import { fetchReportsPage, fetchStatuses } from '@/services/adminService'
import type { Report, ReportStatus } from '@/types'
import Card from '@/components/ui/Card'
import Spinner from '@/components/ui/Spinner'
import StatusBadge from '@/components/ui/StatusBadge'
import { ADMIN_BASE, SEVERITY_META } from '@/lib/constants'
import { formatDateTime } from '@/utils/format'

const PAGE_SIZE = 15

export default function ReportsAdmin() {
  const [reports, setReports] = useState<Report[]>([])
  const [statuses, setStatuses] = useState<ReportStatus[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStatuses()
      .then(setStatuses)
      .catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    fetchReportsPage(page, PAGE_SIZE, {
      search,
      status_id: statusFilter === 'all' ? undefined : statusFilter,
    })
      .then(({ reports, total }) => {
        setReports(reports)
        setTotal(total)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [page, search, statusFilter])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const statusById = (id: string) => statuses.find((s) => s.id === id)

  function goToPage(p: number) {
    if (p < 0 || p >= totalPages) return
    setPage(p)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-ink">إدارة البلاغات</h1>
        <p className="text-sm text-ink-secondary">
          عرض وإدارة جميع بلاغات المواطنين.
          {total > 0 && <span className="mr-2 font-bold text-brand">({total} بلاغ)</span>}
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-muted" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(0)
            }}
            placeholder="بحث بالرقم، الاسم، أو العنوان..."
            className="input pr-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value)
            setPage(0)
          }}
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
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner className="h-10 w-10" />
          </div>
        ) : reports.length === 0 ? (
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
                {reports.map((r) => {
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

        {!loading && total > 0 && (
          <div className="mt-4 flex items-center justify-between border-t border-brand/10 pt-4">
            <p className="text-xs text-ink-secondary">
              صفحة {page + 1} من {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => goToPage(page - 1)}
                disabled={page === 0}
                className="flex h-9 w-9 items-center justify-center rounded-card border border-brand/15 text-brand transition hover:bg-brand/5 disabled:opacity-40"
                aria-label="السابق"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => goToPage(page + 1)}
                disabled={page >= totalPages - 1}
                className="flex h-9 w-9 items-center justify-center rounded-card border border-brand/15 text-brand transition hover:bg-brand/5 disabled:opacity-40"
                aria-label="التالي"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
