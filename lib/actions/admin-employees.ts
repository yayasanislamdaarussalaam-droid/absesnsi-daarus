'use server'

import { revalidatePath } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

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
