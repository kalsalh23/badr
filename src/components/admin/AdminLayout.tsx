import { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { BarChart3, LayoutDashboard, LogOut, Menu, Settings, Shield, X, ClipboardList, Code2 } from 'lucide-react'
import { signOutAdmin, getCurrentAdmin } from '@/services/adminService'
import { ADMIN_BASE, DEVELOPER_NAME, DEVELOPER_PHONE } from '@/lib/constants'

const navItems = [
  { to: `${ADMIN_BASE}`, label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: `${ADMIN_BASE}/reports`, label: 'إدارة البلاغات', icon: ClipboardList },
  { to: `${ADMIN_BASE}/statistics`, label: 'الإحصائيات', icon: BarChart3 },
  { to: `${ADMIN_BASE}/settings`, label: 'إعدادات النظام', icon: Settings },
]

export default function AdminLayout() {
  const [open, setOpen] = useState(false)
  const [adminEmail, setAdminEmail] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    getCurrentAdmin().then((u) => setAdminEmail(u?.email || ''))
  }, [])

  async function handleLogout() {
    await signOutAdmin()
    navigate('/admin/login')
  }

  const sidebar = (
    <div className="flex h-full flex-col justify-between px-4 py-6">
      <div>
        <div className="mb-8 flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold text-ink">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <p className="font-black text-white">لوحة التحكم</p>
            <p className="text-xs text-white/60">إبلاغ الطيبة</p>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition ${
                  isActive ? 'bg-white/15 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="space-y-3">
        {adminEmail && (
          <div className="rounded-xl bg-white/5 px-4 py-3 text-xs text-white/70">
            <p className="font-black text-gold">المدير</p>
            <p dir="ltr" className="mt-1 truncate">
              {adminEmail}
            </p>
          </div>
        )}
        <div className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-3 text-xs text-white/70">
          <Code2 className="h-4 w-4 shrink-0 text-gold" />
          <span className="min-w-0">
            <span className="block font-black text-white">{DEVELOPER_NAME}</span>
            <a href={`tel:${DEVELOPER_PHONE}`} dir="ltr" className="text-white/70 hover:text-gold">
              {DEVELOPER_PHONE}
            </a>
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-warning hover:bg-white/5"
        >
          <LogOut className="h-5 w-5" />
          تسجيل الخروج
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-surface">
      {/* الشريط الجانبي على الشاشات الكبيرة */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 bg-brand lg:block">
        {sidebar}
      </aside>

      {/* القائمة المحمولة */}
      {open && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="relative z-10 h-full w-72 bg-brand shadow-2xl">
            <button
              onClick={() => setOpen(false)}
              className="absolute left-3 top-3 rounded-lg p-2 text-white hover:bg-white/10"
            >
              <X className="h-6 w-6" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-brand/10 bg-white px-4 py-3 lg:hidden">
          <button onClick={() => setOpen(true)} className="rounded-lg p-2 text-brand">
            <Menu className="h-6 w-6" />
          </button>
          <p className="font-black text-brand">لوحة التحكم</p>
        </header>

        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}