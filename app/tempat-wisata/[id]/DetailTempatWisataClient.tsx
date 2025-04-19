"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Star, Clock, Calendar, Globe, Info, MessageSquare, Plus, Loader2 } from "lucide-react"
import { googlePlacesService, getPhotoUrl } from "@/services/google-places-service"
import MapIntegration from "@/components/map-integration"

export default function DetailTempatWisataClient({ id }: { id: string }) {
  const [place, setPlace] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPlaceDetails = async () => {
      setLoading(true)
      try {
        const placeDetails = await googlePlacesService.getPlaceDetails(id)
        if (!placeDetails) {
          throw new Error("Tempat wisata tidak ditemukan")
        }
        setPlace(placeDetails)
      } catch (error) {
        console.error("Error fetching place details:", error)
        setError("Gagal memuat detail tempat wisata. Silakan coba lagi nanti.")
      } finally {
        setLoading(false)
      }
    }

    fetchPlaceDetails()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-blue-600 animate-spin mr-3" />
        <span className="text-xl">Memuat detail tempat wisata...</span>
      </div>
    )
  }

  if (error || !place) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <Info className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Terjadi Kesalahan</h2>
            <p className="text-gray-600 mb-4">{error || "Tempat wisata tidak ditemukan"}</p>
            <Button onClick={() => window.history.back()}>Kembali</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const mapMarkers = [
    {
      id: place.place_id,
      position: [place.geometry.location.lat, place.geometry.location.lng] as [number, number],
      title: place.name,
      description: place.formatted_address || place.vicinity,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4 bg-blue-50">
        <div className="text-sm text-gray-500">
          <a href="/" className="hover:text-blue-600">Beranda</a> &gt;{" "}
          <a href="/explore" className="hover:text-blue-600">Jelajahi</a> &gt;{" "}
          <span className="text-gray-700">{place.name}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="relative h-[400px] rounded-lg overflow-hidden">
            <Image
              src={
                place.photos && place.photos.length > 0
                  ? getPhotoUrl(place.photos[0].photo_reference, 800)
                  : "/placeholder.svg?height=400&width=600"
              }
              alt={place.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {place.photos &&
              place.photos.slice(1, 3).map((photo: any, index: number) => (
                <div key={index} className="relative h-[192px] rounded-lg overflow-hidden">
                  <Image
                    src={getPhotoUrl(photo.photo_reference, 400) || "/placeholder.svg"}
                    alt={`${place.name} ${index + 2}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            <div className="relative h-[192px] rounded-lg overflow-hidden">
              <Button
                className="absolute inset-0 bg-black/50 text-white hover:bg-black/60 w-full h-full rounded-lg"
                onClick={() => window.open(`https://www.google.com/maps/place/?q=place_id:${place.place_id}`, "_blank")}
              >
                Lihat di Google Maps
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{place.name}</h1>
                  <div className="flex items-center gap-1 mb-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700">{place.formatted_address || place.vicinity}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                      <span className="ml-1 font-medium">{place.rating?.toFixed(1) || "N/A"}</span>
                    </div>
                    <span className="text-gray-500">({place.user_ratings_total || 0} ulasan)</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                      {place.types && place.types.includes("natural_feature")
                        ? "Alam"
                        : place.types.includes("beach")
                        ? "Pantai"
                        : place.types.includes("museum") || place.types.includes("place_of_worship")
                        ? "Budaya"
                        : place.types.includes("amusement_park")
                        ? "Rekreasi"
                        : "Wisata"}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => window.open(`https://www.google.com/maps/place/?q=place_id:${place.place_id}`, "_blank")}>
                    <Globe className="mr-2 h-4 w-4" />
                    Lihat di Maps
                  </Button>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah ke Itinerary
                  </Button>
                </div>
              </div>

              <Tabs defaultValue="deskripsi">
                <TabsList className="mb-4">
                  <TabsTrigger value="deskripsi">Deskripsi</TabsTrigger>
                  <TabsTrigger value="fasilitas">Fasilitas</TabsTrigger>
                  <TabsTrigger value="ulasan">Ulasan</TabsTrigger>
                </TabsList>

                <TabsContent value="deskripsi">
                  <p className="text-gray-700 mb-6">
                    {place.editorial_summary?.overview ||
                      `${place.name} adalah tempat wisata menarik yang layak dikunjungi. Tempat ini menawarkan pengalaman yang unik dan menyenangkan bagi para pengunjung.`}
                  </p>
                  <h3 className="text-lg font-semibold mb-3">Informasi</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Status</p>
                        <p className="text-gray-600">
                          {place.business_status === "OPERATIONAL"
                            ? "Buka"
                            : place.business_status === "CLOSED_TEMPORARILY"
                            ? "Tutup Sementara"
                            : place.business_status === "CLOSED_PERMANENTLY"
                            ? "Tutup Permanen"
                            : "Tidak diketahui"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Tingkat Harga</p>
                        <p className="text-gray-600">
                          {place.price_level === 0
                            ? "Gratis"
                            : place.price_level === 1
                            ? "Murah"
                            : place.price_level === 2
                            ? "Sedang"
                            : place.price_level === 3
                            ? "Mahal"
                            : place.price_level === 4
                            ? "Sangat Mahal"
                            : "Tidak diketahui"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Globe className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Website</p>
                        <p className="text-gray-600">
                          <a href={`https://www.google.com/maps/place/?q=place_id:${place.place_id}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            Lihat di Google Maps
                          </a>
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="fasilitas">
                  <h3 className="text-lg font-semibold mb-3">Fasilitas Tersedia</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {place.types?.map((type: string, index: number) => (
                      <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                        <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                        <span>
                          {type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                        </span>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="ulasan">
                  <h3 className="text-lg font-semibold mb-3">Ulasan Pengunjung</h3>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center">
                      <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                      <span className="ml-1 text-2xl font-bold">{place.rating?.toFixed(1) || "N/A"}</span>
                    </div>
                    <span className="text-gray-500">Berdasarkan {place.user_ratings_total || 0} ulasan</span>
                  </div>
                  <Button onClick={() => window.open(`https://www.google.com/maps/place/?q=place_id:${place.place_id}`, "_blank")}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Lihat Ulasan di Google Maps
                  </Button>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-1">
            <Card className="mb-6">
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-3">Lokasi</h3>
                <MapIntegration
                  markers={mapMarkers}
                  center={[place.geometry.location.lat, place.geometry.location.lng]}
                  zoom={15}
                  height="300px"
                />
                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => window.open(`https://www.google.com/maps/place/?q=place_id:${place.place_id}`, "_blank")}
                >
                  <Globe className="mr-2 h-4 w-4" />
                  Lihat di Google Maps
                </Button>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-3">Tambahkan ke Itinerary</h3>
                <div className="space-y-3">
                  <Button className="w-full">
                    <Calendar className="mr-2 h-4 w-4" />
                    Tambah ke Itinerary Baru
                  </Button>
                  <Button variant="outline" className="w-full">
                    Tambah ke Itinerary yang Ada
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
