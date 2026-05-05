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

  const { data: attendanceToday } = await supabase
    .from('attendance')
    .select(`
      user_id,
      profiles (email, full_name)
    `)
    .is('clock_out_at', null)
    .eq('date', today)

  if (!attendanceToday) return NextResponse.json({ message: 'No one to remind' })

  for (const record of (attendanceToday as any[])) {
    if (record.profiles?.email) {
      await resend.emails.send({
        from: 'absensi@daarus.com',
        to: record.profiles.email,
        subject: 'Reminder: Jangan lupa clock-out!',
        html: `<p>Halo ${record.profiles.full_name},</p><p>Jangan lupa untuk melakukan clock-out hari ini.</p>`,
      })
    }
  }

  return NextResponse.json({ success: true })
}
