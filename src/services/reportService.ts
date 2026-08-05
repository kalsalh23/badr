import { supabase } from '@/lib/supabase'
import type {
  Attachment,
  PublicReportLocation,
  PublicStats,
  ReportType,
  TrackResult,
} from '@/types'

export async function fetchReportTypes(): Promise<ReportType[]> {
  const { data, error } = await supabase.rpc('get_report_types')
  if (error) throw error
  return (data ?? []) as ReportType[]
}

export async function fetchPublicStats(): Promise<PublicStats> {
  const { data, error } = await supabase.rpc('public_stats')
  if (error) throw error
  return data as PublicStats
}

export async function fetchReportLocations(): Promise<PublicReportLocation[]> {
  const { data, error } = await supabase.rpc('public_report_locations')
  if (error) throw error
  return (data ?? []) as PublicReportLocation[]
}

export async function trackReport(
  reportNumber: string,
  phone: string
): Promise<TrackResult> {
  const { data, error } = await supabase.rpc('public_track_report', {
    p_report_number: reportNumber,
    p_phone: phone,
  })
  if (error) throw error
  return data as TrackResult
}

export interface CreateReportPayload {
  citizen_name: string
  citizen_phone: string
  type_id: string
  title: string
  description: string
  severity: string
  neighborhood?: string | null
  landmark?: string | null
  lat: number
  lng: number
}

export async function createReport(payload: CreateReportPayload) {
  console.log('[createReport] جاري إرسال البلاغ...', payload)

  const { data, error } = await supabase.rpc('submit_report', {
    p_citizen_name: payload.citizen_name,
    p_citizen_phone: payload.citizen_phone,
    p_type_id: payload.type_id,
    p_title: payload.title,
    p_description: payload.description,
    p_severity: payload.severity,
    p_neighborhood: payload.neighborhood ?? null,
    p_landmark: payload.landmark ?? null,
    p_lat: payload.lat,
    p_lng: payload.lng,
  })

  console.log('[createReport] نتيجة الإدراج:', { data, error })
  if (error) {
    console.error('[createReport] خطأ في إدراج البلاغ:', error)
    const message = error.message || ''
    if (message.includes('STATUS_NOT_FOUND')) {
      throw new Error('لم يتم العثور على حالة "جديد" في قاعدة البيانات. تأكد من تنفيذ ملف supabase/schema.sql في Supabase SQL Editor.')
    }
    if (error.code === '42P01' || message.includes('does not exist') || message.includes('function public.submit_report')) {
      throw new Error('دوال قاعدة البيانات غير موجودة. أعد تنفيذ ملف supabase/schema.sql في Supabase SQL Editor (يتضمن دالة submit_report).')
    }
    if (error.code === '23503') {
      throw new Error('نوع البلاغ المحدد غير صحيح. الرجاء إعادة تحميل الصفحة.')
    }
    if (error.code === '23505') {
      throw new Error('رقم البلاغ مكرر. الرجاء المحاولة مرة أخرى.')
    }
    throw new Error(`خطأ في حفظ البلاغ: ${error.message || 'خطأ غير معروف'}`)
  }
  if (!data) {
    throw new Error('لم يتم استلام نتيجة حفظ البلاغ. حاول مرة أخرى.')
  }
  return data as { id: string; report_number: string }
}

export async function uploadReportImages(
  reportId: string,
  files: File[],
  kind: 'before' | 'after' = 'before'
): Promise<Attachment[]> {
  const uploaded: Attachment[] = []
  for (const [index, file] of files.entries()) {
    const ext = file.name.split('.').pop() || 'jpg'
    const storagePath = `${reportId}/${kind}-${Date.now()}-${index}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('report-images')
      .upload(storagePath, file, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) throw uploadError

    const { data: urlData } = supabase.storage
      .from('report-images')
      .getPublicUrl(storagePath)

    const { data, error } = await supabase.rpc('add_attachment', {
      p_report_id: reportId,
      p_url: urlData?.publicUrl,
      p_storage_path: storagePath,
      p_kind: kind,
    })

    if (error) throw error
    uploaded.push(data as unknown as Attachment)
  }
  return uploaded
}