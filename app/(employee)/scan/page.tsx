import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getTodayAttendance, getRecentAttendance } from "@/lib/actions/attendance"
import { ClockInButton } from "@/components/attendance/ClockInButton"
import { ClockOutButton } from "@/components/attendance/ClockOutButton"
import { CountdownTimer } from "@/components/attendance/CountdownTimer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { logout } from "@/lib/actions/auth"
import { getJakartaNow, formatJakarta, getJakartaTime, canClockOut } from "@/lib/utils/date"
import { Clock, LogOut, History } from "lucide-react"
import Link from "next/link"

export default async function ScanPage({
  searchParams,
}: {
  searchParams: { office?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/login${searchParams.office ? `?office=${searchParams.office}` : ''}`)
  }

  if (!searchParams.office) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-destructive">Token Diperlukan</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p>Silakan scan QR Code di kantor untuk mengakses halaman ini.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, office_id')
    .eq('id', user.id)
    .single()

  const { data: office } = await supabase
    .from('offices')
    .select('*')
    .eq('qr_code_token', searchParams.office)
    .single()

  if (!office) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-destructive">Token Tidak Valid</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p>QR Code tidak valid. Silakan hubungi admin.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const attendance = await getTodayAttendance(searchParams.office)
  const recentAttendance = await getRecentAttendance(7)
  const now = getJakartaNow()

  return (
    <div className="max-w-md mx-auto py-8 px-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Halo, {profile?.full_name || 'Karyawan'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!attendance && (
            <div className="text-center space-y-4">
              <Clock className="w-16 h-16 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">Belum melakukan absensi hari ini</p>
              <ClockInButton officeToken={searchParams.office} />
            </div>
          )}

          {attendance && !attendance.clock_out_at && (
            <div className="text-center space-y-4">
              <div className="text-green-600">
                <Clock className="w-16 h-16 mx-auto" />
              </div>
              <p>Sudah masuk jam {formatJakarta(attendance.clock_in_at, 'HH:mm')}</p>
              {attendance.status === 'late' && (
                <p className="text-yellow-600">Terlambat {attendance.minutes_late} menit</p>
              )}
              <CountdownTimer
                clockInTime={attendance.clock_in_at}
                workDurationMinutes={office.work_duration_minutes}
              />
              <ClockOutButton
                officeToken={searchParams.office}
                disabled={!canClockOut(attendance.clock_in_at, office.work_duration_minutes)}
              />
            </div>
          )}

          {attendance && attendance.clock_out_at && (
            <div className="text-center space-y-2">
              <div className="text-blue-600">
                <Clock className="w-16 h-16 mx-auto" />
              </div>
              <p className="font-semibold">Sudah Pulang</p>
              <p>Masuk: {formatJakarta(attendance.clock_in_at, 'HH:mm')}</p>
              <p>Pulang: {formatJakarta(attendance.clock_out_at, 'HH:mm')}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Riwayat 7 Hari</h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/history">
              <History className="w-4 h-4 mr-2" />
              Lihat Semua
            </Link>
          </Button>
        </div>

        <div className="space-y-2">
          {recentAttendance.map((record: any) => (
            <Card key={record.id}>
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium">
                    {new Date(record.date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {record.clock_in_at ? formatJakarta(record.clock_in_at, 'HH:mm') : '-'} -
                    {record.clock_out_at ? formatJakarta(record.clock_out_at, 'HH:mm') : '...'}
                  </p>
                </div>
                <span className={`text-sm px-2 py-1 rounded ${
                  record.status === 'on_time' ? 'bg-green-100 text-green-800' :
                  record.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {record.status === 'on_time' ? 'Tepat Waktu' :
                   record.status === 'late' ? `Terlambat ${record.minutes_late}m` :
                   record.status}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
