"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { Calendar, MapPin, Clock, Trash2, Edit, Plus, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import Image from "next/image"

export default function MyItinerariesPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, getUserItineraries, deleteItinerary } = useAuth()

  const [itineraries, setItineraries] = useState<any[]>([])
  const [isLoadingItineraries, setIsLoadingItineraries] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [itineraryToDelete, setItineraryToDelete] = useState<string | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [selectedItinerary, setSelectedItinerary] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isLoading, isAuthenticated, router])

  // Load user itineraries
  useEffect(() => {
    if (isAuthenticated) {
      loadItineraries()
    }
  }, [isAuthenticated])

  // Perbaiki fungsi loadItineraries untuk menangani error dengan lebih baik
  const loadItineraries = async () => {
    setIsLoadingItineraries(true)
    setError(null)
    try {
      const userItineraries = await getUserItineraries()

      // Pastikan userItineraries adalah array
      if (Array.isArray(userItineraries)) {
        // Filter itineraries yang memiliki struktur valid
        const validItineraries = userItineraries.filter((itinerary) => {
          // Pastikan itinerary memiliki properti yang diperlukan
          return (
            itinerary &&
            itinerary.id &&
            itinerary.title &&
            itinerary.startDate &&
            itinerary.endDate &&
            Array.isArray(itinerary.days)
          )
        })

        setItineraries(validItineraries)

        if (validItineraries.length === 0 && userItineraries.length > 0) {
          setError("Beberapa itinerary memiliki format yang tidak valid dan tidak dapat ditampilkan.")
        }
      } else {
        // Jika bukan array, set sebagai array kosong dan catat error
        console.error("getUserItineraries did not return an array:", userItineraries)
        setItineraries([])
        setError("Gagal memuat itinerary. Data yang diterima tidak valid.")
      }
    } catch (error) {
      console.error("Error loading itineraries:", error)
      setError("Gagal memuat itinerary. Silakan coba lagi nanti.")
      setItineraries([])
    } finally {
      setIsLoadingItineraries(false)
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

      // Refresh itineraries
      await loadItineraries()

      // Close dialog
      setShowDeleteDialog(false)
      setItineraryToDelete(null)
    } catch (error) {
      console.error("Error deleting itinerary:", error)
      setError("Gagal menghapus itinerary. Silakan coba lagi nanti.")
    }
  }

  // Perbaiki fungsi viewItineraryDetail untuk menangani data yang tidak lengkap
  const viewItineraryDetail = (itinerary: any) => {
    // Pastikan itinerary memiliki struktur yang valid sebelum menampilkan detail
    if (!itinerary || !itinerary.days || !Array.isArray(itinerary.days)) {
      setError("Itinerary ini memiliki format yang tidak valid dan tidak dapat ditampilkan detailnya.")
      return
    }

    // Pastikan setiap hari memiliki properti items yang valid
    const validatedItinerary = {
      ...itinerary,
      days: itinerary.days.map((day: any) => ({
        ...day,
        items: Array.isArray(day.items) ? day.items : [],
      })),
    }

    setSelectedItinerary(validatedItinerary)
    setShowDetailDialog(true)
  }

  const editItinerary = (itinerary: any) => {
    // Store the itinerary in localStorage to load it in the planner
    if (typeof window !== "undefined") {
      localStorage.setItem("editItinerary", JSON.stringify(itinerary))
    }
    router.push("/itinerary-planner")
  }

  // Untuk menangani kasus ketika data belum siap
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Jika tidak terautentikasi, tampilkan pesan
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Login Diperlukan</CardTitle>
            <CardDescription>Anda harus login untuk melihat itinerary Anda.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.push("/login")} className="w-full">
              Login Sekarang
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/placeholder.svg?height=1080&width=1920"
          alt="Mountain landscape"
          fill
          className="object-cover opacity-20"
        />
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Itinerary Saya</h1>
          <Button onClick={() => router.push("/itinerary-planner")}>
            <Plus className="mr-2 h-4 w-4" />
            Buat Itinerary Baru
          </Button>
        </div>

        {error && (
          <Card className="mb-6 border-red-300 bg-red-50">
            <CardContent className="p-4 text-red-800">
              <p>{error}</p>
              <Button
                variant="outline"
                className="mt-2"
                onClick={() => {
                  setError(null)
                  loadItineraries()
                }}
              >
                Coba Lagi
              </Button>
            </CardContent>
          </Card>
        )}

        {isLoadingItineraries ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin mr-2" />
            <span>Memuat itinerary...</span>
          </div>
        ) : itineraries.length === 0 ? (
          <Card className="bg-white/90 backdrop-blur-sm">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Belum Ada Itinerary</h3>
              <p className="text-gray-600 mb-6 text-center max-w-md">
                Anda belum memiliki itinerary tersimpan. Buat itinerary baru untuk merencanakan perjalanan Anda.
              </p>
              <Button onClick={() => router.push("/itinerary-planner")}>
                <Plus className="mr-2 h-4 w-4" />
                Buat Itinerary Baru
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {itineraries.map((itinerary) => (
              <Card key={itinerary.id} className="bg-white/90 backdrop-blur-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <CardTitle className="line-clamp-1">{itinerary.title}</CardTitle>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => editItinerary(itinerary)}>
                        <Edit className="h-4 w-4 text-gray-500" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteItinerary(itinerary.id)}>
                        <Trash2 className="h-4 w-4 text-gray-500" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {format(new Date(itinerary.startDate), "dd MMM yyyy")} -{" "}
                      {format(new Date(itinerary.endDate), "dd MMM yyyy")}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-sm text-gray-600 line-clamp-2">{itinerary.description}</p>

                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Highlight:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {itinerary.days &&
                        itinerary.days.slice(0, 1).map((day: any, dayIndex: number) => (
                          <li key={dayIndex} className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-blue-600 mt-0.5" />
                            <div>
                              <span className="font-medium">Hari {dayIndex + 1}:</span>
                              <span className="ml-1">
                                {day.items &&
                                  day.items
                                    .slice(0, 2)
                                    .map((item: any) => item.attraction)
                                    .join(", ")}
                                {day.items && day.items.length > 2 ? ", ..." : ""}
                              </span>
                            </div>
                          </li>
                        ))}
                      {itinerary.days && itinerary.days.length > 1 && (
                        <li className="text-blue-600 cursor-pointer" onClick={() => viewItineraryDetail(itinerary)}>
                          Lihat {itinerary.days.length - 1} hari lainnya...
                        </li>
                      )}
                    </ul>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" onClick={() => viewItineraryDetail(itinerary)}>
                    Lihat Detail
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
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

      {/* Itinerary Detail Dialog */}
      {selectedItinerary && (
        <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedItinerary.title}</DialogTitle>
              <DialogDescription className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>
                  {format(new Date(selectedItinerary.startDate), "dd MMM yyyy")} -{" "}
                  {format(new Date(selectedItinerary.endDate), "dd MMM yyyy")}
                </span>
              </DialogDescription>
            </DialogHeader>

            <div className="mt-2">
              <p className="text-gray-600 mb-6">{selectedItinerary.description}</p>

              <div className="space-y-6">
                {selectedItinerary.days &&
                  selectedItinerary.days.map((day: any, dayIndex: number) => (
                    <div key={dayIndex}>
                      <h3 className="text-lg font-semibold mb-2">
                        Hari {dayIndex + 1} - {format(new Date(day.date), "EEEE, dd MMMM yyyy", { locale: id })}
                      </h3>

                      {!day.items || day.items.length === 0 ? (
                        <p className="text-gray-500 italic">Tidak ada aktivitas untuk hari ini.</p>
                      ) : (
                        <div className="space-y-3">
                          {day.items.map((item: any, itemIndex: number) => (
                            <Card key={itemIndex}>
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="font-semibold">{item.attraction}</h4>
                                    <div className="flex items-center text-gray-600 mt-1">
                                      <Clock className="h-4 w-4 mr-1" />
                                      <span>{item.time}</span>
                                    </div>
                                    {item.notes && <p className="mt-2 text-gray-700">{item.notes}</p>}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>

            <DialogFooter className="mt-6 gap-2">
              <Button variant="outline" onClick={() => editItinerary(selectedItinerary)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Itinerary
              </Button>
              <Button onClick={() => setShowDetailDialog(false)}>Tutup</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
