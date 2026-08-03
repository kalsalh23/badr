import { useEffect, useMemo, useState } from 'react'
import { fetchAdminStats, fetchAllTypes, fetchStatuses } from '@/services/adminService'
import type { Report, ReportStatus, ReportType } from '@/types'
import Card from '@/components/ui/Card'
import Spinner from '@/components/ui/Spinner'
import { formatDuration } from '@/utils/format'

export default function StatisticsAdmin() {
  const [reports, setReports] = useState<Report[]>([])
  const [statuses, setStatuses] = useState<ReportStatus[]>([])
  const [types, setTypes] = useState<ReportType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([fetchAdminStats(), fetchStatuses(), fetchAllTypes()])
      .then(([r, s, t]) => {
        setReports(r)
        setStatuses(s)
        setTypes(t)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const statusCounts = useMemo(() => {
    const map = new Map<string, number>()
    statuses.forEach((s) => map.set(s.id, 0))
    reports.forEach((r) => map.set(r.status_id, (map.get(r.status_id) || 0) + 1))
    return statuses.map((s) => ({
      status: s,
      count: map.get(s.id) || 0,
      slug: s.slug,
    }))
  }, [reports, statuses])

  const typeCounts = useMemo(() => {
    const map = new Map<string, number>()
    types.forEach((t) => map.set(t.id, 0))
    reports.forEach((r) => map.set(r.type_id, (map.get(r.type_id) || 0) + 1))
    return types.map((t) => ({ type: t, count: map.get(t.id) || 0 }))
  }, [reports, types])

  const resolved = reports.filter((r) => r.resolved_at)
  const avgDays =
    resolved.length > 0
      ? resolved.reduce((sum, r) => {
          const diff = new Date(r.resolved_at!).getTime() - new Date(r.created_at).getTime()
          return sum + diff / 86400000
        }, 0) / resolved.length
      : 0

  const maxStatus = Math.max(...statusCounts.map((s) => s.count), 1)
  const maxType = Math.max(...typeCounts.map((t) => t.count), 1)

  if (loading) return <Spinner className="h-10 w-10" />

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-ink">إحصائيات البلاغات</h1>
        <p className="text-sm text-ink-secondary">تحليل شامل لبلاغات المواطنين.</p>
      </div>

      <Card title="توزيع البلاغات حسب الحالة">
        <div className="space-y-5">
          {statusCounts.map(({ status, count }) => (
            <div key={status.id}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="flex items-center gap-2 font-bold">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: status.color }} />
                  {status.name}
                </span>
                <span className="font-black">{count}</span>
              </div>
              <div className="h-4 overflow-hidden rounded-full bg-surface">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${(count / maxStatus) * 100}%`, backgroundColor: status.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="البلاغات حسب النوع">
        <div className="space-y-5">
          {typeCounts.map(({ type, count }) => (
            <div key={type.id}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="font-bold">{type.name}</span>
                <span className="font-black">{count}</span>
              </div>
              <div className="h-4 overflow-hidden rounded-full bg-surface">
                <div
                  className="h-full rounded-full bg-brand transition-all duration-500"
                  style={{ width: `${(count / maxType) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="مؤشرات الأداء">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-card bg-surface/60 p-5 text-center">
            <p className="text-3xl font-black text-brand">{reports.length}</p>
            <p className="mt-1 text-sm font-bold text-ink-secondary">إجمالي البلاغات</p>
          </div>
          <div className="rounded-card bg-surface/60 p-5 text-center">
            <p className="text-3xl font-black text-success">{resolved.length}</p>
            <p className="mt-1 text-sm font-bold text-ink-secondary">منجزة</p>
          </div>
          <div className="rounded-card bg-surface/60 p-5 text-center">
            <p className="text-3xl font-black text-gold-dark">{formatDuration(avgDays)}</p>
            <p className="mt-1 text-sm font-bold text-ink-secondary">متوسط مدة الإنجاز</p>
          </div>
        </div>
      </Card>
    </div>
  )
}