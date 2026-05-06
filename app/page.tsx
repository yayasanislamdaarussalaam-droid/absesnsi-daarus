'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, QrCode, ShieldCheck, FileSpreadsheet, X } from "lucide-react"
import { useState, useEffect } from "react"

export default function LandingPage() {
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasVisited = localStorage.getItem('hasVisited')
      if (!hasVisited) {
        setShowOnboarding(true)
        localStorage.setItem('hasVisited', 'true')
      }
    }
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      {/* Onboarding Modal */}
      {showOnboarding && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Selamat Datang di Absensi Daarus!</h2>
              <button onClick={() => setShowOnboarding(false)} className="p-1">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-primary/5 p-4 rounded-lg">
                <h3 className="font-bold text-lg mb-2">📱 Cara Daftar:</h3>
                <ol className="list-decimal list-inside space-y-2">
                  <li>Scan QR Code di pintu masuk kantor menggunakan HP</li>
                  <li>Anda akan diarahkan ke halaman pendaftaran</li>
                  <li>Isi nama lengkap, email, dan password</li>
                  <li>Klik "Daftar" dan akun Anda siap digunakan!</li>
                </ol>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-bold text-lg mb-2">✅ Setelah Daftar:</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Login menggunakan email dan password yang didaftarkan</li>
                  <li>Scan QR Code lagi untuk melakukan absensi (Clock In)</li>
                  <li>Scan saat pulang untuk Clock Out</li>
                  <li>Cek riwayat absensi di menu "Riwayat"</li>
                </ul>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-bold text-lg mb-2">⚡ Fitur:</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Absensi real-time dengan QR Code</li>
                  <li>Notifikasi email pengingat (jika diaktifkan)</li>
                  <li>Riwayat absensi 7 hari terakhir</li>
                  <li>Laporan Excel untuk admin</li>
                </ul>
              </div>

              <div className="text-center pt-4">
                <Button onClick={() => setShowOnboarding(false)} size="lg" className="w-full">
                  Mulai Gunakan
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <header className="bg-primary text-primary-foreground py-16 px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-4">Absensi Daarus</h1>
        <p className="text-xl md:text-2xl opacity-90 mb-8 max-w-2xl mx-auto">
          Sistem absensi QR Code modern, cepat, dan efisien untuk kantor masa kini.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Button asChild size="lg" variant="secondary" className="font-bold">
            <Link href="/login">Login Karyawan</Link>
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="font-bold bg-transparent border-white text-white hover:bg-white hover:text-primary"
            onClick={() => setShowOnboarding(true)}
          >
            Panduan
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
