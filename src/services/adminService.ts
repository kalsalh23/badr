import { supabase } from '@/lib/supabase'
import type { Attachment, Report, ReportStatus, ReportUpdate, ReportType } from '@/types'

export async function fetchReports(): Promise<Report[]> {
  const { data, error } = await supabase
    .from('Reports')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function fetchReportById(id: string): Promise<Report> {
  const { data, error } = await supabase
    .from('Reports')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function fetchReportAttachments(id: string): Promise<Attachment[]> {
  const { data, error } = await supabase
    .from('Attachments')
    .select('*')
    .eq('report_id', id)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function fetchReportUpdates(id: string): Promise<ReportUpdate[]> {
  const { data, error } = await supabase
    .from('ReportUpdates')
    .select('*')
    .eq('report_id', id)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function fetchStatuses(): Promise<ReportStatus[]> {
  const { data, error } = await supabase
    .from('ReportStatus')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function fetchAllTypes(): Promise<ReportType[]> {
  const { data, error } = await supabase
    .from('ReportTypes')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) throw error
  return data ?? []
}

export interface UpdateReportPayload {
  status_id?: string
  notes?: string | null
  is_resolved?: boolean
  resolved_at?: string | null
}

export async function updateReport(id: string, payload: UpdateReportPayload) {
  const { data, error } = await supabase
    .from('Reports')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw error
  return data as Report
}

export async function addReportUpdate(input: {
  report_id: string
  status_id?: string | null
  note?: string | null
}) {
  const { data, error } = await supabase
    .from('ReportUpdates')
    .insert(input)
    .select('*')
    .single()

  if (error) throw error
  return data as ReportUpdate
}

export async function deleteReport(id: string) {
  const { error } = await supabase.from('Reports').delete().eq('id', id)
  if (error) throw error
}

export async function fetchAdminStats() {
  const reports = await fetchReports()
  return reports
}

export async function signInAdmin(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOutAdmin() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentAdmin() {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  // التحقق من أن المستخدم مسجل في AdminUsers
  const { data: admin } = await supabase
    .from('AdminUsers')
    .select('id, is_active')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .maybeSingle()

  if (!admin) {
    // المستخدم موجود في Auth لكن غير مسجل كمدير
    await supabase.auth.signOut()
    return null
  }

  return user
}

export async function deleteAttachment(id: string) {
  const { error } = await supabase.from('Attachments').delete().eq('id', id)
  if (error) throw error
}