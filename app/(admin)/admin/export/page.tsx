import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileSpreadsheet } from "lucide-react"

export default async function ExportPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, office_id')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') redirect('/scan')

  return (
    <div className="min-h-screen p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Export Excel</h1>

      <Card>
        <CardHeader>
          <CardTitle>Export Data Absensi</CardTitle>
        </CardHeader>
        <CardContent>
          <form action="/api/admin/export" method="get" className="space-y-4">
            <input type="hidden" name="office" value={profile.office_id!} />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm">Dari Tanggal</label>
                <Input type="date" name="from" required />
              </div>
              <div>
                <label className="text-sm">Sampai Tanggal</label>
                <Input type="date" name="to" required />
              </div>
            </div>
            <Button type="submit">
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Download Excel
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
