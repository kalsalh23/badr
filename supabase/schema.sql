-- ============================================================
-- إبلاغ الطيبة — مخطط قاعدة البيانات
-- مجلس مدينة طيبة الإمام
-- ============================================================

create extension if not exists "uuid-ossp";

-- ============================================================
-- الجداول الأساسية
-- ============================================================

-- أنواع البلاغات
create table if not exists public."ReportTypes" (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  slug text not null unique,
  icon text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- حالات البلاغ
create table if not exists public."ReportStatus" (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  slug text not null unique,
  color text not null default '#B9A779',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- البلاغات
create table if not exists public."Reports" (
  id uuid primary key default uuid_generate_v4(),
  report_number text not null unique,
  citizen_name text not null,
  citizen_phone text not null,
  citizen_id text,
  type_id uuid not null references public."ReportTypes"(id),
  title text not null,
  description text not null,
  street text,
  neighborhood text,
  landmark text,
  lat double precision not null,
  lng double precision not null,
  severity text not null default 'منخفضة' check (severity in ('مرتفعة','متوسطة','منخفضة')),
  status_id uuid not null references public."ReportStatus"(id),
  notes text,
  is_resolved boolean not null default false,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- المرفقات (صور قبل وبعد الإصلاح)
create table if not exists public."Attachments" (
  id uuid primary key default uuid_generate_v4(),
  report_id uuid not null references public."Reports"(id) on delete cascade,
  url text not null,
  storage_path text not null,
  kind text not null default 'before' check (kind in ('before','after')),
  created_at timestamptz not null default now()
);

-- مستخدمو لوحة التحكم
create table if not exists public."AdminUsers" (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid unique references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  role text not null default 'admin' check (role in ('admin','moderator')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- تحديثات البلاغ
create table if not exists public."ReportUpdates" (
  id uuid primary key default uuid_generate_v4(),
  report_id uuid not null references public."Reports"(id) on delete cascade,
  status_id uuid references public."ReportStatus"(id),
  note text,
  changed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- توليد رقم البلاغ تلقائياً
-- ============================================================
create sequence if not exists report_number_seq start 1;

create or replace function public.generate_report_number()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.report_number := 'TAY-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('report_number_seq')::text, 5, '0');
  return new;
end;
$$;

drop trigger if exists trg_generate_report_number on public."Reports";
create trigger trg_generate_report_number
before insert on public."Reports"
for each row execute function public.generate_report_number();

-- تحديث updated_at عند التعديل
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_touch_reports_updated on public."Reports";
create trigger trg_touch_reports_updated
before update on public."Reports"
for each row execute function public.touch_updated_at();

-- ============================================================
-- بيانات البذور (Seed)
-- ============================================================

insert into public."ReportTypes" (name, slug, icon, sort_order) values
  ('ريجار بدون غطاء', 'manhole-no-cover', 'CircleDashed', 1),
  ('ريجار يحتاج صيانة', 'manhole-maintenance', 'Wrench', 2),
  ('حفرة في الطريق', 'road-hole', 'CircleDot', 3),
  ('طلب فرش طريق', 'road-asphalt', 'Road', 4),
  ('إنارة معطلة', 'street-light', 'Lightbulb', 5),
  ('تسرب مياه', 'water-leak', 'Droplets', 6),
  ('تراكم نفايات', 'waste-accumulation', 'Trash2', 7),
  ('أخرى', 'other', 'Flag', 8)
on conflict (slug) do nothing;

insert into public."ReportStatus" (name, slug, color, sort_order) values
  ('جديد', 'new', '#B9A779', 1),
  ('قيد المراجعة', 'in_review', '#988561', 2),
  ('قيد التنفيذ', 'in_progress', '#054239', 3),
  ('تم الإنجاز', 'completed', '#1E7A4C', 4),
  ('مغلق', 'closed', '#6B1F2A', 5)
on conflict (slug) do nothing;

-- ============================================================
-- RLS — تفعيل الأمان على مستوى الصفوف
-- ============================================================
alter table public."Reports" enable row level security;
alter table public."Attachments" enable row level security;
alter table public."ReportUpdates" enable row level security;
alter table public."AdminUsers" enable row level security;
alter table public."ReportTypes" enable row level security;
alter table public."ReportStatus" enable row level security;

-- دالة التحقق من مدير النظام
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public."AdminUsers"
    where user_id = auth.uid() and is_active = true
  );
$$;

-- ============================================================
-- سياسات RLS
-- ============================================================

-- ReportTypes: قراءة عامة
drop policy if exists "ReportTypes public read" on public."ReportTypes";
create policy "ReportTypes public read"
on public."ReportTypes" for select
to anon, authenticated
using (true);

-- ReportStatus: قراءة عامة
drop policy if exists "ReportStatus public read" on public."ReportStatus";
create policy "ReportStatus public read"
on public."ReportStatus" for select
to anon, authenticated
using (true);

-- Reports: إدراج عام (مواطن جديد يقدم بلاغاً)
drop policy if exists "Reports public insert" on public."Reports";
create policy "Reports public insert"
on public."Reports" for insert
to anon, authenticated
with check (true);

-- Reports: إدارة كاملة لمديري النظام
drop policy if exists "Reports admin all" on public."Reports";
create policy "Reports admin all"
on public."Reports" for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Reports: لا قراءة عامة مباشرة — تتم عبر الدوال المؤمنة فقط

-- Attachments: إدراج عام
drop policy if exists "Attachments public insert" on public."Attachments";
create policy "Attachments public insert"
on public."Attachments" for insert
to anon, authenticated
with check (true);

-- Attachments: إدارة كاملة للمدير
drop policy if exists "Attachments admin all" on public."Attachments";
create policy "Attachments admin all"
on public."Attachments" for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- ReportUpdates: إدراج للمدير فقط
drop policy if exists "ReportUpdates admin insert" on public."ReportUpdates";
create policy "ReportUpdates admin insert"
on public."ReportUpdates" for insert
to authenticated
with check (public.is_admin());

-- ReportUpdates: قراءة للمدير فقط
drop policy if exists "ReportUpdates admin read" on public."ReportUpdates";
create policy "ReportUpdates admin read"
on public."ReportUpdates" for select
to authenticated
using (public.is_admin());

-- AdminUsers: مدير واحد فقط يستطيع قراءة قائمة المديرين (لا قراءة عامة)
drop policy if exists "AdminUsers admin read" on public."AdminUsers";
create policy "AdminUsers admin read"
on public."AdminUsers" for select
to authenticated
using (public.is_admin());

drop policy if exists "AdminUsers admin write" on public."AdminUsers";
create policy "AdminUsers admin write"
on public."AdminUsers" for insert
to authenticated
with check (public.is_admin());

-- ============================================================
-- دوال الوصول العام المؤمَّنة (Security Definer)
-- ============================================================

-- الإحصائيات العامة
create or replace function public.public_stats()
returns jsonb
language sql
security definer
set search_path = public
stable
as $$
  select jsonb_build_object(
    'total', (select count(*) from public."Reports"),
    'new', (select count(*) from public."Reports" where "ReportStatus".slug = 'new'),
    'in_progress', (select count(*) from public."Reports" where "ReportStatus".slug in ('in_review','in_progress')),
    'completed', (select count(*) from public."Reports" where "ReportStatus".slug = 'completed'),
    'closed', (select count(*) from public."Reports" where "ReportStatus".slug = 'closed'),
    'avg_resolution_days', (select round(coalesce(avg(extract(epoch from (resolved_at - created_at)) / 86400.0), 0)::numeric, 1) from public."Reports" where resolved_at is not null)
  );
$$;

grant execute on function public.public_stats() to anon, authenticated;

-- مواقع البلاغات للخريطة (بدون بيانات شخصية)
create or replace function public.public_report_locations()
returns table (
  id uuid,
  report_number text,
  title text,
  lat double precision,
  lng double precision,
  type_name text,
  status_name text,
  status_slug text,
  severity text,
  created_at timestamptz
)
language sql
security definer
set search_path = public
stable
as $$
  select
    r.id,
    r.report_number,
    r.title,
    r.lat,
    r.lng,
    t.name as type_name,
    s.name as status_name,
    s.slug as status_slug,
    r.severity,
    r.created_at
  from public."Reports" r
  join public."ReportTypes" t on t.id = r.type_id
  join public."ReportStatus" s on s.id = r.status_id;
$$;

grant execute on function public.public_report_locations() to anon, authenticated;

-- تتبع البلاغ بالرقم والهاتف
create or replace function public.public_track_report(p_report_number text, p_phone text)
returns jsonb
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_report public."Reports";
  v_type text;
  v_status text;
  v_status_slug text;
  v_attachments jsonb;
  v_latest_update jsonb;
begin
  select r.*, t.name, s.name, s.slug into v_report, v_type, v_status, v_status_slug
  from public."Reports" r
  join public."ReportTypes" t on t.id = r.type_id
  join public."ReportStatus" s on s.id = r.status_id
  where r.report_number = p_report_number
  limit 1;

  if not found then
    return jsonb_build_object('found', false, 'message', 'رقم البلاغ غير موجود');
  end if;

  -- التحقق من مطابقة رقم الهاتف
  if v_report.citizen_phone <> p_phone then
    return jsonb_build_object('found', false, 'message', 'بيانات التتبع غير صحيحة');
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'id', a.id, 'url', a.url, 'kind', a.kind, 'created_at', a.created_at
  ) order by a.created_at), '[]'::jsonb)
  into v_attachments
  from public."Attachments" a
  where a.report_id = v_report.id;

  select jsonb_build_object(
    'note', u.note, 'status', s.name, 'status_slug', s.slug,
    'created_at', u.created_at
  )
  into v_latest_update
  from public."ReportUpdates" u
  left join public."ReportStatus" s on s.id = u.status_id
  where u.report_id = v_report.id
  order by u.created_at desc
  limit 1;

  return jsonb_build_object(
    'found', true,
    'report', jsonb_build_object(
      'id', v_report.id,
      'report_number', v_report.report_number,
      'title', v_report.title,
      'description', v_report.description,
      'type', v_type,
      'status', v_status,
      'status_slug', v_status_slug,
      'severity', v_report.severity,
      'street', v_report.street,
      'neighborhood', v_report.neighborhood,
      'landmark', v_report.landmark,
      'lat', v_report.lat,
      'lng', v_report.lng,
      'notes', v_report.notes,
      'created_at', v_report.created_at,
      'updated_at', v_report.updated_at
    ),
    'attachments', v_attachments,
    'latest_update', v_latest_update
  );
end;
$$;

grant execute on function public.public_track_report(text, text) to anon, authenticated;

-- ============================================================
-- إرسال البلاغ وحفظه بشكل آمن (Security Definer ليتجاوز RLS)
-- السماح بالإدراج مع إرجاع النتيجة دون الحاجة لسياسة SELECT عامة
-- على جداول Reports / Attachments (وهو سبب فشل إرسال البلاغ سابقاً)
-- ============================================================

-- إنشاء بلاغ جديد وإرجاع رقمه
create or replace function public.submit_report(
  p_citizen_name text,
  p_citizen_phone text,
  p_citizen_id text,
  p_type_id uuid,
  p_title text,
  p_description text,
  p_street text,
  p_neighborhood text,
  p_landmark text,
  p_lat double precision,
  p_lng double precision
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status_id uuid;
  v_id uuid;
  v_report_number text;
begin
  select id into v_status_id from public."ReportStatus" where slug = 'new' limit 1;

  if v_status_id is null then
    raise exception 'STATUS_NOT_FOUND';
  end if;

  insert into public."Reports" (
    citizen_name, citizen_phone, citizen_id, type_id, status_id,
    title, description, street, neighborhood, landmark,
    lat, lng, severity, notes, is_resolved
  ) values (
    p_citizen_name, p_citizen_phone, p_citizen_id, p_type_id, v_status_id,
    p_title, p_description, p_street, p_neighborhood, p_landmark,
    p_lat, p_lng, 'منخفضة', null, false
  )
  returning id, report_number into v_id, v_report_number;

  return jsonb_build_object('id', v_id, 'report_number', v_report_number);
end;
$$;

grant execute on function public.submit_report(text, text, text, uuid, text, text, text, text, text, double precision, double precision) to anon, authenticated;

-- إضافة مرفق (صورة) إلى بلاغ معيّن وإرجاعه
create or replace function public.add_attachment(
  p_report_id uuid,
  p_url text,
  p_storage_path text,
  p_kind text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_url text;
  v_storage_path text;
  v_kind text;
  v_created_at timestamptz;
begin
  insert into public."Attachments" (report_id, url, storage_path, kind)
  values (p_report_id, p_url, p_storage_path, p_kind)
  returning id, url, storage_path, kind, created_at
  into v_id, v_url, v_storage_path, v_kind, v_created_at;

  return jsonb_build_object(
    'id', v_id, 'report_id', p_report_id,
    'url', v_url, 'storage_path', v_storage_path,
    'kind', v_kind, 'created_at', v_created_at
  );
end;
$$;

grant execute on function public.add_attachment(uuid, text, text, text) to anon, authenticated;

-- جلب أنواع البلاغات النشطة (لإظهار قائمة "نوع البلاغ" بشكل موثوق)
create or replace function public.get_report_types()
returns table (
  id uuid,
  name text,
  slug text,
  icon text,
  sort_order int,
  is_active boolean
)
language sql
security definer
set search_path = public
stable
as $$
  select t.id, t.name, t.slug, t.icon, t.sort_order, t.is_active
  from public."ReportTypes" t
  where t.is_active = true
  order by t.sort_order asc;
$$;

grant execute on function public.get_report_types() to anon, authenticated;

-- ============================================================
-- Storage: إنشاء دلو الصور
-- ============================================================
insert into storage.buckets (id, name, public)
values ('report-images', 'report-images', true)
on conflict (id) do nothing;

create policy "report-images public read"
on storage.objects for select
to public
using (bucket_id = 'report-images');

create policy "report-images public insert"
on storage.objects for insert
to anon, authenticated
with check (bucket_id = 'report-images');

create policy "report-images admin delete"
on storage.objects for delete
to authenticated
using (bucket_id = 'report-images' and public.is_admin());
