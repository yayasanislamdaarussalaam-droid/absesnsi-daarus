'use client'

import { useRef, useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { regenerateQR } from "@/lib/actions/admin"

export default function QRCodeClient({ initialToken }: { initialToken: string | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [token, setToken] = useState(initialToken || '')
  const [url, setUrl] = useState('')

  useEffect(() => {
    if (token) {
      const appUrl = (process.env.NEXT_PUBLIC_APP_URL || window.location.origin).replace(/\/$/, '')
      const fullUrl = `${appUrl}/scan?office=${token}`
      setUrl(fullUrl)
      QRCode.toCanvas(canvasRef.current, fullUrl, { width: 400 }, (error) => {
        if (error) console.error(error)
      })
    }
  }, [token])

  function downloadPNG() {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = 'qr-code-absensi.png'
    link.href = canvas.toDataURL()
    link.click()
  }

  async function handleRegenerate() {
    if (!confirm('Yakin ingin regenerate QR? QR lama tidak akan berlaku lagi.')) return
    const result = await regenerateQR()
    if (result?.token) {
      setToken(result.token)
      window.history.pushState({}, '', `?token=${result.token}`)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen p-4 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">QR Code Absensi</h1>
        <Card>
          <CardContent className="text-center p-8">
            <p>Token belum digenerate. Klik tombol di bawah untuk generate QR Code.</p>
            <Button onClick={handleRegenerate} className="mt-4">Generate QR Code</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">QR Code Absensi</h1>

      <Card>
        <CardHeader>
          <CardTitle>QR Code untuk Scan Absensi</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="bg-white p-4 inline-block rounded-lg">
            <canvas ref={canvasRef} />
          </div>
          <p className="text-sm text-muted-foreground break-all">{url}</p>
          <div className="flex gap-4 justify-center">
            <Button onClick={downloadPNG}>Download PNG</Button>
            <Button variant="destructive" onClick={handleRegenerate}>
              Regenerate QR
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Cetak QR ini dan tempel di pintu masuk kantor
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
