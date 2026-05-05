import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Clock, AlertTriangle, CheckCircle } from "lucide-react"
import { getJakartaNow, formatJakartaDate } from "@/lib/utils/date"
import { redirect } from "next/navigation"
import { AttendanceTable } from "@/components/admin/AttendanceTable"

export default async function AdminDashboard() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, office_id')
    .eq('id', user.id)
    .single()

  if (!profile || (profile as any).role !== 'admin') {
    redirect('/scan')
  }

  const adminProfile = profile as any;
  const today = formatJakartaDate(getJakartaNow())

  const { data: todayAttendance } = await supabase
    .from('attendance')
    .select('*')
    .eq('office_id', adminProfile.office_id)
    .eq('date', today)

  const records = (todayAttendance || []) as any[]

  const { count: totalEmployees } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('office_id', adminProfile.office_id)
    .eq('is_active', true)

  const present = records.filter(a => a.clock_in_at).length
  const late = records.filter(a => a.status === 'late').length
  const stillWorking = records.filter(a => a.clock_in_at && !a.clock_out_at).length

  return (
    <div className="min-h-screen p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Dashboard Admin</h1>

      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Karyawan</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmployees}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hadir Hari Ini</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{present}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Terlambat</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{late}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Belum Pulang</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stillWorking}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Absensi Hari Ini ({today})</CardTitle>
        </CardHeader>
        <CardContent>
          <AttendanceTable
            officeId={adminProfile.office_id!}
            fromDate={today}
            toDate={today}
          />
        </CardContent>
      </Card>
    </div>
  )
}
