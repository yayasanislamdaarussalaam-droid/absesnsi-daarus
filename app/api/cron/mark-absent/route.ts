import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(request: NextRequest) {
  const cronSecret = request.headers.get('authorization')?.replace('Bearer ', '')
  if (cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const today = new Date().toISOString().split('T')[0]

  const { data: offices } = await supabase.from('offices').select('id')
  if (!offices) return NextResponse.json({ message: 'No offices' })

  let absentCount = 0

  for (const office of offices) {
    const { data: employees } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('office_id', office.id)
      .eq('is_active', true)

    if (!employees) continue

    for (const emp of employees) {
      const { data: attendance } = await supabase
        .from('attendance')
        .select('id')
        .eq('user_id', emp.id)
        .eq('date', today)
        .single()

      if (!attendance) {
        await supabase.from('attendance').insert({
          user_id: emp.id,
          office_id: office.id,
          date: today,
          status: 'absent',
        })
        absentCount++
      }
    }
  }

  return NextResponse.json({ success: true, absentCount })
}
