import { useEffect, useState } from 'react'
import {
  fetchAdminStats,
  fetchAdminStatusCounts,
  fetchAdminTypeCounts,
} from '@/services/adminService'
import type { AdminStats, AdminStatusCount, AdminTypeCount } from '@/services/adminService'
import Card from '@/components/ui/Card'
import Spinner from '@/components/ui/Spinner'
import { formatDuration } from '@/utils/format'

export default function StatisticsAdmin() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [statusCounts, setStatusCounts] = useState<AdminStatusCount[]>([])
  const [typeCounts, setTypeCounts] = useState<AdminTypeCount[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([fetchAdminStats(), fetchAdminStatusCounts(), fetchAdminTypeCounts()])
      .then(([st, sc, tc]) => {
        setStats(st)
        setStatusCounts(sc)
        setTypeCounts(tc)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner className="h-10 w-10" />
  if (!stats) return null

  const maxStatus = Math.max(...statusCounts.map((s) => s.count), 1)
  const maxType = Math.max(...typeCounts.map((t) => t.count), 1)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-ink">إحصائيات البلاغات</h1>
        <p className="text-sm text-ink-secondary">تحليل شامل لبلاغات المواطنين.</p>
      </div>

      <Card title="توزيع البلاغات حسب الحالة">
        <div className="space-y-5">
          {statusCounts.map(({ id, name, color, count }) => (
            <div key={id}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="flex items-center gap-2 font-bold">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
                  {name}
                </span>
                <span className="font-black">{count}</span>
              </div>
              <div className="h-4 overflow-hidden rounded-full bg-surface">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${(count / maxStatus) * 100}%`, backgroundColor: color }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="البلاغات حسب النوع">
        <div className="space-y-5">
          {typeCounts.map(({ id, name, count }) => (
            <div key={id}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="font-bold">{name}</span>
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
            <p className="text-3xl font-black text-brand">{stats.total}</p>
            <p className="mt-1 text-sm font-bold text-ink-secondary">إجمالي البلاغات</p>
          </div>
          <div className="rounded-card bg-surface/60 p-5 text-center">
            <p className="text-3xl font-black text-success">{stats.completed}</p>
            <p className="mt-1 text-sm font-bold text-ink-secondary">منجزة</p>
          </div>
          <div className="rounded-card bg-surface/60 p-5 text-center">
            <p className="text-3xl font-black text-gold-dark">
              {stats.avg_resolution_days > 0 ? formatDuration(stats.avg_resolution_days) : '—'}
            </p>
            <p className="mt-1 text-sm font-bold text-ink-secondary">متوسط مدة الإنجاز</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
