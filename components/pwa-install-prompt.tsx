"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Download, X } from "lucide-react"

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    // Menangkap event beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      // Mencegah Chrome 67 dan yang lebih baru untuk menampilkan prompt otomatis
      e.preventDefault()
      // Simpan event agar dapat dipicu nanti
      setDeferredPrompt(e)
      // Tampilkan UI prompt instalasi
      setShowPrompt(true)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = () => {
    // Sembunyikan UI prompt instalasi
    setShowPrompt(false)

    // Tampilkan prompt instalasi
    deferredPrompt.prompt()

    // Tunggu pengguna merespons prompt
    deferredPrompt.userChoice.then((choiceResult: { outcome: string }) => {
      if (choiceResult.outcome === "accepted") {
        console.log("Pengguna menerima prompt instalasi")
      } else {
        console.log("Pengguna menolak prompt instalasi")
      }
      // Kita tidak memerlukan prompt lagi
      setDeferredPrompt(null)
    })
  }

  const handleDismissClick = () => {
    setShowPrompt(false)
  }

  if (!showPrompt) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50">
      <Card className="shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-1">Instal JalanYuk</h3>
              <p className="text-gray-600 text-sm mb-3">
                Instal aplikasi JalanYuk di perangkat Anda untuk pengalaman yang lebih baik dan akses offline.
              </p>
              <Button onClick={handleInstallClick} className="mr-2">
                <Download className="mr-2 h-4 w-4" />
                Instal Sekarang
              </Button>
              <Button variant="ghost" onClick={handleDismissClick}>
                Nanti Saja
              </Button>
            </div>
            <Button variant="ghost" size="icon" onClick={handleDismissClick} className="ml-2">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
