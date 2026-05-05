import { getJakarta, formatJakarta } from "@/lib/utils/date"
import { createClient } from "@/lib/supabase/server"
import { RealtimeAttendanceTable } from "./RealtimeAttendanceTable"

interface AttendanceTableProps {
  officeId: string
  fromDate?: string
  toDate?: string
  employeeId?: string
}

export async function AttendanceTable({ officeId, fromDate, toDate, employeeId }: AttendanceTableProps) {
  const supabase = createClient()

  let query = supabase
    .from('attendance')
    .select(`
      *,
      profiles (full_name, email),
      offices (name)
    `)
    .eq('office_id', officeId)
    .order('date', { ascending: false })

  if (fromDate) query = query.gte('date', fromDate)
  if (toDate) query = query.lte('date', toDate)
  if (employeeId) query = query.eq('user_id', employeeId)

  const { data: attendance } = await query

  return (
    <RealtimeAttendanceTable
      officeId={officeId}
      initialData={attendance || []}
      fromDate={fromDate}
      toDate={toDate}
      employeeId={employeeId}
    />
  )
}
