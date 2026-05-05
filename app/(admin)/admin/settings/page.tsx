import { createClient, createServiceClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { updateOfficeSettings } from "@/lib/actions/admin"
import { redirect } from "next/navigation"

export default async function SettingsPage() {
  const supabase = createClient()
  const serviceClient = createServiceClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await serviceClient
    .from('profiles')
    .select('role, office_id')
    .eq('id', user.id)
    .single()

  if (!profile || (profile as any).role !== 'admin') redirect('/scan')

  const adminProfile = profile as any;

  const { data: officeData } = await serviceClient
    .from('offices')
    .select('*')
    .eq('id', adminProfile.office_id!)
    .single()

  const office = officeData as any;

  // Wrapper for server action to satisfy TS type
  async function handleSubmit(formData: FormData) {
    'use server'
    await updateOfficeSettings(formData)
  }

  return (
    <div className="min-h-screen p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Pengaturan Kantor</h1>

      <Card>
        <CardHeader>
          <CardTitle>Informasi Kantor</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <input type="hidden" name="office_id" value={adminProfile.office_id!} />
            <div>
              <Label htmlFor="name">Nama Kantor</Label>
              <Input id="name" name="name" defaultValue={office?.name} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="standard_clock_in">Jam Masuk Standar</Label>
                <Input id="standard_clock_in" name="standard_clock_in" type="time" defaultValue={office?.standard_clock_in} required />
              </div>
              <div>
                <Label htmlFor="standard_clock_out">Jam Pulang Standar</Label>
                <Input id="standard_clock_out" name="standard_clock_out" type="time" defaultValue={office?.standard_clock_out} required />
              </div>
            </div>
            <div>
              <Label htmlFor="work_duration_minutes">Durasi Kerja (menit)</Label>
              <Input id="work_duration_minutes" name="work_duration_minutes" type="number" defaultValue={office?.work_duration_minutes} required />
            </div>
            <Button type="submit">Simpan Pengaturan</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
