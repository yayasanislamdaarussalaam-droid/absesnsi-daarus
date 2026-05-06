import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LogOut, QrCode, History } from "lucide-react"
import { logout } from "@/lib/actions/auth"

export default async function EmployeeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    const headersList = await headers()
    const url = new URL(headersList.get('x-url') || headersList.get('referer') || 'http://localhost')
    const office = url.searchParams.get('office')
    redirect(`/register${office ? `?office=${office}` : ''}`)
  }

  return (
    <div>
      <header className="border-b">
        <div className="max-w-6xl mx-auto p-4 flex justify-between items-center">
          <Link href="/scan" className="font-bold text-xl">
            Absensi Daarus
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/history" className="text-sm text-muted-foreground hover:text-foreground">
              <History className="w-4 h-4 inline mr-1" />
              Riwayat
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
