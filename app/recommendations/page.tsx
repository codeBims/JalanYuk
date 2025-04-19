"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star, MapPin, Loader2, Globe } from "lucide-react"
import { googlePlacesService, getPhotoUrl, mapGoogleTypeToCategory } from "@/services/google-places-service"

export default function RecommendationsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [personalRecommendations, setPersonalRecommendations] = useState<any[]>([])
  const [popularRecommendations, setPopularRecommendations] = useState<any[]>([])
  const [newRecommendations, setNewRecommendations] = useState<any[]>([])

  useEffect(() => {
    // Fungsi untuk mengambil rekomendasi
    const fetchRecommendations = async () => {
      setIsLoading(true)
      try {
        // Lokasi default (Bali)
        const defaultLocation = { lat: -8.4095, lng: 115.1889 }

        // Ambil rekomendasi personal (berdasarkan kategori Alam dan Pantai)
        const personalPlaces = await Promise.all([
          googlePlacesService.getAttractionsByCategory("Alam", defaultLocation, 50000, 6),
          googlePlacesService.getAttractionsByCategory("Pantai", defaultLocation, 50000, 6),
        ])

        // Gabungkan hasil dan acak
        const combinedPersonal = [...personalPlaces[0], ...personalPlaces[1]]
          .sort(() => 0.5 - Math.random())
          .slice(0, 6)

        setPersonalRecommendations(combinedPersonal)

        // Ambil tempat populer
        const popularPlaces = await googlePlacesService.getPopularAttractions(defaultLocation, 50000, 6)

        setPopularRecommendations(popularPlaces)

        // Untuk tempat baru, gunakan pencarian dengan query "new attractions"
        const newPlacesResult = await googlePlacesService.searchPlaces(
          "new attractions",
          defaultLocation,
          50000,
          "tourist_attraction",
        )

        setNewRecommendations(newPlacesResult.places.slice(0, 6))
      } catch (error) {
        console.error("Error fetching recommendations:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecommendations()
  }, [])

  // Render kartu tempat wisata
  const renderPlaceCard = (place: any) => {
    // Tentukan kategori berdasarkan tipe tempat
    const category = mapGoogleTypeToCategory(place.types)

    return (
      <Card
        key={place.place_id}
        className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer bg-white/90 backdrop-blur-sm"
      >
        <div className="relative h-48">
          <Image
            src={
              place.photos && place.photos.length > 0
                ? getPhotoUrl(place.photos[0].photo_reference)
                : "/placeholder.svg?height=400&width=600"
            }
            alt={place.name}
            fill
            className="object-cover"
          />
          <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded text-sm font-medium">{category}</div>
        </div>
        <CardContent className="p-4">
          <h3 className="text-xl font-semibold mb-2">{place.name}</h3>
          <div className="flex items-center gap-1 mb-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span className="text-gray-700 text-sm truncate">{place.formatted_address || place.vicinity}</span>
          </div>
          <div className="flex items-center gap-1 mb-3">
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            <span className="font-medium">{place.rating?.toFixed(1) || "N/A"}</span>
            <span className="text-gray-500 text-sm">({place.user_ratings_total || 0} ulasan)</span>
          </div>
          <p className="text-gray-600 text-sm line-clamp-2 mb-4">
            {place.editorial_summary?.overview || "Tempat wisata menarik yang layak dikunjungi."}
          </p>
          <div className="flex justify-between">
            <Button
              variant="outline"
              className="flex-1 mr-2"
              onClick={() => router.push(`/tempat-wisata/${place.place_id}`)}
            >
              Lihat Detail
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => window.open(`https://www.google.com/maps/place/?q=place_id:${place.place_id}`, "_blank")}
              title="Buka di Google Maps"
            >
              <Globe className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Rekomendasi untuk Anda</h1>

      <Tabs defaultValue="personal">
        <TabsList className="mb-6">
          <TabsTrigger value="personal">Rekomendasi Pribadi</TabsTrigger>
          <TabsTrigger value="popular">Populer</TabsTrigger>
          <TabsTrigger value="new">Terbaru</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin mr-2" />
              <span>Memuat rekomendasi...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {personalRecommendations.map((place) => renderPlaceCard(place))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="popular">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin mr-2" />
              <span>Memuat tempat populer...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularRecommendations.map((place) => renderPlaceCard(place))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="new">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin mr-2" />
              <span>Memuat tempat terbaru...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {newRecommendations.map((place) => renderPlaceCard(place))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-6">Buat Itinerary Berdasarkan Rekomendasi</h2>
        <Card>
          <CardContent className="p-6">
            <p className="text-gray-700 mb-4">
              Gunakan rekomendasi di atas untuk membuat itinerary perjalanan Anda secara otomatis.
            </p>
            <Button onClick={() => router.push("/itinerary-planner")}>Buat Itinerary Sekarang</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
