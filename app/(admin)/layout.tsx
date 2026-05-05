import { createClient, createServiceClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LogOut, Users, Clock, FileSpreadsheet, Settings, QrCode } from "lucide-react"
import { logout } from "@/lib/actions/auth"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const serviceClient = createServiceClient() // Use service role for elevated checks
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Bypass RLS using service role client
  const { data: profile } = await serviceClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || (profile as any).role !== 'admin') {
    redirect('/scan')
  }

  return (
    <div>
      <header className="border-b">
        <div className="max-w-6xl mx-auto p-4 flex justify-between items-center">
          <Link href="/admin" className="font-bold text-xl">
            Admin Dashboard
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/admin" className="text-sm hover:text-foreground">
              <Clock className="w-4 h-4 inline mr-1" />
              Dashboard
            </Link>
            <Link href="/admin/employees" className="text-sm hover:text-foreground">
              <Users className="w-4 h-4 inline mr-1" />
              Karyawan
            </Link>
            <Link href="/admin/attendance" className="text-sm hover:text-foreground">
              <Clock className="w-4 h-4 inline mr-1" />
              Absensi
            </Link>
            <Link href="/admin/export" className="text-sm hover:text-foreground">
              <FileSpreadsheet className="w-4 h-4 inline mr-1" />
              Export
            </Link>
            <Link href="/admin/settings" className="text-sm hover:text-foreground">
              <Settings className="w-4 h-4 inline mr-1" />
              Settings
            </Link>
            <Link href="/admin/qr" className="text-sm hover:text-foreground">
              <QrCode className="w-4 h-4 inline mr-1" />
              QR Code
            </Link>
            <form action={logout}>
              <Button variant="ghost" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </form>
          </nav>
        </div>
      </header>
      {children}
    </div>
  )
}
