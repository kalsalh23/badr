import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowRight, Clock, ImagePlus, Phone, Save, Trash2, User, X } from 'lucide-react'
import {
  fetchReportById,
  fetchReportAttachments,
  fetchReportUpdates,
  fetchStatuses,
  updateReport,
  addReportUpdate,
  deleteReport,
  deleteAttachment,
} from '@/services/adminService'
import { uploadReportImages } from '@/services/reportService'
import type { Attachment, Report, ReportStatus, ReportUpdate } from '@/types'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import Alert from '@/components/ui/Alert'
import StatusBadge from '@/components/ui/StatusBadge'
import MapView from '@/components/map/Map'
import ImageUploader from '@/components/ui/ImageUploader'
import { ADMIN_BASE, SEVERITY_META } from '@/lib/constants'
import { compressMultiple } from '@/utils/compressImage'
import { formatDateTime } from '@/utils/format'

export default function ReportDetail() {
  const { id = '' } = useParams()
  const navigate = useNavigate()

  const [report, setReport] = useState<Report | null>(null)
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [updates, setUpdates] = useState<ReportUpdate[]>([])
  const [statuses, setStatuses] = useState<ReportStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [statusId, setStatusId] = useState('')
  const [note, setNote] = useState('')
  const [afterFiles, setAfterFiles] = useState<File[]>([])
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState('')

  useEffect(() => {
    Promise.all([
      fetchReportById(id),
      fetchReportAttachments(id),
      fetchReportUpdates(id),
      fetchStatuses(),
    ])
      .then(([r, a, u, s]) => {
        setReport(r)
        setAttachments(a)
        setUpdates(u)
        setStatuses(s)
        setStatusId(r.status_id)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'خطأ في تحميل البلاغ'))
      .finally(() => setLoading(false))
  }, [id])

  async function handleSave() {
    if (!report) return
    setSaving(true)
    setError('')
    try {
      const isCompleted = statuses.find((s) => s.id === statusId)?.slug === 'completed'
      const updated = await updateReport(report.id, {
        status_id: statusId,
        notes: note || report.notes,
        ...(isCompleted ? { is_resolved: true, resolved_at: new Date().toISOString() } : {}),
      })
      setReport(updated)
      await addReportUpdate({
        report_id: report.id,
        status_id: statusId,
        note: note || 'تم تحديث حالة البلاغ',
      })
      const fresh = await fetchReportUpdates(report.id)
      setUpdates(fresh)
      setNote('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'تعذر حفظ التحديث')
    } finally {
      setSaving(false)
    }
  }

  async function handleUploadAfter() {
    if (!report || afterFiles.length === 0) return
    setUploading(true)
    setError('')
    try {
      const compressed = await compressMultiple(afterFiles)
      await uploadReportImages(report.id, compressed, 'after')
      const fresh = await fetchReportAttachments(report.id)
      setAttachments(fresh)
      setAfterFiles([])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'تعذر رفع الصور')
    } finally {
      setUploading(false)
    }
  }

  async function handleDeleteAttachment(att: Attachment) {
    if (!confirm('هل تريد حذف هذه الصورة؟')) return
    try {
      await deleteAttachment(att.id)
      setAttachments((prev) => prev.filter((a) => a.id !== att.id))
    } catch {
      setError('تعذر حذف الصورة')
    }
  }

  async function handleDeleteReport() {
    if (!confirm('هل أنت متأكد من حذف هذا البلاغ نهائياً؟')) return
    try {
      await deleteReport(report!.id)
      navigate(`${ADMIN_BASE}/reports`)
    } catch {
      setError('تعذر حذف البلاغ')
    }
  }

  if (loading) return <Spinner className="h-10 w-10" />
  if (!report) return <Alert tone="error">البلاغ غير موجود.</Alert>

  const sv = SEVERITY_META[report.severity]
  const currentStatus = statuses.find((s) => s.id === report.status_id)
  const beforeImages = attachments.filter((a) => a.kind === 'before')
  const afterImages = attachments.filter((a) => a.kind === 'after')

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to={`${ADMIN_BASE}/reports`}
          className="flex items-center gap-1 text-sm font-bold text-brand hover:text-brand-hover"
        >
          <ArrowRight className="h-4 w-4" />
          العودة إلى البلاغات
        </Link>
        <Button variant="danger" onClick={handleDeleteReport}>
          <Trash2 className="h-4 w-4" />
          حذف البلاغ
        </Button>
      </div>

      {error && (
        <Alert tone="error">{error}</Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* المعلومات */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-xl font-black text-ink">{report.title}</h1>
                <p className="mt-1 text-sm text-ink-muted" dir="ltr">
                  {report.report_number}
                </p>
              </div>
              {currentStatus && <StatusBadge statusSlug={currentStatus.slug} />}
            </div>

            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-xl bg-surface/60 p-3">
                <User className="h-5 w-5 shrink-0 text-brand" />
                <div>
                  <dt className="text-xs text-ink-secondary">مقدم البلاغ</dt>
                  <dd className="font-bold">{report.citizen_name}</dd>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-surface/60 p-3">
                <Phone className="h-5 w-5 shrink-0 text-brand" />
                <div>
                  <dt className="text-xs text-ink-secondary">رقم الهاتف</dt>
                  <dd className="font-bold" dir="ltr">{report.citizen_phone}</dd>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-surface/60 p-3">
                <Clock className="h-5 w-5 shrink-0 text-brand" />
                <div>
                  <dt className="text-xs text-ink-secondary">تاريخ الإرسال</dt>
                  <dd className="font-bold">{formatDateTime(report.created_at)}</dd>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-surface/60 p-3">
                <span className="shrink-0" style={{ color: sv.color }}>
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                    <path d="M12 2l8 4v6c0 5-3.4 8.4-8 10-4.6-1.6-8-5-8-10V6l8-4z" />
                  </svg>
                </span>
                <div>
                  <dt className="text-xs text-ink-secondary">درجة الخطورة</dt>
                  <dd className="font-bold" style={{ color: sv.color }}>{sv.label}</dd>
                </div>
              </div>
            </dl>

            <div className="mt-5">
              <p className="label">وصف البلاغ</p>
              <p className="leading-relaxed text-ink-secondary">{report.description}</p>
            </div>

            {(report.neighborhood || report.landmark) && (
              <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                {report.neighborhood && (
                  <div className="rounded-xl bg-surface/60 p-3">
                    <dt className="text-xs text-ink-secondary">الحي</dt>
                    <dd className="font-bold">{report.neighborhood}</dd>
                  </div>
                )}
                {report.landmark && (
                  <div className="rounded-xl bg-surface/60 p-3">
                    <dt className="text-xs text-ink-secondary">أقرب معلم</dt>
                    <dd className="font-bold">{report.landmark}</dd>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* الصور */}
          <Card title="صور البلاغ">
            {beforeImages.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {beforeImages.map((a) => (
                  <div key={a.id} className="relative">
                    <button
                      type="button"
                      onClick={() => setPreviewUrl(a.url)}
                      className="block w-full cursor-zoom-in overflow-hidden rounded-card"
                      aria-label="عرض الصورة"
                    >
                      <img
                        src={a.url}
                        alt="صورة البلاغ"
                        className="aspect-square w-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </button>
                    <button
                      onClick={() => handleDeleteAttachment(a)}
                      className="absolute left-2 top-2 rounded-full bg-error p-1.5 text-white"
                      aria-label="حذف"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-4 text-center text-sm text-ink-secondary">لا توجد صور للبلاغ.</p>
            )}
          </Card>

          {/* صور بعد الإصلاح */}
          <Card title="صور بعد الإصلاح">
            {afterImages.length > 0 && (
              <div className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {afterImages.map((a) => (
                  <div key={a.id} className="relative">
                    <button
                      type="button"
                      onClick={() => setPreviewUrl(a.url)}
                      className="block w-full cursor-zoom-in overflow-hidden rounded-card"
                      aria-label="عرض الصورة"
                    >
                      <img
                        src={a.url}
                        alt="صورة بعد الإصلاح"
                        className="aspect-square w-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </button>
                    <button
                      onClick={() => handleDeleteAttachment(a)}
                      className="absolute left-2 top-2 rounded-full bg-error p-1.5 text-white"
                      aria-label="حذف"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <ImageUploader
              files={afterFiles}
              setFiles={setAfterFiles}
              title="رفع صور بعد الإصلاح"
              hint="ارفع صوراً تثبت معالجة المشكلة."
            />
            <Button
              variant="gold"
              onClick={handleUploadAfter}
              disabled={afterFiles.length === 0 || uploading}
              className="mt-4"
            >
              {uploading ? (
                <Spinner className="h-5 w-5 border-2 border-ink/20 border-t-ink" />
              ) : (
                <>
                  <ImagePlus className="h-5 w-5" />
                  رفع الصور
                </>
              )}
            </Button>
          </Card>
        </div>

        {/* شريط الجانب: الحالة + الخريطة + السجل */}
        <div className="space-y-6">
          {/* تغيير الحالة */}
          <Card title="تحديث البلاغ">
            <div className="space-y-4">
              <div>
                <label className="label">الحالة</label>
                <select value={statusId} onChange={(e) => setStatusId(e.target.value)} className="input">
                  {statuses.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">ملاحظات</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="اكتب ملاحظات حول الإجراء المتخذ..."
                  className="input min-h-[100px]"
                />
              </div>
              <Button variant="primary" onClick={handleSave} disabled={saving} className="w-full">
                <Save className="h-4 w-4" />
                {saving ? 'جارٍ الحفظ...' : 'حفظ التحديث'}
              </Button>
            </div>
          </Card>

          {/* الخريطة */}
          <Card title="الموقع">
            <MapView
              lat={report.lat}
              lng={report.lng}
              className="h-[240px]"
              markers={[{ lat: report.lat, lng: report.lng, title: report.title }]}
            />
          </Card>

          {/* سجل التحديثات */}
          <Card title="سجل التحديثات">
            {updates.length === 0 ? (
              <p className="py-4 text-center text-sm text-ink-secondary">لا توجد تحديثات بعد.</p>
            ) : (
              <div className="space-y-4">
                {[...updates].reverse().map((u) => {
                  const st = statuses.find((s) => s.id === u.status_id)
                  return (
                    <div key={u.id} className="border-r-2 border-gold pr-4">
                      <p className="text-sm font-bold">
                        {st?.name || 'تحديث'}
                        <span className="mr-2 text-xs font-normal text-ink-muted">
                          {formatDateTime(u.created_at)}
                        </span>
                      </p>
                      {u.note && <p className="mt-1 text-sm text-ink-secondary">{u.note}</p>}
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        </div>
      </div>

      {previewUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setPreviewUrl('')}
        >
          <button
            type="button"
            onClick={() => setPreviewUrl('')}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            aria-label="إغلاق"
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={previewUrl}
            alt="عرض مكبّر"
            className="max-h-[90vh] max-w-[90vw] rounded-card object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}