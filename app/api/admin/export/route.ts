import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import * as XLSX from 'xlsx'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const officeId = searchParams.get('office')

  if (!from || !to || !officeId) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
  }

  const supabase = createServiceClient()

  const { data: attendance } = await supabase
    .from('attendance')
    .select(`
      *,
      profiles (full_name, email),
      offices (name)
    `)
    .eq('office_id', officeId)
    .gte('date', from)
    .lte('date', to)
    .order('date', { ascending: false })

  const workbook = XLSX.utils.book_new()

  const rows = attendance?.map((record: any) => ({
    'Tanggal': new Date(record.date).toLocaleDateString('id-ID'),
    'Nama': record.profiles?.full_name || '',
    'Email': record.profiles?.email || '',
    'Clock In': record.clock_in_at ? new Date(record.clock_in_at).toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta' }) : '',
    'Clock Out': record.clock_out_at ? new Date(record.clock_out_at).toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta' }) : '',
    'Durasi Kerja': record.clock_in_at && record.clock_out_at ?
      Math.floor((new Date(record.clock_out_at).getTime() - new Date(record.clock_in_at).getTime()) / 60000) + ' menit' : '',
    'Telat (menit)': record.minutes_late || 0,
    'Status': record.status === 'on_time' ? 'Tepat Waktu' :
              record.status === 'late' ? 'Terlambat' :
              record.status === 'absent' ? 'Tidak Hadir' : record.status,
  })) || []

  const worksheet = XLSX.utils.json_to_sheet(rows)
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Absensi')

  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="absensi-${from}-${to}.xlsx"`,
    },
  })
}
