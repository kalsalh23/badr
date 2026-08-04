import { Landmark, MapPin, Phone, Mail, Shield, Users, Target, Code2, Smartphone } from 'lucide-react'
import { MUNICIPALITY_NAME, PLATFORM_NAME, CITY_CENTER, CITY_NAME, DEVELOPER_NAME, DEVELOPER_PHONE } from '@/lib/constants'
import MapView from '@/components/map/Map'

export default function About() {
  return (
    <div className="space-y-12">
      {/* العنوان */}
      <section className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-card bg-brand text-white">
          <Landmark className="h-8 w-8" />
        </div>
        <h1 className="text-4xl font-black text-ink">من نحن</h1>
        <p className="mx-auto mt-4 max-w-3xl text-lg leading-relaxed text-ink-secondary">
          {PLATFORM_NAME} منصة رقمية رسمية أنشأها {MUNICIPALITY_NAME} بهدف تسهيل التواصل
          بين المواطنين والإدارة البلدية، لمعالجة المشكلات الخدمية في مدينة طيبة الإمام بأسرع وقت ممكن.
        </p>
      </section>

      {/* الرسالة والهدف */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="card p-8">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand text-white">
            <Target className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-black text-ink">رسالتنا</h3>
          <p className="mt-3 leading-relaxed text-ink-secondary">
            توفير قناة مباشرة وشفافة بين المواطنين و {MUNICIPALITY_NAME} لاستقبال البلاغات
            ومتابعة معالجتها، بما يخدم مصلحة المواطن ويعزز الشفافية في العمل البلدي.
          </p>
        </div>
        <div className="card p-8">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gold text-ink">
            <Users className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-black text-ink">هدفنا</h3>
          <p className="mt-3 leading-relaxed text-ink-secondary">
            تحسين جودة الخدمات البلدية في مدينة طيبة الإمام من خلال استيعاب جميع بلاغات المواطنين
            وتحويلها إلى عمل ميداني فعّال، مع متابعة دورية لحالة كل بلاغ حتى إتمام المعالجة.
          </p>
        </div>
      </div>

      {/* كيف تعمل المنصة */}
      <section className="card p-8">
        <h3 className="mb-6 text-2xl font-black text-ink text-center">كيف تعمل المنصة؟</h3>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              step: '١',
              title: 'أبلغ',
              desc: 'سجّل بلاغك بسهولة عبر إدخال بياناتك وموضوع البلاغ مع تحديد الموقع على الخريطة.',
            },
            {
              step: '٢',
              title: 'نتابع',
              desc: 'تتلقى الإدارة البلدية بلاغك فوراً وتعمل على معالجته، ويمكنك متابعة حالته.',
            },
            {
              step: '٣',
              title: 'ننجز',
              desc: 'تتم معالجة المشكلة ويتم تحديث حالة البلاغ، ويمكنك الاطلاع على صور بعد الإصلاح.',
            },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-2xl font-black text-white">
                {item.step}
              </div>
              <h4 className="text-lg font-black text-ink">{item.title}</h4>
              <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* أنواع البلاغات المقبولة */}
      <section className="card p-8">
        <h3 className="mb-6 text-2xl font-black text-ink text-center">أنواع البلاغات المقبولة</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            'ريجار بدون غطاء',
            'ريجار يحتاج صيانة',
            'حفرة في الطريق',
            'طلب فرش طريق',
            'إنارة معطلة',
            'تسرب مياه',
            'تراكم نفايات',
            'أخرى',
          ].map((type) => (
            <div key={type} className="rounded-card bg-surface p-4 text-center text-sm font-bold">
              {type}
            </div>
          ))}
        </div>
      </section>

      {/* معلومات الاتصال والموقع */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="card p-8">
          <h3 className="mb-4 text-xl font-black text-ink">معلومات الاتصال</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-white">
                <Landmark className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold">{MUNICIPALITY_NAME}</p>
                <p className="text-sm text-ink-secondary">المبنى الرئيسي للمجلس</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface text-brand">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold">{CITY_NAME}</p>
                <p className="text-sm text-ink-secondary">محافظة حماة، سوريا</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface text-brand">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold" dir="ltr">+963 33 XXXXXX</p>
                <p className="text-sm text-ink-secondary">ساعات العمل: ٨ صباحاً - ٤ عصراً</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface text-brand">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold" dir="ltr">info@taybet.gov.sy</p>
                <p className="text-sm text-ink-secondary">للاستفسارات والاقتراحات</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-8">
          <h3 className="mb-4 text-xl font-black text-ink">موقعنا على الخريطة</h3>
          <MapView
            lat={CITY_CENTER.lat}
            lng={CITY_CENTER.lng}
            className="h-[240px]"
            markers={[{ lat: CITY_CENTER.lat, lng: CITY_CENTER.lng, title: MUNICIPALITY_NAME }]}
          />
          <p className="mt-3 flex items-center gap-2 text-sm text-ink-secondary">
            <MapPin className="h-4 w-4 text-gold" />
            {CITY_NAME} — منطقة مركز حماة
          </p>
        </div>
      </div>

      {/* مطور المنصة */}
      <section className="overflow-hidden rounded-card bg-gradient-to-br from-brand via-brand to-emerald-900 p-8 text-center text-white md:p-12">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gold text-ink shadow-lg">
          <Code2 className="h-8 w-8" />
        </div>
        <p className="text-sm font-bold tracking-widest text-gold">مطور المنصة</p>
        <h3 className="mt-3 text-3xl font-black md:text-4xl">{DEVELOPER_NAME}</h3>
        <p className="mx-auto mt-4 max-w-xl leading-relaxed text-white/85">
          هندسة وتطوير وتصميم هذه المنصة على يد المطور {DEVELOPER_NAME}،
          لخدمة أهالي مدينة طيبة الإمام وربطهم بالإدارة البلدية بسهولة وشفافية.
        </p>
        <a
          href={`tel:${DEVELOPER_PHONE}`}
          className="mt-8 inline-flex items-center justify-center gap-3 rounded-full bg-white px-8 py-3 font-black text-brand shadow-lg transition hover:bg-gold"
        >
          <Smartphone className="h-5 w-5" />
          <span dir="ltr">{DEVELOPER_PHONE}</span>
        </a>
      </section>

      {/* الحقوق */}
      <div className="rounded-card bg-surface p-6 text-center">
        <div className="flex items-center justify-center gap-2 text-brand">
          <Shield className="h-5 w-5" />
          <p className="font-black">حقوق محفوظة</p>
        </div>
        <p className="mt-2 text-sm text-ink-secondary">
          جميع الحقوق محفوظة © {new Date().getFullYear()} — {MUNICIPALITY_NAME}
        </p>
      </div>
    </div>
  )
}