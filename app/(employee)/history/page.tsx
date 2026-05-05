import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getJakartaNow, formatJakarta } from "@/lib/utils/date"
import { redirect } from "next/navigation"

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: { period?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const period = searchParams.period || 'this_month'
  const now = getJakartaNow()

  let startDate: Date
  let endDate = now

  switch (period) {
    case 'last_month':
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      endDate = new Date(now.getFullYear(), now.getMonth(), 0)
      break
    case 'this_month':
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      break
  }

  const { data: attendance } = await supabase
    .from('attendance')
    .select(`
      *,
      offices (name, standard_clock_in)
    `)
    .eq('user_id', user.id)
    .gte('date', startDate.toISOString().split('T')[0])
    .lte('date', endDate.toISOString().split('T')[0])
    .order('date', { ascending: false })

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Riwayat Absensi</h1>
        <a href="/scan" className="text-sm text-primary">Kembali</a>
      </div>

      <div className="mb-4">
        <Select value={period} onValueChange={(v) => window.location.href = `/history?period=${v}`}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="this_month">Bulan Ini</SelectItem>
            <SelectItem value="last_month">Bulan Lalu</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {attendance?.map((record: any) => (
          <Card key={record.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">
                    {new Date(record.date).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Masuk: {record.clock_in_at ? formatJakarta(record.clock_in_at, 'HH:mm') : '-'}
                    {record.clock_out_at ? ` | Pulang: ${formatJakarta(record.clock_out_at, 'HH:mm')}` : ' | Belum pulang'}
                  </p>
                  {record.minutes_late > 0 && (
                    <p className="text-sm text-yellow-600">Terlambat {record.minutes_late} menit</p>
                  )}
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  record.status === 'on_time' ? 'bg-green-100 text-green-800' :
                  record.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {record.status === 'on_time' ? 'Tepat Waktu' :
                   record.status === 'late' ? 'Terlambat' :
                   record.status === 'absent' ? 'Tidak Hadir' : record.status}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}

        {(!attendance || attendance.length === 0) && (
          <div className="text-center py-8 text-muted-foreground">
            Tidak ada data absensi
          </div>
        )}
      </div>
    </div>
  )
}
