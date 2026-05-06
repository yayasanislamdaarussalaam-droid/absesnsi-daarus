import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendWhatsApp, formatClockOutReminder } from '@/lib/utils/whatsapp'

export async function GET(request: NextRequest) {
  const cronSecret = request.headers.get('authorization')?.replace('Bearer ', '')
  if (cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const today = new Date().toISOString().split('T')[0]

  // Calculate minutes left before standard clock-out (assuming 17:00 / 8 hours after 09:00)
  const now = new Date()
  const standardClockOut = new Date(now)
  standardClockOut.setHours(17, 0, 0, 0)
  const minutesLeft = Math.round((standardClockOut.getTime() - now.getTime()) / 60000)

  const { data: attendanceToday } = await supabase
    .from('attendance')
    .select(`
      user_id,
      profiles (phone, full_name)
    `)
    .is('clock_out_at', null)
    .eq('date', today)

  if (!attendanceToday) return NextResponse.json({ message: 'No one to remind' })

  for (const record of (attendanceToday as any[])) {
    if (record.profiles?.phone) {
      const message = formatClockOutReminder(record.profiles.full_name, minutesLeft)
      const result = await sendWhatsApp(record.profiles.phone, message)
      if (!result.success) {
        console.error(`Failed to send WA to ${record.profiles.phone}:`, result.error)
      }
    }
  }

  return NextResponse.json({ success: true })
}
