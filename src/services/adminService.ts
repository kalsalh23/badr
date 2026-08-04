import { supabase } from '@/lib/supabase'
import type { Attachment, Report, ReportStatus, ReportUpdate, ReportType } from '@/types'

export interface PaginatedReports {
  reports: Report[]
  total: number
}

export interface ReportsFilter {
  search?: string
  status_id?: string
}

export async function fetchReportsPage(
  page: number,
  pageSize: number,
  filter?: ReportsFilter
): Promise<PaginatedReports> {
  const from = page * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('Reports')
    .select('*', { count: 'exact' })

  if (filter?.status_id) {
    query = query.eq('status_id', filter.status_id)
  }

  if (filter?.search && filter.search.trim()) {
    const term = filter.search.trim()
    query = query.or(
      `title.ilike.*${term}*,report_number.ilike.*${term}*,citizen_name.ilike.*${term}*`
    )
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) throw error
  return { reports: data ?? [], total: count ?? 0 }
}

export async function fetchLatestReports(limit: number): Promise<Report[]> {
  const { data, error } = await supabase
    .from('Reports')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

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

export interface AdminStats {
  total: number
  new: number
  in_review: number
  in_progress: number
  completed: number
  closed: number
  avg_resolution_days: number
}

export async function fetchAdminStats(): Promise<AdminStats> {
  const { data, error } = await supabase.rpc('admin_stats')
  if (error) throw error
  return data as AdminStats
}

export interface AdminStatusCount {
  id: string
  name: string
  slug: string
  color: string
  count: number
}

export async function fetchAdminStatusCounts(): Promise<AdminStatusCount[]> {
  const { data, error } = await supabase.rpc('admin_status_counts')
  if (error) throw error
  return data as AdminStatusCount[]
}

export interface AdminTypeCount {
  id: string
  name: string
  count: number
}

export async function fetchAdminTypeCounts(): Promise<AdminTypeCount[]> {
  const { data, error } = await supabase.rpc('admin_type_counts')
  if (error) throw error
  return data as AdminTypeCount[]
}

export interface SystemSettingsData {
  phone: string
  email: string
  address: string
}

export async function fetchSystemSettings(): Promise<SystemSettingsData> {
  const { data, error } = await supabase
    .from('SystemSettings')
    .select('key, value')

  if (error) throw error

  const map: Record<string, string> = {}
  for (const row of data ?? []) map[row.key] = row.value

  return {
    phone: map.phone ?? '',
    email: map.email ?? '',
    address: map.address ?? '',
  }
}

export async function saveSystemSettings(s: SystemSettingsData): Promise<void> {
  const rows = [
    { key: 'phone', value: s.phone },
    { key: 'email', value: s.email },
    { key: 'address', value: s.address },
  ]

  const { error } = await supabase
    .from('SystemSettings')
    .upsert(rows, { onConflict: 'key' })

  if (error) throw error
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