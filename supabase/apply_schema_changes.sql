-- ترحيل: إزالة حقلي الرقم الوطني واسم الشارع من البلاغات
alter table public."Reports" drop column if exists citizen_id;
alter table public."Reports" drop column if exists street;

-- إزالة التحميل الزائد القديم لدالة submit_report قبل إنشاء الجديدة
drop function if exists public.submit_report(text, text, text, uuid, text, text, text, text, text, double precision, double precision);

-- إنشاء بلاغ جديد وإرجاع رقمه (بدون رقم وطني/شارع، مع درجة الخطورة)
create or replace function public.submit_report(
  p_citizen_name text,
  p_citizen_phone text,
  p_type_id uuid,
  p_title text,
  p_description text,
  p_neighborhood text,
  p_landmark text,
  p_lat double precision,
  p_lng double precision,
  p_severity text default 'منخفضة'
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
  v_severity text := coalesce(p_severity, 'منخفضة');
begin
  if v_severity not in ('مرتفعة', 'متوسطة', 'منخفضة') then
    v_severity := 'منخفضة';
  end if;

  select id into v_status_id from public."ReportStatus" where slug = 'new' limit 1;

  if v_status_id is null then
    raise exception 'STATUS_NOT_FOUND';
  end if;

  insert into public."Reports" (
    citizen_name, citizen_phone, type_id, status_id,
    title, description, neighborhood, landmark,
    lat, lng, severity, notes, is_resolved
  ) values (
    p_citizen_name, p_citizen_phone, p_type_id, v_status_id,
    p_title, p_description, p_neighborhood, p_landmark,
    p_lat, p_lng, v_severity, null, false
  )
  returning id, report_number into v_id, v_report_number;

  return jsonb_build_object('id', v_id, 'report_number', v_report_number);
end;
$$;

grant execute on function public.submit_report(text, text, uuid, text, text, text, text, double precision, double precision, text) to anon, authenticated;

-- تتبع البلاغ: إزالة حقلي الشارع ورقم الهوية من المخرجات
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
  select r.* into v_report
  from public."Reports" r
  where r.report_number = p_report_number
  limit 1;

  if not found then
    return jsonb_build_object('found', false, 'message', 'رقم البلاغ غير موجود');
  end if;

  select t.name into v_type
  from public."ReportTypes" t
  where t.id = v_report.type_id;

  select s.name, s.slug into v_status, v_status_slug
  from public."ReportStatus" s
  where s.id = v_report.status_id;

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

-- قراءة عامة لمعلومات الاتصال (صفحة "من نحن")
drop policy if exists "SystemSettings public read" on public."SystemSettings";
create policy "SystemSettings public read"
on public."SystemSettings" for select
to anon, authenticated
using (true);
