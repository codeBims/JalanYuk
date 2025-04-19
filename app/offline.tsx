"use client"

import { Button } from "@/components/ui/button"
import { MapPin, WifiOff, RefreshCw } from "lucide-react"

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="text-center max-w-md">
        <div className="bg-blue-100 p-6 rounded-full inline-flex items-center justify-center mb-6">
          <WifiOff className="h-12 w-12 text-blue-600" />
        </div>

        <h1 className="text-3xl font-bold mb-4">Anda Sedang Offline</h1>

        <p className="text-gray-600 mb-8">
          Sepertinya Anda tidak terhubung ke internet. Beberapa fitur JalanYuk mungkin tidak tersedia dalam mode
          offline.
        </p>

        <div className="space-y-4">
          <Button className="w-full" onClick={() => window.location.reload()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Coba Lagi
          </Button>

          <Button variant="outline" className="w-full" onClick={() => (window.location.href = "/")}>
            <MapPin className="mr-2 h-4 w-4" />
            Kembali ke Beranda
          </Button>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          <p>Beberapa fitur JalanYuk tetap dapat diakses dalam mode offline:</p>
          <ul className="mt-2 space-y-1">
            <li>• Melihat itinerary yang tersimpan</li>
            <li>• Melihat tempat wisata yang pernah dikunjungi</li>
            <li>• Mengakses peta yang telah di-cache sebelumnya</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
