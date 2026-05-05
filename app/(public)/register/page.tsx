'use client'

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { register } from "@/lib/actions/auth"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export default function RegisterPage({
  searchParams,
}: {
  searchParams: { office?: string }
}) {
  const [isLoading, setIsLoading] = useState(false)

  if (!searchParams.office) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-destructive">Token Diperlukan</CardTitle>
            <CardDescription>
              Pendaftaran harus melalui scan QR Code di kantor.
              Silakan scan QR Code terlebih dahulu.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild>
              <Link href="/">Kembali ke Beranda</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    const result = await register(formData)
    if (result?.error) {
      toast.error(result.error)
      setIsLoading(false)
    }
    // If no error, the server action will perform a redirect, 
    // which Next.js handles automatically by throwing a special error 
    // that we shouldn't catch here manually if we want the redirect to work.
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Daftar Akun</CardTitle>
          <CardDescription>Buat akun karyawan baru</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nama Lengkap</Label>
              <Input id="full_name" name="full_name" required disabled={isLoading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required disabled={isLoading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required minLength={6} disabled={isLoading} />
            </div>
            <input type="hidden" name="office_token" value={searchParams.office} />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                "Daftar"
              )}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Sudah punya akun?{" "}
            <Link href={`/login${searchParams.office ? `?office=${searchParams.office}` : ''}`} className="text-primary hover:underline">
              Login di sini
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
