import { createClient, createServiceClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { redirect } from "next/navigation"
import { NewEmployeeForm } from "@/components/admin/NewEmployeeForm"

export default async function NewEmployeePage() {
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

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Tambah Karyawan Baru</h1>

      <Card>
        <CardHeader>
          <CardTitle>Data Karyawan</CardTitle>
        </CardHeader>
        <CardContent>
          <NewEmployeeForm officeId={adminProfile.office_id!} />
        </CardContent>
      </Card>
    </div>
  )
}
