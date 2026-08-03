export interface ReportType {
  id: string
  name: string
  slug: string
  icon?: string
  sort_order: number
  is_active: boolean
}

export interface ReportStatus {
  id: string
  name: string
  slug: string
  color: string
  sort_order: number
}

export interface Report {
  id: string
  report_number: string
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
  severity: string
  status_id: string
  notes?: string | null
  is_resolved: boolean
  resolved_at?: string | null
  created_at: string
  updated_at?: string | null
}

export interface ReportTypeDetail extends ReportType {}

export interface Attachment {
  id: string
  report_id: string
  url: string
  storage_path: string
  kind: 'before' | 'after'
  created_at: string
}

export interface ReportUpdate {
  id: string
  report_id: string
  status_id?: string | null
  note?: string | null
  changed_by?: string | null
  created_at: string
}

// ===== هياكل النموذج =====

export interface CitizenData {
  citizen_name: string
  citizen_phone: string
  citizen_id?: string
}

export interface ReportDetails {
  type_id: string
  title: string
  description: string
}

export interface LocationData {
  street?: string
  neighborhood?: string
  landmark?: string
  lat: number
  lng: number
}

export type Severity = 'مرتفعة' | 'متوسطة' | 'منخفضة'

export interface ReportFormValues {
  citizen_name: string
  citizen_phone: string
  citizen_id?: string
  type_id: string
  title: string
  description: string
  street?: string
  neighborhood?: string
  landmark?: string
  lat: number | null
  lng: number | null
  severity: Severity
}

export interface PublicStats {
  total: number
  new: number
  in_progress: number
  completed: number
  closed: number
  avg_resolution_days: number
}

export interface PublicReportLocation {
  id: string
  report_number: string
  title: string
  lat: number
  lng: number
  type_name: string
  status_name: string
  status_slug: string
  severity: string
  created_at: string
}

export interface TrackResult {
  found: boolean
  message?: string
  report?: {
    id: string
    report_number: string
    title: string
    description: string
    type: string
    status: string
    status_slug: string
    severity: string
    street?: string | null
    neighborhood?: string | null
    landmark?: string | null
    lat: number
    lng: number
    notes?: string | null
    created_at: string
    updated_at: string
  }
  attachments?: Attachment[]
  latest_update?: {
    note?: string | null
    status?: string
    status_slug?: string
    created_at: string
  } | null
}