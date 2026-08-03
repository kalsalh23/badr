import { supabase } from '@/lib/supabase'
import type {
  Attachment,
  PublicReportLocation,
  PublicStats,
  ReportType,
  TrackResult,
} from '@/types'

export async function fetchReportTypes(): Promise<ReportType[]> {
  const { data, error } = await supabase
    .from('ReportTypes')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) throw error
  return data ?? []
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
  citizen_id?: string | null
  type_id: string
  title: string
  description: string
  street?: string | null
  neighborhood?: string | null
  landmark?: string | null
  lat: number
  lng: number
}

export async function createReport(payload: CreateReportPayload) {
  // جلب حالة "جديد" الافتراضية
  const { data: statusData, error: statusError } = await supabase
    .from('ReportStatus')
    .select('id')
    .eq('slug', 'new')
    .maybeSingle()

  if (statusError) throw statusError
  const statusId = statusData?.id
  if (!statusId) throw new Error('تعذر العثور على الحالة الافتراضية للبلاغ')

  const { data, error } = await supabase
    .from('Reports')
    .insert({
      ...payload,
      is_resolved: false,
      status_id: statusId,
      notes: null,
    })
    .select('id, report_number')
    .single()

  if (error) throw error
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

    const { data, error } = await supabase
      .from('Attachments')
      .insert({
        report_id: reportId,
        url: urlData?.publicUrl,
        storage_path: storagePath,
        kind,
      })
      .select('*')
      .single()

    if (error) throw error
    uploaded.push(data as Attachment)
  }
  return uploaded
}