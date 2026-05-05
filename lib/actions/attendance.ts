'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getJakartaNow, formatJakartaDate, getMinutesLate, canClockOut, getClockOutAvailableIn } from '@/lib/utils/date'

export async function clockIn(officeToken: string, fingerprint: string, userAgent: string) {
  const supabase = createClient()
  const user = await supabase.auth.getUser()

  if (!user.data.user) {
    return { error: 'Silakan login terlebih dahulu' }
  }

  const userId = user.data.user.id

  const { data: office } = await supabase
    .from('offices')
    .select('*')
    .eq('qr_code_token', officeToken)
    .single()

  if (!office) {
    return { error: 'Token kantor tidak valid' }
  }

  const now = getJakartaNow()
  const today = formatJakartaDate(now)
  const minutesLate = getMinutesLate(now, office.standard_clock_in)
  const status = minutesLate > 0 ? 'late' : 'on_time'

  const { data: existing } = await supabase
    .from('attendance')
    .select('id')
    .eq('user_id', userId)
    .eq('office_id', office.id)
    .eq('date', today)
    .single()

  if (existing) {
    return { error: 'Anda sudah melakukan clock in hari ini' }
  }

  // Get or create device
  let { data: device } = await supabase
    .from('devices')
    .select('id')
    .eq('user_id', userId)
    .eq('fingerprint', fingerprint)
    .single()

  if (!device) {
    const { data: newDevice } = await supabase
      .from('devices')
      .insert({
        user_id: userId,
        fingerprint: fingerprint,
        user_agent: userAgent,
      })
      .select('id')
      .single()
    device = newDevice
  } else {
    await supabase
      .from('devices')
      .update({ last_seen_at: now.toISOString() })
      .eq('id', device.id)
  }

  const { error } = await supabase.from('attendance').insert({
    user_id: userId,
    office_id: office.id,
    date: today,
    clock_in_at: now.toISOString(),
    minutes_late: minutesLate,
    status: status,
    device_id: device?.id || null,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/scan')
  return { success: true }
}

export async function clockOut(officeToken: string) {
  const supabase = createClient()
  const user = await supabase.auth.getUser()

  if (!user.data.user) {
    return { error: 'Silakan login terlebih dahulu' }
  }

  const userId = user.data.user.id

  const { data: office } = await supabase
    .from('offices')
    .select('*')
    .eq('qr_code_token', officeToken)
    .single()

  if (!office) {
    return { error: 'Token kantor tidak valid' }
  }

  const now = getJakartaNow()
  const today = formatJakartaDate(now)

  const { data: attendance } = await supabase
    .from('attendance')
    .select('*')
    .eq('user_id', userId)
    .eq('office_id', office.id)
    .eq('date', today)
    .single()

  if (!attendance) {
    return { error: 'Anda belum melakukan clock in hari ini' }
  }

  if (attendance.clock_out_at) {
    return { error: 'Anda sudah melakukan clock out hari ini' }
  }

  if (!canClockOut(attendance.clock_in_at, office.work_duration_minutes)) {
    const remaining = getClockOutAvailableIn(attendance.clock_in_at, office.work_duration_minutes)
    return {
      error: `Belum waktunya pulang. Anda bisa clock out pada jam ${formatJakartaTime(attendance.clock_in_at, office.work_duration_minutes)}`
    }
  }

  const { error } = await supabase
    .from('attendance')
    .update({
      clock_out_at: now.toISOString(),
      status: attendance.status === 'late' ? 'late' : 'on_time',
    })
    .eq('id', attendance.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/scan')
  return { success: true }
}

function formatJakartaTime(clockInAt: string, workDurationMinutes: number): string {
  const clockIn = new Date(clockInAt)
  const clockOut = new Date(clockIn.getTime() + workDurationMinutes * 60000)
  return clockOut.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' })
}

export async function getTodayAttendance(officeToken: string) {
  const supabase = createClient()
  const user = await supabase.auth.getUser()

  if (!user.data.user) {
    return null
  }

  const { data: office } = await supabase
    .from('offices')
    .select('*')
    .eq('qr_code_token', officeToken)
    .single()

  if (!office) return null

  const today = formatJakartaDate(getJakartaNow())

  const { data: attendance } = await supabase
    .from('attendance')
    .select('*')
    .eq('user_id', user.data.user.id)
    .eq('office_id', office.id)
    .eq('date', today)
    .single()

  return attendance
}

export async function getRecentAttendance(limit: number = 7) {
  const supabase = createClient()
  const user = await supabase.auth.getUser()

  if (!user.data.user) return []

  const { data } = await supabase
    .from('attendance')
    .select(`
      *,
      offices (name)
    `)
    .eq('user_id', user.data.user.id)
    .order('date', { ascending: false })
    .limit(limit)

  return data || []
}
