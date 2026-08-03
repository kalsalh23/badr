import { z } from 'zod'
import { PHONE_REGEX } from '@/lib/constants'

export const reportFormSchema = z.object({
  citizen_name: z
    .string()
    .min(8, 'الرجاء إدخال الاسم الثلاثي كاملاً (الاسم، الأب، الجد)')
    .max(100, 'الاسم طويل جداً'),
  citizen_phone: z
    .string()
    .regex(PHONE_REGEX, 'الرجاء إدخال رقم هاتف سوري صحيح (مثال: 09xxxxxxxx)'),
  citizen_id: z.string().optional(),
  type_id: z.string().min(1, 'الرجاء اختيار نوع البلاغ'),
  title: z.string().min(5, 'العنوان قصير جداً').max(80, 'العنوان طويل جداً'),
  description: z
    .string()
    .min(10, 'الرجاء كتابة وصف أوضح للبلاغ')
    .max(2000, 'الوصف طويل جداً'),
  street: z.string().optional(),
  neighborhood: z.string().optional(),
  landmark: z.string().optional(),
  lat: z.number().nullable().refine((v) => v !== null, 'الرجاء تحديد الموقع على الخريطة'),
  lng: z.number().nullable().refine((v) => v !== null, 'الرجاء تحديد الموقع على الخريطة'),
})

export type ReportFormSchema = z.infer<typeof reportFormSchema>

export const trackSchema = z.object({
  report_number: z
    .string()
    .trim()
    .min(1, 'الرجاء إدخال رقم البلاغ')
    .regex(/^TAY-\d{4}-\d{5}$/, 'صيغة رقم البلاغ غير صحيحة (مثال: TAY-2026-00012)'),
  phone: z.string().regex(PHONE_REGEX, 'الرجاء إدخال رقم هاتف صحيح'),
})

export type TrackSchema = z.infer<typeof trackSchema>

export const loginSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  password: z.string().min(6, 'كلمة المرور قصيرة جداً'),
})

export type LoginSchema = z.infer<typeof loginSchema>

export const statusUpdateSchema = z.object({
  status_id: z.string().min(1, 'الرجاء اختيار الحالة'),
  note: z.string().min(1, 'الرجاء كتابة ملاحظة').max(1000, 'الملاحظة طويلة جداً'),
})

export type StatusUpdateSchema = z.infer<typeof statusUpdateSchema>

export const contactsSchema = z.object({
  phone: z.string().optional(),
  email: z.string().email('البريد غير صحيح').optional().or(z.literal('')),
  address: z.string().optional(),
})

export type ContactsSchema = z.infer<typeof contactsSchema>