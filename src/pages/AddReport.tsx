import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, CheckCircle2, LocateFixed, MapPin, Send } from 'lucide-react'
import { reportFormSchema, type ReportFormSchema } from '@/lib/schemas'
import { fetchReportTypes, createReport, uploadReportImages } from '@/services/reportService'
import type { ReportType } from '@/types'
import MapView from '@/components/map/Map'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'
import ImageUploader from '@/components/ui/ImageUploader'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Alert from '@/components/ui/Alert'
import Spinner from '@/components/ui/Spinner'
import { compressMultiple } from '@/utils/compressImage'

export default function AddReport() {
  const [types, setTypes] = useState<ReportType[]>([])
  const [typesLoading, setTypesLoading] = useState(true)
  const [typesError, setTypesError] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [successNumber, setSuccessNumber] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<ReportFormSchema>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {},
  })

  const lat = watch('lat')
  const lng = watch('lng')

  useEffect(() => {
    let mounted = true
    fetchReportTypes()
      .then((list) => {
        if (!mounted) return
        setTypes(list)
        if (list.length === 0) {
          setTypesError('لم يتم العثور على أنواع بلاغات في قاعدة البيانات. تأكد من تنفيذ بيانات البذور في supabase/schema.sql.')
        }
      })
      .catch((err) => {
        if (!mounted) return
        setTypesError(
          err instanceof Error && err.message
            ? `تعذر تحميل أنواع البلاغات: ${err.message}`
            : 'تعذر تحميل أنواع البلاغات. تأكد من تنفيذ مخطط قاعدة البيانات (schema.sql).'
        )
      })
      .finally(() => mounted && setTypesLoading(false))
    return () => {
      mounted = false
    }
  }, [])

  // استعادة الموقع الحالي
  function useMyLocation() {
    if (!navigator.geolocation) {
      setSubmitError('المتصفح لا يدعم تحديد الموقع')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setValue('lat', pos.coords.latitude)
        setValue('lng', pos.coords.longitude)
        setError('lat', { type: 'manual', message: undefined })
        setError('lng', { type: 'manual', message: undefined })
      },
      () => setSubmitError('تعذر تحديد موقعك الحالي. يمكنك تحديد الموقع يدوياً على الخريطة.')
    )
  }

  async function onSubmit(values: ReportFormSchema) {
    setSubmitting(true)
    setSubmitError('')
    try {
      if (values.lat == null || values.lng == null) {
        setSubmitError('الرجاء تحديد الموقع على الخريطة')
        setSubmitting(false)
        return
      }
      const payload = {
        citizen_name: values.citizen_name,
        citizen_phone: values.citizen_phone,
        citizen_id: values.citizen_id || null,
        type_id: values.type_id,
        title: values.title,
        description: values.description,
        street: values.street || null,
        neighborhood: values.neighborhood || null,
        landmark: values.landmark || null,
        lat: values.lat,
        lng: values.lng,
      }
      const created = await createReport(payload)

      if (files.length > 0) {
        const compressed = await compressMultiple(files)
        await uploadReportImages(created.id, compressed, 'before')
      }

      setSuccessNumber(created.report_number)
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'حدث خطأ غير متوقع أثناء إرسال البلاغ'
      )
    } finally {
      setSubmitting(false)
    }
  }

  // شاشة النجاح
  if (successNumber) {
    return (
      <div className="mx-auto max-w-2xl">
        <Card className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-black text-ink">تم إرسال بلاغك بنجاح</h2>
          <p className="mt-2 text-ink-secondary">احتفظ برقم البلاغ لتتبع حالته:</p>

          <div className="mx-auto mt-6 w-fit rounded-card bg-surface px-8 py-4">
            <p className="text-xs font-bold text-ink-secondary">رقم البلاغ</p>
            <p className="text-3xl font-black tracking-wider text-brand">{successNumber}</p>
          </div>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button variant="outline" onClick={() => setSuccessNumber('')}>
              إرسال بلاغ آخر
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-black text-ink">تقديم بلاغ جديد</h1>
        <p className="mt-2 text-ink-secondary">
          سيساعدنا وصفك الدقيق على معالجة المشكلة بأسرع وقت ممكن.
        </p>
      </div>

      {submitError && (
        <div className="mb-6">
          <Alert tone="error">{submitError}</Alert>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* بيانات مقدم البلاغ */}
        <Card title="بيانات مقدم البلاغ" subtitle="ستستخدم هذه البيانات لتتبع حالة البلاغ">
          <div className="grid gap-5 md:grid-cols-2">
            <Input
              label="الاسم الثلاثي *"
              placeholder="الاسم، اسم الأب، اسم الجد"
              {...register('citizen_name')}
              error={errors.citizen_name?.message}
            />
            <Input
              label="رقم الهاتف *"
              placeholder="09xxxxxxxx"
              dir="ltr"
              {...register('citizen_phone')}
              error={errors.citizen_phone?.message}
            />
            <Input
              label="رقم الهوية (اختياري)"
              placeholder="الرقم الوطني"
              dir="ltr"
              {...register('citizen_id')}
              error={errors.citizen_id?.message}
            />
          </div>
        </Card>

        {/* بيانات البلاغ */}
        <Card title="بيانات البلاغ">
          <div className="grid gap-5 md:grid-cols-2">
            <Select
              label="نوع البلاغ *"
              {...register('type_id')}
              error={errors.type_id?.message}
            >
              <option value="">اختر نوع البلاغ...</option>
              {types.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </Select>
            {typesLoading && (
              <p className="mt-1 flex items-center gap-2 text-sm text-ink-secondary">
                <Spinner className="h-4 w-4" />
                جاري تحميل أنواع البلاغات...
              </p>
            )}
            {typesError && (
              <div className="mt-2">
                <Alert tone="error">{typesError}</Alert>
              </div>
            )}
          </div>
          <div className="mt-5">
            <Input
              label="عنوان مختصر للبلاغ *"
              placeholder="مثال: إنارة معطلة في حي المطاحن"
              {...register('title')}
              error={errors.title?.message}
            />
          </div>
          <div className="mt-5">
            <Textarea
              label="وصف البلاغ *"
              placeholder="اشرح تفاصيل المشكلة بوضوح..."
              {...register('description')}
              error={errors.description?.message}
            />
          </div>
        </Card>

        {/* الموقع */}
        <Card title="موقع البلاغ">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <Button type="button" variant="outline" onClick={useMyLocation}>
              <LocateFixed className="h-4 w-4" />
              استخدام موقعي الحالي
            </Button>
            <span className="text-sm text-ink-secondary">
              {lat != null && lng != null ? (
                <span className="flex items-center gap-1 font-bold text-brand">
                  <MapPin className="h-4 w-4" />
                  تم تحديد الموقع على الخريطة
                </span>
              ) : (
                'اضغط على الخريطة لتحديد الموقع'
              )}
            </span>
          </div>

          <MapView
            lat={lat}
            lng={lng}
            interactive
            onSelect={(lat, lng) => {
              setValue('lat', lat)
              setValue('lng', lng)
              setError('lat', { type: 'manual', message: undefined })
              setError('lng', { type: 'manual', message: undefined })
            }}
            className="h-[320px]"
          />
          {(errors.lat?.message || errors.lng?.message) && (
            <p className="mt-2 flex items-center gap-1 text-sm text-error">
              <AlertCircle className="h-4 w-4" />
              {errors.lat?.message}
            </p>
          )}

          <div className="mt-5 grid gap-5 md:grid-cols-3">
            <Input label="اسم الشارع" placeholder="شارع..." {...register('street')} />
            <Input label="الحي" placeholder="الحي..." {...register('neighborhood')} />
            <Input label="أقرب معلم" placeholder="معلم قريب..." {...register('landmark')} />
          </div>
        </Card>

        {/* الصور */}
        <Card title="الصور">
          <ImageUploader files={files} setFiles={setFiles} />
        </Card>

        <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:justify-end">
          <Button type="submit" variant="primary" disabled={submitting} className="sm:min-w-[220px]">
            {submitting ? (
              <Spinner className="h-5 w-5 border-2 border-white/30 border-t-white" />
            ) : (
              <>
                <Send className="h-5 w-5" />
                إرسال البلاغ
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}