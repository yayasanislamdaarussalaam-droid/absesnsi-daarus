'use server'

import { revalidatePath } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { sendWhatsApp, formatClockInReminder } from '@/lib/utils/whatsapp'

export async function createEmployee(formData: FormData) {
  const supabase = createServiceClient()

  const fullName = formData.get('full_name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const phone = formData.get('phone') as string
  const role = formData.get('role') as 'employee' | 'admin'
  const officeId = formData.get('office_id') as string

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (data.user) {
    await (supabase
      .from('profiles') as any)
      .update({
        full_name: fullName,
        phone,
        office_id: officeId,
        role,
      })
      .eq('id', data.user.id)

    // Send WhatsApp notification to employee
    if (phone) {
      const loginUrl = process.env.NEXT_PUBLIC_APP_URL || ''
      const message = `🎉 Selamat! Akun Absensi Daarus Anda telah dibuat!\n\nNama: ${fullName}\nEmail: ${email}\nPassword: ${password}\n\nSilakan login di:\n${loginUrl}\n\nJangan lupa scan QR Code di kantor untuk absensi ya! 😊`
      
      const result = await sendWhatsApp(phone, message)
      if (!result.success) {
        console.error('Failed to send WhatsApp:', result.error)
      }
    }
  }

  revalidatePath('/admin/employees')
  redirect('/admin/employees')
}

export async function updateEmployee(employeeId: string, formData: FormData) {
  const supabase = createServiceClient()

  const fullName = formData.get('full_name') as string
  const phone = formData.get('phone') as string
  const role = formData.get('role') as 'employee' | 'admin'
  const isActive = formData.get('is_active') === 'true'

  await (supabase
    .from('profiles') as any)
    .update({
      full_name: fullName,
      phone,
      role,
      is_active: isActive,
    })
    .eq('id', employeeId)

  revalidatePath('/admin/employees')
  redirect('/admin/employees')
}

export async function deleteEmployee(employeeId: string) {
  const supabase = createServiceClient()

  await supabase.auth.admin.deleteUser(employeeId)

  revalidatePath('/admin/employees')
  return { success: true }
}
