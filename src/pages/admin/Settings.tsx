import { useEffect, useState } from 'react'
import { MapPin, Save, Shield } from 'lucide-react'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Alert from '@/components/ui/Alert'
import Spinner from '@/components/ui/Spinner'
import { CITY_CENTER, CITY_NAME, MUNICIPALITY_NAME, PLATFORM_NAME } from '@/lib/constants'
import MapView from '@/components/map/Map'
import { fetchSystemSettings, saveSystemSettings } from '@/services/adminService'

export default function Settings() {
  const [contacts, setContacts] = useState({ phone: '', email: '', address: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchSystemSettings()
      .then(setContacts)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setStatus('idle')
    setError('')
    try {
      await saveSystemSettings(contacts)
      setStatus('saved')
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'تعذر حفظ الإعدادات')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Spinner className="h-10 w-10" />

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-ink">إعدادات النظام</h1>
        <p className="text-sm text-ink-secondary">معلومات المنصة وبيانات التواصل.</p>
      </div>

      {status === 'saved' && (
        <Alert tone="success">تم حفظ الإعدادات بنجاح.</Alert>
      )}
      {status === 'error' && (
        <Alert tone="error">{error}</Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="معلومات المنصة">
          <div className="space-y-3 rounded-card bg-surface/60 p-4 text-sm">
            <div className="flex items-center gap-2 font-black text-brand">
              <Shield className="h-5 w-5" />
              {PLATFORM_NAME}
            </div>
            <p className="text-ink-secondary">{MUNICIPALITY_NAME}</p>
            <p className="text-ink-secondary">
              مركز المدينة: {CITY_CENTER.lat.toFixed(5)}، {CITY_CENTER.lng.toFixed(5)} ({CITY_NAME})
            </p>
          </div>

          <form onSubmit={handleSave} className="mt-5 space-y-4">
            <Input
              label="رقم الهاتف"
              value={contacts.phone}
              onChange={(e) => setContacts({ ...contacts, phone: e.target.value })}
              dir="ltr"
            />
            <Input
              label="البريد الإلكتروني"
              value={contacts.email}
              onChange={(e) => setContacts({ ...contacts, email: e.target.value })}
              dir="ltr"
            />
            <Input
              label="العنوان"
              value={contacts.address}
              onChange={(e) => setContacts({ ...contacts, address: e.target.value })}
            />
            <Button type="submit" variant="primary" disabled={saving}>
              <Save className="h-4 w-4" />
              {saving ? 'جارٍ الحفظ...' : 'حفظ الإعدادات'}
            </Button>
          </form>
        </Card>

        <Card title="موقع المدينة على الخريطة">
          <MapView
            lat={CITY_CENTER.lat}
            lng={CITY_CENTER.lng}
            className="h-[300px]"
            markers={[{ lat: CITY_CENTER.lat, lng: CITY_CENTER.lng, title: CITY_NAME }]}
          />
          <p className="mt-3 flex items-center gap-2 text-sm text-ink-secondary">
            <MapPin className="h-4 w-4 text-gold" />
            هذه الإحداثيات الافتراضية تُستخدم كمركز للخريطة في كافة الصفحات.
          </p>
        </Card>
      </div>
    </div>
  )
}
