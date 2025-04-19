// Layanan untuk mengambil data tempat wisata dari API

import { config } from "@/lib/config"

// Interface untuk tempat wisata
export interface TouristAttraction {
  id: number
  name: string
  description: string
  address: string
  latitude: number
  longitude: number
  category: string
  images: string[]
  avg_rating: number
  total_reviews: number
}

// Interface untuk parameter pencarian
export interface SearchParams {
  query?: string
  category?: string
  page?: number
  limit?: number
}

// Interface untuk respons API
export interface ApiResponse<T> {
  status: string
  data: T
  pagination?: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

// Data tempat wisata untuk fallback jika API tidak tersedia
const mockTouristAttractions: TouristAttraction[] = [
  {
    id: 1,
    name: "Pantai Kuta",
    description: "Pantai terkenal di Bali dengan pemandangan matahari terbenam yang indah.",
    address: "Jl. Pantai Kuta, Kuta, Badung, Bali",
    latitude: -8.7184,
    longitude: 115.1686,
    category: "Pantai",
    images: ["/placeholder.svg?height=400&width=600"],
    avg_rating: 4.7,
    total_reviews: 1240,
  },
  {
    id: 2,
    name: "Tanah Lot",
    description: "Pura yang terletak di atas batu karang di tengah laut.",
    address: "Beraban, Kediri, Tabanan, Bali",
    latitude: -8.6215,
    longitude: 115.0865,
    category: "Budaya",
    images: ["/placeholder.svg?height=400&width=600"],
    avg_rating: 4.8,
    total_reviews: 2100,
  },
  {
    id: 3,
    name: "Ubud Monkey Forest",
    description: "Hutan suci yang dihuni oleh ratusan monyet ekor panjang.",
    address: "Jl. Monkey Forest, Ubud, Gianyar, Bali",
    latitude: -8.5195,
    longitude: 115.2587,
    category: "Alam",
    images: ["/placeholder.svg?height=400&width=600"],
    avg_rating: 4.5,
    total_reviews: 980,
  },
  {
    id: 4,
    name: "Pura Besakih",
    description: "Kompleks pura terbesar dan paling suci di Bali.",
    address: "Besakih, Rendang, Karangasem, Bali",
    latitude: -8.3739,
    longitude: 115.4517,
    category: "Budaya",
    images: ["/placeholder.svg?height=400&width=600"],
    avg_rating: 4.6,
    total_reviews: 850,
  },
  {
    id: 5,
    name: "Tegallalang Rice Terrace",
    description: "Terasering sawah yang indah dengan sistem irigasi tradisional.",
    address: "Tegallalang, Gianyar, Bali",
    latitude: -8.4312,
    longitude: 115.2777,
    category: "Alam",
    images: ["/placeholder.svg?height=400&width=600"],
    avg_rating: 4.4,
    total_reviews: 720,
  },
  {
    id: 6,
    name: "Waterbom Bali",
    description: "Taman air terbesar di Bali dengan berbagai wahana seru.",
    address: "Jl. Kartika Plaza, Kuta, Badung, Bali",
    latitude: -8.7276,
    longitude: 115.1726,
    category: "Rekreasi",
    images: ["/placeholder.svg?height=400&width=600"],
    avg_rating: 4.7,
    total_reviews: 1560,
  },
  // Tambahan tempat wisata
  {
    id: 7,
    name: "Nusa Penida",
    description: "Pulau dengan tebing dan pantai yang spektakuler.",
    address: "Nusa Penida, Klungkung, Bali",
    latitude: -8.7273,
    longitude: 115.5429,
    category: "Pantai",
    images: ["/placeholder.svg?height=400&width=600"],
    avg_rating: 4.8,
    total_reviews: 1850,
  },
  {
    id: 8,
    name: "Gunung Batur",
    description: "Gunung berapi aktif dengan pemandangan matahari terbit yang menakjubkan.",
    address: "Kintamani, Bangli, Bali",
    latitude: -8.2414,
    longitude: 115.3753,
    category: "Alam",
    images: ["/placeholder.svg?height=400&width=600"],
    avg_rating: 4.6,
    total_reviews: 1320,
  },
  {
    id: 9,
    name: "Uluwatu Temple",
    description: "Pura di tebing dengan pemandangan laut yang spektakuler.",
    address: "Pecatu, Kuta Selatan, Badung, Bali",
    latitude: -8.8291,
    longitude: 115.0849,
    category: "Budaya",
    images: ["/placeholder.svg?height=400&width=600"],
    avg_rating: 4.7,
    total_reviews: 1680,
  },
  {
    id: 10,
    name: "Seminyak Beach",
    description: "Pantai dengan suasana yang trendi dan sunset yang indah.",
    address: "Seminyak, Kuta, Badung, Bali",
    latitude: -8.6913,
    longitude: 115.1571,
    category: "Pantai",
    images: ["/placeholder.svg?height=400&width=600"],
    avg_rating: 4.5,
    total_reviews: 1420,
  },
  {
    id: 11,
    name: "Bali Safari & Marine Park",
    description: "Taman safari dengan berbagai satwa liar.",
    address: "Gianyar, Bali",
    latitude: -8.5875,
    longitude: 115.3272,
    category: "Rekreasi",
    images: ["/placeholder.svg?height=400&width=600"],
    avg_rating: 4.6,
    total_reviews: 1250,
  },
  {
    id: 12,
    name: "Jimbaran Bay",
    description: "Pantai dengan restoran seafood dan sunset yang indah.",
    address: "Jimbaran, Badung, Bali",
    latitude: -8.7908,
    longitude: 115.1551,
    category: "Pantai",
    images: ["/placeholder.svg?height=400&width=600"],
    avg_rating: 4.6,
    total_reviews: 1380,
  },
  {
    id: 13,
    name: "Garuda Wisnu Kencana",
    description: "Taman budaya dengan patung Garuda Wisnu Kencana yang ikonik.",
    address: "Jl. Raya Uluwatu, Ungasan, Badung, Bali",
    latitude: -8.8103,
    longitude: 115.1675,
    category: "Budaya",
    images: ["/placeholder.svg?height=400&width=600"],
    avg_rating: 4.4,
    total_reviews: 1150,
  },
  {
    id: 14,
    name: "Sanur Beach",
    description: "Pantai yang tenang dengan sunrise yang indah.",
    address: "Sanur, Denpasar, Bali",
    latitude: -8.6783,
    longitude: 115.2636,
    category: "Pantai",
    images: ["/placeholder.svg?height=400&width=600"],
    avg_rating: 4.5,
    total_reviews: 1280,
  },
  {
    id: 15,
    name: "Bali Swing",
    description: "Tempat untuk berayun dengan pemandangan alam yang indah.",
    address: "Bongkasa Pertiwi, Abiansemal, Badung, Bali",
    latitude: -8.4208,
    longitude: 115.2887,
    category: "Rekreasi",
    images: ["/placeholder.svg?height=400&width=600"],
    avg_rating: 4.3,
    total_reviews: 980,
  },
  {
    id: 16,
    name: "Tirta Empul Temple",
    description: "Pura dengan mata air suci untuk ritual pemurnian.",
    address: "Tampaksiring, Gianyar, Bali",
    latitude: -8.4156,
    longitude: 115.3153,
    category: "Budaya",
    images: ["/placeholder.svg?height=400&width=600"],
    avg_rating: 4.7,
    total_reviews: 1420,
  },
  {
    id: 17,
    name: "Lempuyang Temple",
    description: "Pura dengan 'Gerbang Surga' yang terkenal.",
    address: "Karangasem, Bali",
    latitude: -8.3884,
    longitude: 115.6358,
    category: "Budaya",
    images: ["/placeholder.svg?height=400&width=600"],
    avg_rating: 4.5,
    total_reviews: 1350,
  },
  {
    id: 18,
    name: "Sekumpul Waterfall",
    description: "Air terjun yang spektakuler di tengah hutan.",
    address: "Sekumpul, Buleleng, Bali",
    latitude: -8.2466,
    longitude: 115.0936,
    category: "Alam",
    images: ["/placeholder.svg?height=400&width=600"],
    avg_rating: 4.8,
    total_reviews: 950,
  },
  {
    id: 19,
    name: "Taman Ayun Temple",
    description: "Pura kerajaan dengan arsitektur tradisional Bali.",
    address: "Mengwi, Badung, Bali",
    latitude: -8.5419,
    longitude: 115.1726,
    category: "Budaya",
    images: ["/placeholder.svg?height=400&width=600"],
    avg_rating: 4.6,
    total_reviews: 980,
  },
  {
    id: 20,
    name: "Nusa Dua Beach",
    description: "Pantai dengan pasir putih dan air yang jernih.",
    address: "Nusa Dua, Badung, Bali",
    latitude: -8.8008,
    longitude: 115.2317,
    category: "Pantai",
    images: ["/placeholder.svg?height=400&width=600"],
    avg_rating: 4.7,
    total_reviews: 1580,
  },
]

// Layanan untuk mengambil data tempat wisata
export const touristAttractionService = {
  // Mendapatkan semua tempat wisata dengan filter dan pagination
  getAttractions: async (params: SearchParams = {}): Promise<ApiResponse<{ attractions: TouristAttraction[] }>> => {
    try {
      // Coba gunakan API asli
      const apiUrl = `${config.apiBaseUrl}/tourist-attractions`
      const queryParams = new URLSearchParams()

      if (params.category) queryParams.append("category", params.category)
      if (params.query) queryParams.append("query", params.query)
      if (params.page) queryParams.append("page", params.page.toString())
      if (params.limit) queryParams.append("limit", params.limit.toString())

      const url = queryParams.toString() ? `${apiUrl}?${queryParams.toString()}` : apiUrl

      try {
        const response = await fetch(url)
        if (response.ok) {
          return await response.json()
        }
      } catch (error) {
        console.log("API asli tidak tersedia, menggunakan data mock")
      }

      // Fallback ke data mock jika API tidak tersedia
      // Filter data berdasarkan parameter
      let filteredAttractions = [...mockTouristAttractions]

      if (params.category && params.category !== "all") {
        filteredAttractions = filteredAttractions.filter(
          (attraction) => attraction.category.toLowerCase() === params.category?.toLowerCase(),
        )
      }

      if (params.query) {
        const query = params.query.toLowerCase()
        filteredAttractions = filteredAttractions.filter(
          (attraction) =>
            attraction.name.toLowerCase().includes(query) ||
            attraction.description.toLowerCase().includes(query) ||
            attraction.address.toLowerCase().includes(query),
        )
      }

      // Pagination
      const page = params.page || 1
      const limit = params.limit || 10
      const startIndex = (page - 1) * limit
      const endIndex = page * limit
      const paginatedAttractions = filteredAttractions.slice(startIndex, endIndex)

      return {
        status: "success",
        data: {
          attractions: paginatedAttractions,
        },
        pagination: {
          total: filteredAttractions.length,
          page,
          limit,
          pages: Math.ceil(filteredAttractions.length / limit),
        },
      }
    } catch (error) {
      console.error("Error fetching attractions:", error)
      throw error
    }
  },

  // Mendapatkan detail tempat wisata berdasarkan ID
  getAttraction: async (id: number): Promise<ApiResponse<{ attraction: TouristAttraction }>> => {
    try {
      // Coba gunakan API asli
      const apiUrl = `${config.apiBaseUrl}/tourist-attractions/${id}`

      try {
        const response = await fetch(apiUrl)
        if (response.ok) {
          return await response.json()
        }
      } catch (error) {
        console.log("API asli tidak tersedia, menggunakan data mock")
      }

      // Fallback ke data mock jika API tidak tersedia
      const attraction = mockTouristAttractions.find((a) => a.id === id)

      if (!attraction) {
        throw new Error("Tempat wisata tidak ditemukan")
      }

      return {
        status: "success",
        data: {
          attraction,
        },
      }
    } catch (error) {
      console.error("Error fetching attraction:", error)
      throw error
    }
  },

  // Mendapatkan tempat wisata berdasarkan kategori
  getAttractionsByCategory: async (category: string, limit = 6): Promise<TouristAttraction[]> => {
    try {
      const result = await touristAttractionService.getAttractions({
        category,
        limit,
      })

      return result.data.attractions
    } catch (error) {
      console.error("Error fetching attractions by category:", error)
      return []
    }
  },

  // Mendapatkan tempat wisata populer
  getPopularAttractions: async (limit = 6): Promise<TouristAttraction[]> => {
    try {
      // Dalam implementasi nyata, ini akan memanggil endpoint khusus untuk tempat populer
      // Untuk mock, kita urutkan berdasarkan rating
      const sortedAttractions = [...mockTouristAttractions].sort((a, b) => b.avg_rating - a.avg_rating)
      return sortedAttractions.slice(0, limit)
    } catch (error) {
      console.error("Error fetching popular attractions:", error)
      return []
    }
  },

  // Mendapatkan tempat wisata terbaru
  getNewAttractions: async (limit = 6): Promise<TouristAttraction[]> => {
    try {
      // Dalam implementasi nyata, ini akan memanggil endpoint khusus untuk tempat terbaru
      // Untuk mock, kita ambil beberapa secara acak
      const shuffled = [...mockTouristAttractions].sort(() => 0.5 - Math.random())
      return shuffled.slice(0, limit)
    } catch (error) {
      console.error("Error fetching new attractions:", error)
      return []
    }
  },
}
