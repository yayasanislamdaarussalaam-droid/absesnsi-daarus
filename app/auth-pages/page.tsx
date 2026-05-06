import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { QrCode, Clock, Users, Shield } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-muted">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Absensi Daarus</h1>
          <p className="text-xl text-muted-foreground">
            Sistem Absensi QR Code untuk Kantor Anda
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="text-center">
              <QrCode className="w-8 h-8 mx-auto mb-2 text-primary" />
              <CardTitle className="text-lg">Scan QR</CardTitle>
              <CardDescription>Scan QR Code di kantor untuk absen</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="text-center">
              <Clock className="w-8 h-8 mx-auto mb-2 text-primary" />
              <CardTitle className="text-lg">Clock In/Out</CardTitle>
              <CardDescription>Absen masuk dan pulang dengan mudah</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="text-center">
              <Shield className="w-8 h-8 mx-auto mb-2 text-primary" />
              <CardTitle className="text-lg">Aman</CardTitle>
              <CardDescription>Data terjamin keamanannya</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/register">Daftar</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
