'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function updateOfficeSettings(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') redirect('/scan')

  const officeId = formData.get('office_id') as string
  const name = formData.get('name') as string
  const standardClockIn = formData.get('standard_clock_in') as string
  const standardClockOut = formData.get('standard_clock_out') as string
  const workDurationMinutes = parseInt(formData.get('work_duration_minutes') as string)

  await supabase
    .from('offices')
    .update({
      name,
      standard_clock_in: standardClockIn,
      standard_clock_out: standardClockOut,
      work_duration_minutes: workDurationMinutes,
    })
    .eq('id', officeId)

  revalidatePath('/admin/settings')
  return { success: true }
}

export async function regenerateQR() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, office_id')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') redirect('/scan')

  const newToken = crypto.randomUUID().replace(/-/g, '') + Date.now().toString(36)
  await supabase
    .from('offices')
    .update({ qr_code_token: newToken })
    .eq('id', profile.office_id!)

  revalidatePath('/admin/qr')
  return { token: newToken }
}

export async function getOfficeToken() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('office_id')
    .eq('id', user.id)
    .single()

  if (!profile) return null

  const { data: office } = await supabase
    .from('offices')
    .select('qr_code_token')
    .eq('id', profile.office_id!)
    .single()

  return office?.qr_code_token || null
}
