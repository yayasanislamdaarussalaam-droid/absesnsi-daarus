import { createClient } from "@/lib/supabase/server"
import { AttendanceTable } from "@/components/admin/AttendanceTable"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

export default async function AttendanceLogPage({
  searchParams,
}: {
  searchParams: { from?: string; to?: string; status?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, office_id')
    .eq('id', user.id)
    .single()

  if (!profile || (profile as any).role !== 'admin') redirect('/scan')

  const adminProfile = profile as any;

  return (
    <div className="min-h-screen p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Log Absensi</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm">Dari Tanggal</label>
              <Input type="date" name="from" defaultValue={searchParams.from} />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm">Sampai Tanggal</label>
              <Input type="date" name="to" defaultValue={searchParams.to} />
            </div>
            <div className="flex items-end">
              <Button type="submit">Filter</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <AttendanceTable
        officeId={adminProfile.office_id!}
        fromDate={searchParams.from}
        toDate={searchParams.to}
      />
    </div>
  )
}
