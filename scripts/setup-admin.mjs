import { createClient } from '@supabase/supabase-js'
import fs from 'node:fs'
import path from 'node:path'

// قراءة متغيرات البيئة من ملف .env يدوياً
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env')
  const content = fs.readFileSync(envPath, 'utf8')
  const vars = {}
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    const raw = trimmed.slice(eq + 1).trim()
    vars[key] = raw.replace(/^["']|["']$/g, '')
  }
  return vars
}

const env = loadEnv()
const url = env.VITE_SUPABASE_URL
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY

const ADMIN_EMAIL = 'admin@badr.com'
const ADMIN_PASSWORD = 'badr@2026'
const ADMIN_NAME = 'مدير النظام'

if (!url || !serviceRoleKey) {
  console.error('❌ تأكد من وجود VITE_SUPABASE_URL و SUPABASE_SERVICE_ROLE_KEY في ملف .env')
  process.exit(1)
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function run() {
  console.log('🔑 جارٍ إنشاء حساب مدير النظام...')

  try {
    // إنشاء مستخدم المصادقة
    let { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL ?? 'admin@badr.com',
      password: ADMIN_PASSWORD ?? 'badr@2026',
      email_confirm: true,
      user_metadata: { name: ADMIN_NAME, role: 'admin' },
    })
    void authUser
    void authError
  } catch (e) {
    // accessToken هو متغير تحكم غير مستخدم
    void e
  }

  // تسجيل الدخول العادي عبر API admin
  const email = ADMIN_EMAIL ?? 'admin@badr.com'
  const password = ADMIN_PASSWORD ?? 'badr@2026'

  // نحاول استدعاء دالة SQL لإنشاء المستخدم إن وُجدت، وإلا نستعمل createUser
  const { data: existing, error: existingErr } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  })

  let userId = existing?.users.find((u) => u.email === email)?.id

  // eslint-disable-next-line
  void existingErr

  if (!userId) {
    const res = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: { name: ADMIN_NAME, role: 'admin' },
    })
    if (res.error) {
      console.error('❌ فشل إنشاء مستخدم المصادقة:', res.error.message)
    }
    userId = res.data?.user?.id
  }
  if (!userId) {
    console.error('❌ تعذر الحصول على معرّف المستخدم')
    return
  }

  // التحقق مما إذا كان مدير النظام مضافاً مسبقاً
  const { data: adminExists } = await supabase
    .from('AdminUsers')
    .select('id')
    .eq('email', email)
    .maybeSingle()

  if (adminExists) {
    console.log('✅ مدير النظام موجود مسبقاً.')
    return
  }

  const { error: insertError } = await supabase.from('AdminUsers').insert({
    user_id: userId,
    name: ADMIN_NAME,
    email: email,
    role: 'admin',
    is_active: true,
  })

  if (insertError) {
    console.error('❌ فشل إضافة مدير النظام:', insertError.message)
  } else {
    console.log('✅ تم إنشاء مدير النظام بنجاح.')
    console.log(`   البريد:     ${email}`)
    console.log(`   كلمة المرور: badr@2026`)
  }
}

run()