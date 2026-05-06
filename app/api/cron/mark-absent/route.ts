import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database.types'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
type OfficeIdRow = Pick<Database['public']['Tables']['offices']['Row'], 'id'>
type EmployeeRow = Pick<Database['public']['Tables']['profiles']['Row'], 'id' | 'email' | 'full_name'>
type AttendanceInsert = Database['public']['Tables']['attendance']['Insert']

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

  let absentCount = 0

  for (const office of offices) {
    const { data: employeesData } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('office_id', office.id)
      .eq('is_active', true)

    const employees = (employeesData ?? []) as EmployeeRow[]
    if (employees.length === 0) continue

    for (const emp of employees) {
      const { data: attendance } = await supabase
        .from('attendance')
        .select('id')
        .eq('user_id', emp.id)
        .eq('date', today)
        .single()

      if (!attendance) {
        const absentRecord: AttendanceInsert = {
          user_id: emp.id,
          office_id: office.id,
          date: today,
          status: 'absent',
        }

        await (supabase.from('attendance') as any).insert(absentRecord)
        absentCount++
      }
    }
  }

  return NextResponse.json({ success: true, absentCount })
}
