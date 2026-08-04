-- ============================================================
-- إعدادات النظام (SystemSettings) — بيانات التواصل القابلة للتعديل
-- ============================================================
create table if not exists public."SystemSettings" (
  key text primary key,
  value text not null default '',
  updated_at timestamptz not null default now()
);

alter table public."SystemSettings" enable row level security;

-- الإعدادات: إدارة كاملة لمديري النظام فقط
drop policy if exists "SystemSettings admin all" on public."SystemSettings";
create policy "SystemSettings admin all"
on public."SystemSettings" for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- ============================================================
-- إحصائيات لوحة التحكم (عدّادات دقيقة من الخادم)
-- ============================================================
create or replace function public.admin_stats()
returns jsonb
language sql
security definer
set search_path = public
stable
as $$
  select jsonb_build_object(
    'total', (select count(*) from public."Reports"),
    'new', (select count(*) from public."Reports" r join public."ReportStatus" s on s.id = r.status_id where s.slug = 'new'),
    'in_review', (select count(*) from public."Reports" r join public."ReportStatus" s on s.id = r.status_id where s.slug = 'in_review'),
    'in_progress', (select count(*) from public."Reports" r join public."ReportStatus" s on s.id = r.status_id where s.slug = 'in_progress'),
    'completed', (select count(*) from public."Reports" r join public."ReportStatus" s on s.id = r.status_id where s.slug = 'completed'),
    'closed', (select count(*) from public."Reports" r join public."ReportStatus" s on s.id = r.status_id where s.slug = 'closed'),
    'avg_resolution_days', (select round(coalesce(avg(extract(epoch from (r.resolved_at - r.created_at)) / 86400.0), 0)::numeric, 1) from public."Reports" r where r.resolved_at is not null)
  );
$$;

grant execute on function public.admin_stats() to authenticated;

-- عدّادات مفصّلة حسب الحالة (لوحة الإحصائيات)
create or replace function public.admin_status_counts()
returns jsonb
language sql
security definer
set search_path = public
stable
as $$
  select jsonb_agg(jsonb_build_object(
    'id', s.id, 'name', s.name, 'slug', s.slug, 'color', s.color,
    'count', (select count(*) from public."Reports" r where r.status_id = s.id)
  ) order by s.sort_order)
  from public."ReportStatus" s;
$$;

grant execute on function public.admin_status_counts() to authenticated;

-- عدّادات مفصّلة حسب النوع (لوحة الإحصائيات)
create or replace function public.admin_type_counts()
returns jsonb
language sql
security definer
set search_path = public
stable
as $$
  select jsonb_agg(jsonb_build_object(
    'id', t.id, 'name', t.name,
    'count', (select count(*) from public."Reports" r where r.type_id = t.id)
  ) order by t.sort_order)
  from public."ReportTypes" t;
$$;

grant execute on function public.admin_type_counts() to authenticated;
