"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pagination } from "@/components/ui/pagination"
import { Search, MapPin, Star, Filter, Loader2, Globe } from "lucide-react"
import Image from "next/image"
import {
  googlePlacesService,
  type GooglePlace,
  getPhotoUrl,
  mapGoogleTypeToCategory,
} from "@/services/google-places-service"

export default function ExplorePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [places, setPlaces] = useState<GooglePlace[]>([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [nextPageToken, setNextPageToken] = useState<string | undefined>(undefined)
  const [category, setCategory] = useState("all")
  const [isMounted, setIsMounted] = useState(false)

  // Set isMounted to true after component mounts to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true)

    // Initialize searchQuery from URL params
    const queryParam = searchParams.get("query")
    if (queryParam) {
      setSearchQuery(queryParam)
    }

    // Initialize category from URL params
    const categoryParam = searchParams.get("category")
    if (categoryParam) {
      setCategory(categoryParam)
    }

    // Initialize page from URL params
    const pageParam = searchParams.get("page")
    if (pageParam) {
      setCurrentPage(Number.parseInt(pageParam, 10))
    }
  }, [searchParams])

  useEffect(() => {
    if (isMounted) {
      fetchPlaces()
    }
  }, [isMounted, currentPage, category])

  const fetchPlaces = async () => {
    if (!isMounted) return

    setLoading(true)
    try {
      // Tentukan lokasi default (Indonesia)
      const defaultLocation = { lat: -6.2088, lng: 106.8456 } // Jakarta

      // Jika ada query pencarian, gunakan searchPlaces
      if (searchQuery) {
        const result = await googlePlacesService.searchPlaces(
          searchQuery,
          defaultLocation,
          50000,
          "tourist_attraction",
          currentPage > 1 ? nextPageToken : undefined,
        )

        setPlaces(result.places)
        setNextPageToken(result.next_page_token)

        // Jika ada next_page_token, berarti ada halaman berikutnya
        if (result.next_page_token) {
          setTotalPages(currentPage + 1)
        } else {
          setTotalPages(currentPage)
        }
      }
      // Jika kategori dipilih, gunakan getAttractionsByCategory
      else if (category !== "all") {
        const categoryPlaces = await googlePlacesService.getAttractionsByCategory(category, defaultLocation, 50000, 12)
        setPlaces(categoryPlaces)
        setTotalPages(Math.ceil(categoryPlaces.length / 12))
      }
      // Jika tidak ada query atau kategori, tampilkan tempat populer
      else {
        const popularPlaces = await googlePlacesService.getPopularAttractions(defaultLocation, 50000, 12)
        setPlaces(popularPlaces)
        setTotalPages(Math.ceil(popularPlaces.length / 12))
      }
    } catch (error) {
      console.error("Error fetching places:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    router.push(`/explore?query=${encodeURIComponent(searchQuery)}&category=${category}&page=1`)
    fetchPlaces()
  }

  const handleCategoryChange = (value: string) => {
    setCategory(value)
    setCurrentPage(1)
    router.push(`/explore?query=${encodeURIComponent(searchQuery)}&category=${value}&page=1`)
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    router.push(`/explore?query=${encodeURIComponent(searchQuery)}&category=${category}&page=${newPage}`)
  }

  // Jika komponen belum di-mount, jangan render apa-apa untuk menghindari hydration error
  if (!isMounted) {
    return null
  }

  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/placeholder.svg?height=1080&width=1920"
          alt="Beautiful landscape"
          fill
          className="object-cover opacity-20"
        />
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <h1 className="text-3xl font-bold mb-6">Jelajahi Tempat Wisata</h1>

        {/* Search and Filter */}
        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-sm mb-8">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Cari tempat wisata di seluruh dunia..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Select value={category} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                <SelectItem value="Pantai">Pantai</SelectItem>
                <SelectItem value="Alam">Alam</SelectItem>
                <SelectItem value="Budaya">Budaya</SelectItem>
                <SelectItem value="Kuliner">Kuliner</SelectItem>
                <SelectItem value="Rekreasi">Rekreasi</SelectItem>
                <SelectItem value="Belanja">Belanja</SelectItem>
              </SelectContent>
            </Select>

            <Button type="submit">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </form>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            <span className="ml-2 text-lg">Memuat tempat wisata...</span>
          </div>
        ) : places.length === 0 ? (
          <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-lg">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Tidak ada tempat wisata ditemukan</h3>
            <p className="text-gray-600">Coba ubah filter pencarian atau cari dengan kata kunci yang berbeda.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {places.map((place, index) => {
                // Tentukan kategori berdasarkan tipe tempat
                const category = mapGoogleTypeToCategory(place.types)

                return (
                  <Card
                    key={`${place.place_id}-${index}`}
                    className="overflow-hidden hover:shadow-md transition-shadow bg-white/90 backdrop-blur-sm"
                  >
                    <div className="relative h-48">
                      <Image
                        src={
                          place.photos && place.photos.length > 0
                            ? getPhotoUrl(place.photos[0].photo_reference)
                            : "/placeholder.svg?height=200&width=300"
                        }
                        alt={place.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded text-sm font-medium">
                        {category}
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="text-xl font-semibold mb-2">{place.name}</h3>
                      <div className="flex items-center gap-1 mb-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-700 text-sm truncate">
                          {place.formatted_address || place.vicinity}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mb-3">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-medium">{place.rating?.toFixed(1) || "N/A"}</span>
                        <span className="text-gray-500 text-sm">({place.user_ratings_total || 0} ulasan)</span>
                      </div>
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {place.editorial_summary?.overview || "Tempat wisata menarik yang layak dikunjungi."}
                      </p>
                      <div className="mt-4 flex justify-between">
                        <Button
                          variant="outline"
                          className="w-full mr-2"
                          onClick={() => router.push(`/tempat-wisata/${place.place_id}`)}
                        >
                          Lihat Detail
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            window.open(`https://www.google.com/maps/place/?q=place_id:${place.place_id}`, "_blank")
                          }
                          title="Buka di Google Maps"
                        >
                          <Globe className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
