import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { updateEmployee } from "@/lib/actions/admin-employees"
import { redirect } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { revalidatePath } from "next/cache"

interface EditEmployeePageProps {
  params: { id: string }
}

export default async function EditEmployeePage({ params }: EditEmployeePageProps) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || (profile as any).role !== 'admin') redirect('/scan')

  const { data: employeeData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', params.id)
    .single()

  const employee = employeeData as any;

  if (!employee) redirect('/admin/employees')

  async function handleUpdate(formData: FormData) {
    'use server'
    await updateEmployee(params.id, formData)
  }

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Edit Karyawan</h1>

      <Card>
        <CardHeader>
          <CardTitle>Edit Data Karyawan</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleUpdate} className="space-y-4">
            <div>
              <Label htmlFor="full_name">Nama Lengkap</Label>
              <Input id="full_name" name="full_name" defaultValue={employee.full_name} required />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={employee.email} disabled />
            </div>
            <div>
              <Label htmlFor="phone">Telepon</Label>
              <Input id="phone" name="phone" defaultValue={employee.phone || ''} />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select name="role" defaultValue={employee.role}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Karyawan</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="is_active">Status</Label>
              <Select name="is_active" defaultValue={employee.is_active.toString()}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Aktif</SelectItem>
                  <SelectItem value="false">Nonaktif</SelectItem>
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
