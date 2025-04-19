"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, addDays, differenceInDays } from "date-fns"
import { CalendarIcon, Clock, Plus, Trash2, Save, RefreshCw, Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { id } from "date-fns/locale"
import MapIntegration from "@/components/map-integration"

interface ItineraryItem {
  id: string
  attraction: string
  time: string
  notes: string
  position?: [number, number] | null
}

interface ItineraryDay {
  date: Date
  items: ItineraryItem[]
}

interface Itinerary {
  id?: string
  title: string
  description: string
  startDate: Date
  endDate: Date
  days: ItineraryDay[]
}

// Destinasi populer di Bali dengan koordinat
const baliDestinations = [
  {
    name: "Pantai Kuta",
    position: [-8.7184, 115.1686] as [number, number],
    notes: "Bawa sunscreen dan handuk",
  },
  {
    name: "Tanah Lot",
    position: [-8.6215, 115.0865] as [number, number],
    notes: "Cek pasang surut air sebelum berkunjung",
  },
  {
    name: "Uluwatu Temple",
    position: [-8.8291, 115.0849] as [number, number],
    notes: "Nonton Kecak Dance di sore hari",
  },
  {
    name: "Ubud Monkey Forest",
    position: [-8.5195, 115.2587] as [number, number],
    notes: "Hati-hati dengan barang bawaan",
  },
  {
    name: "Tegallalang Rice Terrace",
    position: [-8.4312, 115.2777] as [number, number],
    notes: "Spot foto terbaik di pagi hari",
  },
  {
    name: "Seminyak Beach",
    position: [-8.6913, 115.1571] as [number, number],
    notes: "Nikmati sunset di pantai",
  },
  {
    name: "Bali Safari & Marine Park",
    position: [-8.5875, 115.3272] as [number, number],
    notes: "Bawa kamera dan topi",
  },
  {
    name: "Waterbom Bali",
    position: [-8.7276, 115.1726] as [number, number],
    notes: "Bawa baju ganti dan perlengkapan renang",
  },
  {
    name: "Jimbaran Bay",
    position: [-8.7908, 115.1551] as [number, number],
    notes: "Makan malam seafood di pinggir pantai",
  },
  {
    name: "Pura Besakih",
    position: [-8.3739, 115.4517] as [number, number],
    notes: "Pakai pakaian sopan untuk masuk ke pura",
  },
  {
    name: "Nusa Dua Beach",
    position: [-8.8008, 115.2317] as [number, number],
    notes: "Cocok untuk aktivitas watersport",
  },
  {
    name: "Sanur Beach",
    position: [-8.6783, 115.2636] as [number, number],
    notes: "Pantai yang tenang dengan sunrise yang indah",
  },
  {
    name: "Bali Swing",
    position: [-8.4208, 115.2887] as [number, number],
    notes: "Bawa kamera untuk foto-foto",
  },
  {
    name: "Garuda Wisnu Kencana",
    position: [-8.8103, 115.1675] as [number, number],
    notes: "Patung ikonik dan pertunjukan budaya",
  },
  {
    name: "Gunung Batur",
    position: [-8.2414, 115.3753] as [number, number],
    notes: "Trekking untuk melihat sunrise",
  },
]

// Destinasi populer di Yogyakarta dengan koordinat
const yogyaDestinations = [
  {
    name: "Candi Borobudur",
    position: [-7.6079, 110.2038] as [number, number],
    notes: "Datang pagi untuk menghindari keramaian",
  },
  {
    name: "Candi Prambanan",
    position: [-7.752, 110.4914] as [number, number],
    notes: "Saksikan pertunjukan Ramayana di malam hari",
  },
  {
    name: "Malioboro",
    position: [-7.7928, 110.3664] as [number, number],
    notes: "Belanja oleh-oleh dan kuliner malam",
  },
  {
    name: "Keraton Yogyakarta",
    position: [-7.8053, 110.3642] as [number, number],
    notes: "Pelajari sejarah dan budaya Yogyakarta",
  },
  {
    name: "Taman Sari",
    position: [-7.81, 110.3594] as [number, number],
    notes: "Bekas pemandian kerajaan yang indah",
  },
  {
    name: "Pantai Parangtritis",
    position: [-8.0257, 110.3327] as [number, number],
    notes: "Nikmati sunset dan naik delman",
  },
  {
    name: "Gunung Merapi",
    position: [-7.5407, 110.4457] as [number, number],
    notes: "Lava tour dengan jeep",
  },
  {
    name: "Goa Pindul",
    position: [-7.9536, 110.6517] as [number, number],
    notes: "Cave tubing dengan pemandangan indah",
  },
  {
    name: "Bukit Bintang",
    position: [-7.8232, 110.1305] as [number, number],
    notes: "Spot foto dengan pemandangan kota di malam hari",
  },
  {
    name: "Alun-alun Kidul",
    position: [-7.8119, 110.3642] as [number, number],
    notes: "Coba masangin (jalan dengan mata tertutup di antara dua pohon beringin)",
  },
]

// Destinasi populer di Jakarta dengan koordinat
const jakartaDestinations = [
  {
    name: "Monas",
    position: [-6.1754, 106.8272] as [number, number],
    notes: "Monumen nasional dengan museum di dalamnya",
  },
  {
    name: "Ancol",
    position: [-6.1273, 106.8451] as [number, number],
    notes: "Taman rekreasi dengan pantai dan Dunia Fantasi",
  },
  {
    name: "Kota Tua",
    position: [-6.1376, 106.8133] as [number, number],
    notes: "Area bersejarah dengan museum dan bangunan kolonial",
  },
  {
    name: "TMII",
    position: [-6.3024, 106.8951] as [number, number],
    notes: "Taman Mini Indonesia Indah dengan replika budaya Indonesia",
  },
  {
    name: "Museum Nasional",
    position: [-6.1769, 106.8222] as [number, number],
    notes: "Museum dengan koleksi arkeologi dan etnografi",
  },
  {
    name: "Ragunan",
    position: [-6.3141, 106.8208] as [number, number],
    notes: "Kebun binatang dengan berbagai satwa",
  },
  {
    name: "Grand Indonesia",
    position: [-6.1952, 106.8219] as [number, number],
    notes: "Pusat perbelanjaan mewah",
  },
  {
    name: "Kepulauan Seribu",
    position: [-5.7585, 106.565] as [number, number],
    notes: "Pulau-pulau dengan pantai dan snorkeling",
  },
  {
    name: "Istiqlal Mosque",
    position: [-6.1699, 106.8309] as [number, number],
    notes: "Masjid terbesar di Asia Tenggara",
  },
  {
    name: "Lapangan Banteng",
    position: [-6.171, 106.8336] as [number, number],
    notes: "Taman kota dengan monumen pembebasan Irian Barat",
  },
]

// Destinasi populer di Bandung dengan koordinat
const bandungDestinations = [
  {
    name: "Tangkuban Perahu",
    position: [-6.7597, 107.6095] as [number, number],
    notes: "Gunung berapi dengan pemandangan kawah",
  },
  {
    name: "Kawah Putih",
    position: [-7.1662, 107.4023] as [number, number],
    notes: "Danau kawah dengan air berwarna putih kehijauan",
  },
  {
    name: "Dago Pakar",
    position: [-6.8546, 107.6186] as [number, number],
    notes: "Area rekreasi dengan pemandangan kota Bandung",
  },
  {
    name: "Lembang",
    position: [-6.8132, 107.6194] as [number, number],
    notes: "Kawasan wisata dengan berbagai atraksi",
  },
  {
    name: "Cihampelas Walk",
    position: [-6.8939, 107.6048] as [number, number],
    notes: "Pusat perbelanjaan dengan tema jeans",
  },
  {
    name: "Gedung Sate",
    position: [-6.9027, 107.6186] as [number, number],
    notes: "Bangunan bersejarah dengan arsitektur unik",
  },
  {
    name: "Saung Angklung Udjo",
    position: [-6.9389, 107.6683] as [number, number],
    notes: "Pertunjukan musik tradisional angklung",
  },
  {
    name: "Farmhouse Lembang",
    position: [-6.8327, 107.6046] as [number, number],
    notes: "Wisata dengan tema Eropa",
  },
  {
    name: "Tebing Keraton",
    position: [-6.8344, 107.6633] as [number, number],
    notes: "Spot dengan pemandangan alam yang indah",
  },
  {
    name: "Floating Market Lembang",
    position: [-6.8286, 107.6162] as [number, number],
    notes: "Pasar terapung dengan berbagai kuliner",
  },
]

// Fungsi untuk mendapatkan destinasi berdasarkan lokasi
const getDestinationsByLocation = (location: string) => {
  location = location.toLowerCase()
  if (location.includes("bali")) return baliDestinations
  if (location.includes("yogya") || location.includes("jogja")) return yogyaDestinations
  if (location.includes("jakarta")) return jakartaDestinations
  if (location.includes("bandung")) return bandungDestinations

  // Default ke Bali jika lokasi tidak dikenali
  return baliDestinations
}

export default function ItineraryPlanner() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, saveItinerary, getUserItineraries, deleteItinerary } = useAuth()

  // Perbaikan error hydration dengan memastikan konsistensi antara server dan client
  // Ubah bagian useState untuk itinerary agar menggunakan fungsi inisialisasi
  const [itinerary, setItinerary] = useState<Itinerary>(() => ({
    title: "",
    description: "",
    startDate: new Date(),
    endDate: addDays(new Date(), 2),
    days: [],
  }))

  const [userItineraries, setUserItineraries] = useState<any[]>([])
  const [selectedDay, setSelectedDay] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showSaveSuccess, setShowSaveSuccess] = useState(false)
  const [showLoginAlert, setShowLoginAlert] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [itineraryToDelete, setItineraryToDelete] = useState<string | null>(null)
  const [showLoadDialog, setShowLoadDialog] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [routePoints, setRoutePoints] = useState<Array<[number, number]>>([])

  // Initialize days based on date range
  useEffect(() => {
    const dayCount = differenceInDays(itinerary.endDate, itinerary.startDate) + 1
    const newDays: ItineraryDay[] = []

    for (let i = 0; i < dayCount; i++) {
      const date = addDays(itinerary.startDate, i)
      // Check if we already have this day
      const existingDay = itinerary.days.find((day) => format(day.date, "yyyy-MM-dd") === format(date, "yyyy-MM-dd"))

      if (existingDay) {
        newDays.push(existingDay)
      } else {
        newDays.push({
          date,
          items: [],
        })
      }
    }

    setItinerary((prev) => ({
      ...prev,
      days: newDays,
    }))
  }, [itinerary.startDate, itinerary.endDate])

  // Load user itineraries
  useEffect(() => {
    if (isAuthenticated) {
      loadUserItineraries()
    }
  }, [isAuthenticated])

  // Efek untuk menghitung rute ketika item itinerary berubah
  useEffect(() => {
    calculateRoute()
  }, [itinerary.days])

  const loadUserItineraries = async () => {
    try {
      const itineraries = await getUserItineraries()
      setUserItineraries(itineraries)
    } catch (error) {
      console.error("Error loading itineraries:", error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setItinerary((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleDateChange = (field: "startDate" | "endDate", date: Date | undefined) => {
    if (!date) return

    if (field === "startDate") {
      // If start date is after end date, adjust end date
      if (date > itinerary.endDate) {
        setItinerary((prev) => ({
          ...prev,
          startDate: date,
          endDate: addDays(date, 1),
        }))
      } else {
        setItinerary((prev) => ({
          ...prev,
          startDate: date,
        }))
      }
    } else {
      // If end date is before start date, don't update
      if (date < itinerary.startDate) return

      setItinerary((prev) => ({
        ...prev,
        endDate: date,
      }))
    }
  }

  const addItineraryItem = (dayIndex: number) => {
    const newItem: ItineraryItem = {
      id: Date.now().toString(),
      attraction: "",
      time: "",
      notes: "",
      position: null,
    }

    const updatedDays = [...itinerary.days]
    updatedDays[dayIndex].items.push(newItem)

    setItinerary((prev) => ({
      ...prev,
      days: updatedDays,
    }))
  }

  const updateItineraryItem = (dayIndex: number, itemIndex: number, field: keyof ItineraryItem, value: string) => {
    const updatedDays = [...itinerary.days]
    updatedDays[dayIndex].items[itemIndex][field] = value

    // Jika field adalah attraction, coba cari posisi dari destinasi yang cocok
    if (field === "attraction") {
      const destinations = getDestinationsByLocation(itinerary.title)
      const matchingDestination = destinations.find(
        (dest) =>
          dest.name.toLowerCase().includes(value.toLowerCase()) ||
          value.toLowerCase().includes(dest.name.toLowerCase()),
      )

      if (matchingDestination) {
        updatedDays[dayIndex].items[itemIndex].position = matchingDestination.position

        // Jika notes kosong, tambahkan notes dari destinasi
        if (!updatedDays[dayIndex].items[itemIndex].notes && matchingDestination.notes) {
          updatedDays[dayIndex].items[itemIndex].notes = matchingDestination.notes
        }
      }
    }

    setItinerary((prev) => ({
      ...prev,
      days: updatedDays,
    }))
  }

  const removeItineraryItem = (dayIndex: number, itemIndex: number) => {
    const updatedDays = [...itinerary.days]
    updatedDays[dayIndex].items.splice(itemIndex, 1)

    setItinerary((prev) => ({
      ...prev,
      days: updatedDays,
    }))
  }

  // Fungsi untuk menghitung rute berdasarkan item itinerary
  const calculateRoute = () => {
    // Kumpulkan semua item dengan posisi yang valid untuk hari yang dipilih
    const currentDay = itinerary.days[selectedDay]
    if (!currentDay) return

    const validItems = currentDay.items.filter((item) => item.position)

    if (validItems.length < 2) {
      setRoutePoints([])
      return
    }

    // Buat rute sederhana yang menghubungkan semua titik
    const points: Array<[number, number]> = validItems.map((item) => item.position as [number, number])

    // Tambahkan beberapa titik antara untuk membuat rute terlihat lebih realistis
    const enhancedRoute: Array<[number, number]> = []
    for (let i = 0; i < points.length - 1; i++) {
      const start = points[i]
      const end = points[i + 1]

      enhancedRoute.push(start)

      // Tambahkan 2 titik perantara
      for (let j = 1; j <= 2; j++) {
        const ratio = j / 3
        const lat = start[0] + (end[0] - start[0]) * ratio
        const lng = start[1] + (end[1] - start[1]) * ratio

        // Tambahkan sedikit variasi untuk membuat rute terlihat alami
        const jitter = 0.002 * (Math.random() - 0.5)
        enhancedRoute.push([lat + jitter, lng + jitter])
      }
    }

    // Tambahkan titik akhir
    enhancedRoute.push(points[points.length - 1])

    setRoutePoints(enhancedRoute)
  }

  const generateItinerary = async () => {
    if (!itinerary.title || !itinerary.startDate || !itinerary.endDate) {
      setError("Judul itinerary dan tanggal perjalanan harus diisi")
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      // Tentukan lokasi berdasarkan judul itinerary
      let location = "Bali" // Default
      const title = itinerary.title.toLowerCase()

      if (title.includes("bali")) {
        location = "Bali"
      } else if (title.includes("yogya") || title.includes("jogja")) {
        location = "Yogyakarta"
      } else if (title.includes("jakarta")) {
        location = "Jakarta"
      } else if (title.includes("bandung")) {
        location = "Bandung"
      }

      // Dapatkan destinasi berdasarkan lokasi
      const destinations = getDestinationsByLocation(location)

      // Hitung jumlah hari
      const dayCount = differenceInDays(itinerary.endDate, itinerary.startDate) + 1
      const generatedDays: ItineraryDay[] = []

      // Acak destinasi
      const shuffledDestinations = [...destinations].sort(() => 0.5 - Math.random())

      for (let i = 0; i < dayCount; i++) {
        const date = addDays(itinerary.startDate, i)
        const items: ItineraryItem[] = []

        // Tambahkan 3 destinasi per hari (atau kurang jika destinasi tidak cukup)
        const maxDestinations = Math.min(3, Math.ceil(shuffledDestinations.length / dayCount))

        for (let j = 0; j < maxDestinations; j++) {
          const destinationIndex = (i * maxDestinations + j) % shuffledDestinations.length
          const destination = shuffledDestinations[destinationIndex]

          // Tentukan waktu berdasarkan urutan
          let timeSlot = ""
          if (j === 0) timeSlot = "09:00 - 11:00"
          else if (j === 1) timeSlot = "13:00 - 15:00"
          else if (j === 2) timeSlot = "16:00 - 18:00"
          else timeSlot = "19:00 - 21:00"

          items.push({
            id: `${i}-${j}-${Date.now()}`,
            attraction: destination.name,
            time: timeSlot,
            notes: destination.notes,
            position: destination.position,
          })
        }

        generatedDays.push({
          date,
          items,
        })
      }

      setItinerary((prev) => ({
        ...prev,
        days: generatedDays,
      }))

      // Setelah generate, pilih hari pertama
      setSelectedDay(0)
    } catch (error) {
      console.error("Error generating itinerary:", error)
      setError("Gagal membuat itinerary. Silakan coba lagi.")
    } finally {
      setIsGenerating(false)
    }
  }

  // Perbaikan pada fungsi saveItinerary untuk menambahkan user_id
  const handleSaveItinerary = async () => {
    if (!isAuthenticated) {
      setShowLoginAlert(true)
      return
    }

    if (!itinerary.title || !itinerary.startDate || !itinerary.endDate) {
      setError("Judul itinerary dan tanggal perjalanan harus diisi")
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      // Pastikan user_id ditambahkan ke itinerary
      const itineraryToSave = {
        ...itinerary,
        user_id: user?.id || 1, // Gunakan ID default jika tidak ada user
      }

      await saveItinerary(itineraryToSave)
      setShowSaveSuccess(true)

      // Refresh user itineraries
      await loadUserItineraries()

      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSaveSuccess(false)
      }, 3000)
    } catch (error) {
      console.error("Error saving itinerary:", error)
      setError("Gagal menyimpan itinerary. Silakan coba lagi.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteItinerary = async (itineraryId: string) => {
    setItineraryToDelete(itineraryId)
    setShowDeleteDialog(true)
  }

  const confirmDeleteItinerary = async () => {
    if (!itineraryToDelete) return

    try {
      await deleteItinerary(itineraryToDelete)

      // Refresh user itineraries
      await loadUserItineraries()

      // Close dialog
      setShowDeleteDialog(false)
      setItineraryToDelete(null)
    } catch (error) {
      console.error("Error deleting itinerary:", error)
      setError("Gagal menghapus itinerary. Silakan coba lagi.")
    }
  }

  const loadItinerary = (selectedItinerary: any) => {
    // Convert string dates back to Date objects
    const parsedItinerary = {
      ...selectedItinerary,
      startDate: new Date(selectedItinerary.startDate),
      endDate: new Date(selectedItinerary.endDate),
      days: selectedItinerary.days.map((day: any) => ({
        ...day,
        date: new Date(day.date),
      })),
    }

    setItinerary(parsedItinerary)
    setShowLoadDialog(false)
  }

  // Persiapkan marker untuk peta
  const getMapMarkers = () => {
    if (!itinerary.days[selectedDay]) return []

    return itinerary.days[selectedDay].items
      .filter((item) => item.position)
      .map((item, index) => ({
        id: item.id,
        position: item.position as [number, number],
        title: item.attraction,
        description: `${item.time} - ${item.notes || ""}`,
        type: index === 0 ? "start" : index === itinerary.days[selectedDay].items.length - 1 ? "end" : "waypoint",
      }))
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Itinerary Planner</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Itinerary Details */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Detail Perjalanan</CardTitle>
              {isAuthenticated && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowLoadDialog(true)}>
                    Load Itinerary
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Judul Itinerary</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Contoh: Liburan ke Bali"
                  value={itinerary.title}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label>Tanggal Mulai</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {itinerary.startDate ? (
                        format(itinerary.startDate, "PPP", { locale: id })
                      ) : (
                        <span>Pilih tanggal</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={itinerary.startDate}
                      onSelect={(date) => handleDateChange("startDate", date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Tanggal Selesai</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {itinerary.endDate ? (
                        format(itinerary.endDate, "PPP", { locale: id })
                      ) : (
                        <span>Pilih tanggal</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={itinerary.endDate}
                      onSelect={(date) => handleDateChange("endDate", date)}
                      initialFocus
                      disabled={(date) => date < itinerary.startDate}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  name="description"
                  className="min-h-[100px]"
                  placeholder="Deskripsi singkat tentang perjalanan Anda"
                  value={itinerary.description}
                  onChange={handleInputChange}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="pt-4 flex gap-3">
                <Button className="w-full" variant="outline" onClick={generateItinerary} disabled={isGenerating}>
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Generate AI
                    </>
                  )}
                </Button>
                <Button className="w-full" onClick={handleSaveItinerary} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Simpan
                    </>
                  )}
                </Button>
              </div>

              {showSaveSuccess && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-600">Itinerary berhasil disimpan!</AlertDescription>
                </Alert>
              )}

              {showLoginAlert && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Login Diperlukan</AlertTitle>
                  <AlertDescription>
                    Anda harus login untuk menyimpan itinerary.
                    <div className="mt-2">
                      <Button size="sm" onClick={() => router.push("/login")}>
                        Login Sekarang
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Itinerary Schedule */}
        <div className="lg:col-span-2">
          <Tabs
            defaultValue={`day-0`}
            value={`day-${selectedDay}`}
            onValueChange={(value) => setSelectedDay(Number.parseInt(value.split("-")[1]))}
          >
            <TabsList className="mb-4">
              {itinerary.days.map((day, index) => (
                <TabsTrigger key={index} value={`day-${index}`}>
                  Hari {index + 1}
                </TabsTrigger>
              ))}
            </TabsList>

            {itinerary.days.map((day, dayIndex) => (
              <TabsContent key={dayIndex} value={`day-${dayIndex}`} className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Jadwal Hari {dayIndex + 1}</CardTitle>
                        <CardDescription>{format(day.date, "EEEE, dd MMMM yyyy", { locale: id })}</CardDescription>
                      </div>
                      <Button size="sm" onClick={() => addItineraryItem(dayIndex)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah Aktivitas
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {day.items.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        Belum ada aktivitas untuk hari ini.
                        <div className="mt-2">
                          <Button variant="outline" size="sm" onClick={() => addItineraryItem(dayIndex)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Aktivitas Pertama
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {day.items.map((item, itemIndex) => (
                          <div
                            key={item.id}
                            className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow"
                          >
                            <div className="flex justify-between items-start">
                              <div className="w-full">
                                <div className="flex justify-between">
                                  <Input
                                    className="font-semibold text-lg border-none p-0 mb-2 focus-visible:ring-0"
                                    value={item.attraction}
                                    onChange={(e) =>
                                      updateItineraryItem(dayIndex, itemIndex, "attraction", e.target.value)
                                    }
                                    placeholder="Nama tempat wisata"
                                  />
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeItineraryItem(dayIndex, itemIndex)}
                                  >
                                    <Trash2 className="h-4 w-4 text-gray-500" />
                                  </Button>
                                </div>
                                <div className="flex items-center text-gray-600 mt-1">
                                  <Clock className="h-4 w-4 mr-1" />
                                  <Input
                                    className="border-none p-0 focus-visible:ring-0"
                                    value={item.time}
                                    onChange={(e) => updateItineraryItem(dayIndex, itemIndex, "time", e.target.value)}
                                    placeholder="Waktu kunjungan (mis. 09:00 - 11:00)"
                                  />
                                </div>
                                <Textarea
                                  className="mt-2 text-gray-700 min-h-[60px]"
                                  value={item.notes}
                                  onChange={(e) => updateItineraryItem(dayIndex, itemIndex, "notes", e.target.value)}
                                  placeholder="Catatan tambahan"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Peta Rute</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <MapIntegration
                      markers={getMapMarkers()}
                      showRoute={routePoints.length > 0}
                      routePoints={routePoints}
                      height="400px"
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Itinerary</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus itinerary ini? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={confirmDeleteItinerary}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Load Itinerary Dialog */}
      <Dialog open={showLoadDialog} onOpenChange={setShowLoadDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Load Itinerary</DialogTitle>
            <DialogDescription>Pilih itinerary yang ingin Anda load.</DialogDescription>
          </DialogHeader>

          {userItineraries.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Anda belum memiliki itinerary tersimpan.</p>
              <Button variant="outline" onClick={() => setShowLoadDialog(false)}>
                Tutup
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
              {userItineraries.map((savedItinerary) => (
                <Card key={savedItinerary.id} className="cursor-pointer hover:bg-gray-50">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <CardTitle>{savedItinerary.title}</CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteItinerary(savedItinerary.id)
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-gray-500" />
                      </Button>
                    </div>
                    <CardDescription>
                      {format(new Date(savedItinerary.startDate), "dd MMM yyyy")} -{" "}
                      {format(new Date(savedItinerary.endDate), "dd MMM yyyy")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-gray-600 line-clamp-2">{savedItinerary.description}</p>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => loadItinerary(savedItinerary)}
                    >
                      Load Itinerary
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
