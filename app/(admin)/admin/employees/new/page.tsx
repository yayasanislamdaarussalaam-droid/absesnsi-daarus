import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { createEmployee } from "@/lib/actions/admin-employees"
import { redirect } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default async function NewEmployeePage() {
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
    <div className="min-h-screen p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Tambah Karyawan Baru</h1>

      <Card>
        <CardHeader>
          <CardTitle>Data Karyawan</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createEmployee} className="space-y-4">
            <input type="hidden" name="office_id" value={profile.office_id!} />
            <div>
              <Label htmlFor="full_name">Nama Lengkap</Label>
              <Input id="full_name" name="full_name" required />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div>
              <Label htmlFor="phone">Telepon</Label>
              <Input id="phone" name="phone" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required minLength={6} />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select name="role" defaultValue="employee">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Karyawan</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-4">
              <Button type="submit">Simpan</Button>
              <Button variant="outline" asChild>
                <a href="/admin/employees">Batal</a>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
