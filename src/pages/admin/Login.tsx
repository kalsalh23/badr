import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Landmark, LogIn, Shield } from 'lucide-react'
import { loginSchema, type LoginSchema } from '@/lib/schemas'
import { signInAdmin, getCurrentAdmin } from '@/services/adminService'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Alert from '@/components/ui/Alert'

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(values: LoginSchema) {
    setLoading(true)
    setError('')
    try {
      await signInAdmin(values.email, values.password)
      // التحقق من أن المستخدم مدير نظام
      const user = await getCurrentAdmin()
      if (!user) {
        setError('هذا الحساب غير مصرح له بالدخول إلى لوحة التحكم. تأكد من تنفيذ ملف create-admin.sql.')
        return
      }
      navigate('/admin')
    } catch (err) {
      const msg = err instanceof Error ? err.message : ''
      if (msg.includes('Invalid login')) {
        setError('البريد الإلكتروني أو كلمة المرور غير صحيحة. تأكد من إنشاء حساب المدير أولاً.')
      } else {
        setError(msg || 'حدث خطأ أثناء تسجيل الدخول')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-card bg-gold text-ink">
            <Landmark className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-black text-white">لوحة التحكم</h1>
          <p className="mt-2 text-white/70">إبلاغ الطيبة — مجلس مدينة طيبة الإمام</p>
        </div>

        <Card className="p-8">
          <div className="mb-6 flex items-center gap-2 text-brand">
            <Shield className="h-5 w-5" />
            <p className="font-black">تسجيل دخول المدير</p>
          </div>

          {error && (
            <div className="mb-4">
              <Alert tone="error">{error}</Alert>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="البريد الإلكتروني"
              placeholder=" "
              dir="ltr"
              autoComplete="off"
              {...register('email')}
              error={errors.email?.message}
            />
            <div className="relative">
              <Input
                label="كلمة المرور"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                dir="ltr"
                {...register('password')}
                error={errors.password?.message}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute left-3 top-[42px] text-ink-muted hover:text-brand"
                aria-label="إظهار كلمة المرور"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            <Button type="submit" variant="primary" disabled={loading} className="w-full">
              <LogIn className="h-5 w-5" />
              {loading ? 'جارٍ تسجيل الدخول...' : 'دخول'}
            </Button>
          </form>
        </Card>

        <p className="mt-6 text-center text-sm text-white/50">
          <a href="/" className="hover:text-white">← العودة إلى الموقع</a>
        </p>
      </div>
    </div>
  )
}