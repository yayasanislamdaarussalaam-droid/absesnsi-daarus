import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, QrCode, ShieldCheck, FileSpreadsheet } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <header className="bg-primary text-primary-foreground py-16 px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-4">Absensi Daarus</h1>
        <p className="text-xl md:text-2xl opacity-90 mb-8 max-w-2xl mx-auto">
          Sistem absensi QR Code modern, cepat, dan efisien untuk kantor masa kini.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild size="lg" variant="secondary" className="font-bold">
            <Link href="/login">Login Karyawan</Link>
          </Button>
        </div>
      </header>

      {/* Features Section */}
      <main className="flex-1 max-w-6xl mx-auto py-16 px-4 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-md">
          <CardContent className="pt-6 text-center">
            <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <QrCode className="text-primary w-6 h-6" />
            </div>
            <h3 className="font-bold mb-2">Scan & Go</h3>
            <p className="text-sm text-muted-foreground">
              Cukup scan QR Code di pintu masuk menggunakan kamera HP Anda.
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardContent className="pt-6 text-center">
            <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="text-primary w-6 h-6" />
            </div>
            <h3 className="font-bold mb-2">Real-time</h3>
            <p className="text-sm text-muted-foreground">
              Data kehadiran tercatat seketika, lengkap dengan durasi kerja.
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardContent className="pt-6 text-center">
            <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="text-primary w-6 h-6" />
            </div>
            <h3 className="font-bold mb-2">Aman</h3>
            <p className="text-sm text-muted-foreground">
              Binding perangkat memastikan absensi dilakukan secara valid.
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardContent className="pt-6 text-center">
            <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileSpreadsheet className="text-primary w-6 h-6" />
            </div>
            <h3 className="font-bold mb-2">Laporan Excel</h3>
            <p className="text-sm text-muted-foreground">
              Admin dapat mengunduh laporan bulanan dalam format Excel.
            </p>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Absensi Daarus. Built for efficiency.</p>
      </footer>
    </div>
  )
}
