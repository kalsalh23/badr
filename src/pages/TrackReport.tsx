import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2, Search } from 'lucide-react'
import { trackSchema, type TrackSchema } from '@/lib/schemas'
import { trackReport } from '@/services/reportService'
import type { TrackResult } from '@/types'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Alert from '@/components/ui/Alert'
import Spinner from '@/components/ui/Spinner'
import StatusBadge from '@/components/ui/StatusBadge'
import MapView from '@/components/map/Map'
import { formatDateTime } from '@/utils/format'

export default function TrackReport() {
  const [result, setResult] = useState<TrackResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TrackSchema>({
    resolver: zodResolver(trackSchema),
  })

  async function onSubmit(values: TrackSchema) {
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await trackReport(values.report_number, values.phone)
      setResult(res)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء التتبع')
    } finally {
      setLoading(false)
    }
  }

  const report = result?.report

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-black text-ink">تتبع بلاغ</h1>
        <p className="mt-2 text-ink-secondary">
          أدخل رقم البلاغ ورقم الهاتف المرتبط به لعرض حالة البلاغ.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5 md:grid-cols-2">
          <Input
            label="رقم البلاغ"
            placeholder="TAY-2026-00001"
            dir="ltr"
            {...register('report_number')}
            error={errors.report_number?.message}
          />
          <Input
            label="رقم الهاتف"
            placeholder="09xxxxxxxx"
            dir="ltr"
            {...register('phone')}
            error={errors.phone?.message}
          />
          <div className="md:col-span-2">
            <Button type="submit" variant="primary" disabled={loading} className="w-full">
              {loading ? (
                <Spinner className="h-5 w-5 border-2 border-white/30 border-t-white" />
              ) : (
                <>
                  <Search className="h-5 w-5" />
                  تتبع البلاغ
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>

      {error && (
        <div className="mt-6">
          <Alert tone="error">{error}</Alert>
        </div>
      )}

      {result && !result.found && (
        <div className="mt-6">
          <Alert tone="error">{result.message}</Alert>
        </div>
      )}

      {report && (
        <div className="mt-8 space-y-6">
          {/* ملخص الحالة */}
          <Card>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-black text-ink">{report.title}</h2>
                  <StatusBadge statusSlug={report.status_slug} />
                </div>
                <p className="mt-1 text-sm text-ink-secondary">
                  رقم البلاغ: <span className="font-bold text-brand" dir="ltr">{report.report_number}</span>
                </p>
              </div>
              <div className="rounded-card bg-surface px-4 py-3 text-sm">
                <p className="font-bold text-ink-secondary">آخر تحديث</p>
                <p className="font-bold text-brand">{formatDateTime(report.updated_at)}</p>
              </div>
            </div>
          </Card>

          {/* التفاصيل */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card title="تفاصيل البلاغ">
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-ink-secondary">تاريخ الإرسال</dt>
                  <dd className="font-bold">{formatDateTime(report.created_at)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-secondary">نوع البلاغ</dt>
                  <dd className="font-bold">{report.type}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-secondary">درجة الخطورة</dt>
                  <dd className="font-bold">{report.severity}</dd>
                </div>
                {report.neighborhood && (
                  <div className="flex justify-between">
                    <dt className="text-ink-secondary">الحي</dt>
                    <dd className="font-bold">{report.neighborhood}</dd>
                  </div>
                )}
                {report.landmark && (
                  <div className="flex justify-between">
                    <dt className="text-ink-secondary">أقرب معلم</dt>
                    <dd className="font-bold">{report.landmark}</dd>
                  </div>
                )}
              </dl>
              <div className="mt-5">
                <p className="label">الوصف</p>
                <p className="text-sm leading-relaxed text-ink-secondary">{report.description}</p>
              </div>
            </Card>

            <Card title="الموقع">
              <MapView
                lat={report.lat}
                lng={report.lng}
                className="h-[260px]"
                markers={[
                  {
                    lat: report.lat,
                    lng: report.lng,
                    title: report.title,
                  },
                ]}
              />
            </Card>
          </div>

          {/* آخر تحديث إداري */}
          {result?.latest_update && (
            <Card title="آخر تحديث إداري">
              <div className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-gold" />
                <div>
                  <p className="text-sm font-bold">
                    {result.latest_update.status || 'تحديث'}
                    <span className="mr-2 font-normal text-ink-muted">
                      {formatDateTime(result.latest_update.created_at)}
                    </span>
                  </p>
                  {result.latest_update.note && (
                    <p className="mt-1 text-sm text-ink-secondary">{result.latest_update.note}</p>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* الصور */}
          {result?.attachments && result.attachments.length > 0 && (
            <Card title="الصور">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {result.attachments
                  .filter((a) => a.kind === 'before')
                  .map((a) => (
                    <img
                      key={a.id}
                      src={a.url}
                      alt="صورة البلاغ"
                      className="aspect-square w-full rounded-card object-cover"
                      loading="lazy"
                    />
                  ))}
              </div>

              {result.attachments.some((a) => a.kind === 'after') && (
                <>
                  <p className="label mt-6 flex items-center gap-2 text-success">
                    <CheckCircle2 className="h-5 w-5" />
                    صور بعد الإصلاح
                  </p>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {result.attachments
                      .filter((a) => a.kind === 'after')
                      .map((a) => (
                        <img
                          key={a.id}
                          src={a.url}
                          alt="صورة بعد الإصلاح"
                          className="aspect-square w-full rounded-card object-cover"
                          loading="lazy"
                        />
                      ))}
                  </div>
                </>
              )}
            </Card>
          )}

          {report.status_slug === 'completed' && (
            <div className="flex items-center gap-3 rounded-card bg-success/10 p-5">
              <CheckCircle2 className="h-8 w-8 text-success" />
              <div>
                <p className="font-black text-success">تم إنجاز هذا البلاغ</p>
                <p className="text-sm text-ink-secondary">
                  شكراً لمساهمتك في تحسين مدينة طيبة الإمام.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}