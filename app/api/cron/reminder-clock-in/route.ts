import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendWhatsApp, formatClockInReminder } from '@/lib/utils/whatsapp'
import type { Database } from '@/types/database.types'

type OfficeIdRow = Pick<Database['public']['Tables']['offices']['Row'], 'id'>
type EmployeeRow = Pick<Database['public']['Tables']['profiles']['Row'], 'id' | 'phone' | 'full_name'>

export async function GET(request: NextRequest) {
  const cronSecret = request.headers.get('authorization')?.replace('Bearer ', '')
  if (cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const today = new Date().toISOString().split('T')[0]

  const { data: officesData, error: officesError } = await supabase.from('offices').select('id')
  if (officesError || !officesData?.length) {
    return NextResponse.json({ message: 'No offices' })
  }
  const offices: { id: string }[] = officesData

  // Calculate minutes left before standard clock-in (assuming 09:00)
  const now = new Date()
  const standardClockIn = new Date(now)
  standardClockIn.setHours(9, 0, 0, 0)
  const minutesLeft = Math.round((standardClockIn.getTime() - now.getTime()) / 60000)

  for (const office of offices) {
    const { data: employeesData } = await supabase
      .from('profiles')
      .select('id, phone, full_name')
      .eq('office_id', office.id)
      .eq('is_active', true)

    const employees = (employeesData ?? []) as EmployeeRow[]
    if (employees.length === 0) continue

    for (const emp of employees) {
      if (!emp.phone) continue

      const { data: attendance } = await supabase
        .from('attendance')
        .select('id')
        .eq('user_id', emp.id)
        .eq('date', today)
        .single()

      if (!attendance) {
        const message = formatClockInReminder(emp.full_name, minutesLeft)
        const result = await sendWhatsApp(emp.phone, message)
        if (!result.success) {
          console.error(`Failed to send WA to ${emp.phone}:`, result.error)
        }
      }
    }
  }

  return NextResponse.json({ success: true })
}
