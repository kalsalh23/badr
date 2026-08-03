import { Link, NavLink, Outlet } from 'react-router-dom'
import { FileText, Landmark, LayoutDashboard, MapPin, Shield, Info } from 'lucide-react'
import { MUNICIPALITY_NAME, PLATFORM_NAME } from '@/lib/constants'

const navItems = [
  { to: '/', label: 'الرئيسية', icon: Landmark, end: true },
  { to: '/report', label: 'تقديم بلاغ', icon: FileText },
  { to: '/statistics', label: 'الإحصائيات', icon: LayoutDashboard },
  { to: '/map', label: 'خريطة البلاغات', icon: MapPin },
  { to: '/about', label: 'من نحن', icon: Info },
]

export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="sticky top-0 z-50 border-b border-brand/10 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-page items-center justify-between gap-4 px-4 py-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-card bg-brand text-white">
              <Landmark className="h-6 w-6" />
            </div>
            <div>
              <p className="text-lg font-black leading-tight text-brand">{PLATFORM_NAME}</p>
              <p className="text-xs text-ink-secondary">{MUNICIPALITY_NAME}</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition ${
                    isActive ? 'bg-brand text-white' : 'text-ink-secondary hover:bg-surface'
                  }`
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <Link
            to="/admin/login"
            className="flex items-center gap-2 rounded-full border-2 border-brand/20 px-4 py-2 text-sm font-bold text-brand transition hover:border-brand hover:bg-brand hover:text-white"
          >
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">لوحة التحكم</span>
          </Link>
        </div>

        {/* شريط تنقل سفلي للجوال */}
        <nav className="flex items-center justify-around border-t border-brand/10 px-2 py-2 md:hidden">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 rounded-xl px-3 py-1 text-[11px] font-bold ${
                  isActive ? 'text-brand' : 'text-ink-secondary'
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-page flex-1 px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-brand/10 bg-surface py-10">
        <div className="mx-auto max-w-page px-4">
          <div className="flex flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-right">
            <div>
              <p className="text-lg font-black text-brand">{PLATFORM_NAME}</p>
              <p className="mt-1 text-sm text-ink-secondary">
                منصة رسمية مقدمة من {MUNICIPALITY_NAME} لاستقبال بلاغات المواطنين ومتابعة معالجتها.
              </p>
            </div>
            <div className="space-y-1 text-sm text-ink-secondary">
              <p>مدينة طيبة الإمام — محافظة حماة، سوريا</p>
              <p className="flex items-center justify-center gap-2 md:justify-start">
                <Shield className="h-4 w-4 text-gold" />
                جميع الحقوق محفوظة © {new Date().getFullYear()}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}