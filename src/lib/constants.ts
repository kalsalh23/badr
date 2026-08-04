// مركز مدينة طيبة الإمام — حماة، سوريا
export const CITY_CENTER = { lat: 35.26592, lng: 36.71219 } as const
export const DEFAULT_ZOOM = 14

export const CITY_NAME = 'طيبة الإمام'
export const MUNICIPALITY_NAME = 'مجلس مدينة طيبة الإمام'
export const PLATFORM_NAME = 'إبلاغ الطيبة'
export const MEDIA_SPONSOR = 'الراعي الإعلامي صفحة طيبة الامام الرسمية'

export const DEVELOPER_NAME = 'قصي مهند الصالح'
export const DEVELOPER_PHONE = '0952639157'

export const PHONE_REGEX = /^(?:\+963|00963|0)?9\d{8}$/

export const ADMIN_BASE = '/admin'

export const STATUS_META: Record<string, { label: string; color: string }> = {
  new: { label: 'جديد', color: '#B9A779' },
  in_review: { label: 'قيد المراجعة', color: '#988561' },
  in_progress: { label: 'قيد التنفيذ', color: '#054239' },
  completed: { label: 'تم الإنجاز', color: '#1E7A4C' },
  closed: { label: 'مغلق', color: '#6B1F2A' },
}

export const SEVERITY_META: Record<string, { label: string; color: string }> = {
  مرتفعة: { label: 'مرتفعة', color: '#6B1F2A' },
  متوسطة: { label: 'متوسطة', color: '#988561' },
  منخفضة: { label: 'منخفضة', color: '#054239' },
}