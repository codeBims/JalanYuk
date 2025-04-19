import { Loader2 } from "lucide-react"

export default function RouteLoading() {
  return (
    <div className="flex flex-col items-center justify-center py-6 bg-blue-50 rounded-md">
      <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
      <p className="text-gray-700 font-medium">Sedang menghitung rute terbaik untuk perjalanan Anda...</p>
      <p className="text-sm text-gray-500 mt-2">Ini mungkin memerlukan waktu beberapa detik</p>
    </div>
  )
}
