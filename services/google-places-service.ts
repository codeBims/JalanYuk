// Layanan untuk mengakses Google Places API untuk mendapatkan tempat wisata dari seluruh dunia

import { config } from "@/lib/config"

// Interface untuk tempat wisata dari Google Places API
export interface GooglePlace {
  place_id: string
  name: string
  formatted_address: string
  geometry: {
    location: {
      lat: number
      lng: number
    }
  }
  photos?: Array<{
    photo_reference: string
    height: number
    width: number
  }>
  rating?: number
  user_ratings_total?: number
  types: string[]
  vicinity?: string
  editorial_summary?: {
    overview: string
  }
  business_status?: string
  opening_hours?: {
    open_now: boolean
  }
  price_level?: number
}

// Interface untuk hasil pencarian
export interface PlacesSearchResult {
  places: GooglePlace[]
  next_page_token?: string
  total?: number
}

// Fungsi untuk mendapatkan URL foto dari photo_reference
export const getPhotoUrl = (photoReference: string, maxWidth = 400): string => {
  if (!photoReference) return "/placeholder.svg?height=400&width=600"

  // Jika API key tersedia, gunakan Google Places API
  if (config.googlePlacesApiKey) {
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${config.googlePlacesApiKey}`
  }

  // Fallback ke placeholder
  return "/placeholder.svg?height=400&width=600"
}

// Konversi tipe tempat Google ke kategori aplikasi
export const mapGoogleTypeToCategory = (types: string[]): string => {
  if (types.includes("natural_feature") || types.includes("park")) return "Alam"
  if (types.includes("beach")) return "Pantai"
  if (types.includes("museum") || types.includes("place_of_worship") || types.includes("tourist_attraction"))
    return "Budaya"
  if (types.includes("amusement_park") || types.includes("aquarium") || types.includes("zoo")) return "Rekreasi"
  if (types.includes("restaurant") || types.includes("cafe") || types.includes("food")) return "Kuliner"
  if (types.includes("shopping_mall") || types.includes("store")) return "Belanja"
  return "Lainnya"
}

// Layanan untuk mengakses Google Places API
export const googlePlacesService = {
  // Mencari tempat wisata berdasarkan query dan lokasi
  searchPlaces: async (
    query: string,
    location?: { lat: number; lng: number },
    radius = 50000,
    type = "tourist_attraction",
    pageToken?: string,
  ): Promise<PlacesSearchResult> => {
    try {
      // Selalu gunakan data mock untuk menghindari error API
      console.log("Menggunakan data mock untuk Google Places API")
      return mockSearchPlaces(query, type)
    } catch (error) {
      console.error("Error searching places:", error)
      // Fallback ke data mock jika terjadi error
      return mockSearchPlaces(query, type)
    }
  },

  // Mendapatkan detail tempat berdasarkan place_id
  getPlaceDetails: async (placeId: string): Promise<GooglePlace | null> => {
    try {
      // Selalu gunakan data mock untuk menghindari error API
      console.log("Menggunakan data mock untuk Google Places API")
      return mockGetPlaceDetails(placeId)
    } catch (error) {
      console.error("Error getting place details:", error)
      // Fallback ke data mock jika terjadi error
      return mockGetPlaceDetails(placeId)
    }
  },

  // Mendapatkan tempat wisata populer di suatu lokasi
  getPopularAttractions: async (
    location: { lat: number; lng: number } = { lat: -6.2088, lng: 106.8456 }, // Default: Jakarta
    radius = 50000,
    limit = 10,
  ): Promise<GooglePlace[]> => {
    try {
      const result = await googlePlacesService.searchPlaces("", location, radius, "tourist_attraction")

      // Urutkan berdasarkan rating
      const sortedPlaces = result.places
        .filter((place) => place.rating && place.rating > 0)
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))

      return sortedPlaces.slice(0, limit)
    } catch (error) {
      console.error("Error getting popular attractions:", error)
      return []
    }
  },

  // Mendapatkan tempat wisata berdasarkan kategori
  getAttractionsByCategory: async (
    category: string,
    location: { lat: number; lng: number } = { lat: -6.2088, lng: 106.8456 }, // Default: Jakarta
    radius = 50000,
    limit = 10,
  ): Promise<GooglePlace[]> => {
    try {
      // Konversi kategori aplikasi ke tipe Google
      let googleType = "tourist_attraction"

      switch (category.toLowerCase()) {
        case "alam":
          googleType = "natural_feature"
          break
        case "pantai":
          googleType = "beach"
          break
        case "budaya":
          googleType = "museum"
          break
        case "rekreasi":
          googleType = "amusement_park"
          break
        case "kuliner":
          googleType = "restaurant"
          break
        case "belanja":
          googleType = "shopping_mall"
          break
      }

      const result = await googlePlacesService.searchPlaces("", location, radius, googleType)

      return result.places.slice(0, limit)
    } catch (error) {
      console.error("Error getting attractions by category:", error)
      return []
    }
  },
}

// Data mock untuk fallback jika API tidak tersedia
const mockPlaces: GooglePlace[] = [
  {
    place_id: "ChIJN1t_tDeuEmsRUsoyG83frY4",
    name: "Eiffel Tower",
    formatted_address: "Champ de Mars, 5 Avenue Anatole France, 75007 Paris, France",
    geometry: {
      location: {
        lat: 48.8584,
        lng: 2.2945,
      },
    },
    photos: [
      {
        photo_reference: "eiffel_tower",
        height: 1000,
        width: 1000,
      },
    ],
    rating: 4.7,
    user_ratings_total: 230000,
    types: ["tourist_attraction", "point_of_interest"],
    editorial_summary: {
      overview: "Iconic iron tower built in 1889, with viewing platforms & restaurants.",
    },
  },
  {
    place_id: "ChIJP3Sa8ziYEmsRUKgyFmh9AQM",
    name: "Colosseum",
    formatted_address: "Piazza del Colosseo, 1, 00184 Roma RM, Italy",
    geometry: {
      location: {
        lat: 41.8902,
        lng: 12.4922,
      },
    },
    photos: [
      {
        photo_reference: "colosseum",
        height: 1000,
        width: 1000,
      },
    ],
    rating: 4.8,
    user_ratings_total: 210000,
    types: ["tourist_attraction", "point_of_interest"],
    editorial_summary: {
      overview: "Iconic ancient Roman gladiatorial arena with guided tour options.",
    },
  },
  {
    place_id: "ChIJP0fW5zdlLIcRvS7cOPZgQ3Y",
    name: "Statue of Liberty",
    formatted_address: "New York, NY 10004, United States",
    geometry: {
      location: {
        lat: 40.6892,
        lng: -74.0445,
      },
    },
    photos: [
      {
        photo_reference: "statue_of_liberty",
        height: 1000,
        width: 1000,
      },
    ],
    rating: 4.7,
    user_ratings_total: 190000,
    types: ["tourist_attraction", "point_of_interest"],
    editorial_summary: {
      overview: "Iconic copper statue gifted by France, with a museum & city views.",
    },
  },
  {
    place_id: "ChIJPTacEpBaQUcRfVs-3wZ5uFk",
    name: "Taj Mahal",
    formatted_address: "Dharmapuri, Forest Colony, Tajganj, Agra, Uttar Pradesh 282001, India",
    geometry: {
      location: {
        lat: 27.1751,
        lng: 78.0421,
      },
    },
    photos: [
      {
        photo_reference: "taj_mahal",
        height: 1000,
        width: 1000,
      },
    ],
    rating: 4.8,
    user_ratings_total: 180000,
    types: ["tourist_attraction", "point_of_interest"],
    editorial_summary: {
      overview: "Iconic white marble mausoleum built in the 17th century.",
    },
  },
  {
    place_id: "ChIJPwdslmeKGGARQhwxJ7QdVVE",
    name: "Great Wall of China",
    formatted_address: "Huairou District, China",
    geometry: {
      location: {
        lat: 40.4319,
        lng: 116.5704,
      },
    },
    photos: [
      {
        photo_reference: "great_wall",
        height: 1000,
        width: 1000,
      },
    ],
    rating: 4.8,
    user_ratings_total: 170000,
    types: ["tourist_attraction", "point_of_interest"],
    editorial_summary: {
      overview: "Ancient defensive wall built across northern China, with watchtowers.",
    },
  },
  {
    place_id: "ChIJvXUl1PtYwokRQUE6TzfKEXs",
    name: "Central Park",
    formatted_address: "New York, NY, United States",
    geometry: {
      location: {
        lat: 40.7829,
        lng: -73.9654,
      },
    },
    photos: [
      {
        photo_reference: "central_park",
        height: 1000,
        width: 1000,
      },
    ],
    rating: 4.8,
    user_ratings_total: 160000,
    types: ["park", "tourist_attraction", "point_of_interest"],
    editorial_summary: {
      overview: "Sprawling park with pedestrian paths, ballfields, a zoo & a reservoir.",
    },
  },
  {
    place_id: "ChIJtScKCnRJGGARZeYpC9yRQuU",
    name: "Tokyo Disneyland",
    formatted_address: "1-1 Maihama, Urayasu, Chiba 279-0031, Japan",
    geometry: {
      location: {
        lat: 35.6329,
        lng: 139.8804,
      },
    },
    photos: [
      {
        photo_reference: "tokyo_disneyland",
        height: 1000,
        width: 1000,
      },
    ],
    rating: 4.6,
    user_ratings_total: 150000,
    types: ["amusement_park", "tourist_attraction", "point_of_interest"],
    editorial_summary: {
      overview: "Popular theme park with Disney characters, rides, shows & parades.",
    },
  },
  {
    place_id: "ChIJISz8NjyuEmsRFTQ9Iw7Ear8",
    name: "Sydney Opera House",
    formatted_address: "Bennelong Point, Sydney NSW 2000, Australia",
    geometry: {
      location: {
        lat: -33.8568,
        lng: 151.2153,
      },
    },
    photos: [
      {
        photo_reference: "sydney_opera_house",
        height: 1000,
        width: 1000,
      },
    ],
    rating: 4.7,
    user_ratings_total: 140000,
    types: ["tourist_attraction", "point_of_interest"],
    editorial_summary: {
      overview: "Iconic performing arts venue with a distinctive roof & harbor views.",
    },
  },
  {
    place_id: "ChIJtQfA7GhJAWARlxHVbRb_qdQ",
    name: "Mount Fuji",
    formatted_address: "Kitayama, Fujinomiya, Shizuoka 418-0112, Japan",
    geometry: {
      location: {
        lat: 35.3606,
        lng: 138.7274,
      },
    },
    photos: [
      {
        photo_reference: "mount_fuji",
        height: 1000,
        width: 1000,
      },
    ],
    rating: 4.8,
    user_ratings_total: 130000,
    types: ["natural_feature", "tourist_attraction", "point_of_interest"],
    editorial_summary: {
      overview: "Japan's highest mountain & an active volcano, with climbing routes.",
    },
  },
  {
    place_id: "ChIJZ0sC1rx3BFUR3iMmYJJ-BQ8",
    name: "Santorini",
    formatted_address: "Thira 847 00, Greece",
    geometry: {
      location: {
        lat: 36.3932,
        lng: 25.4615,
      },
    },
    photos: [
      {
        photo_reference: "santorini",
        height: 1000,
        width: 1000,
      },
    ],
    rating: 4.8,
    user_ratings_total: 120000,
    types: ["natural_feature", "tourist_attraction", "point_of_interest"],
    editorial_summary: {
      overview: "Picturesque island with white-washed buildings & stunning sunsets.",
    },
  },
  {
    place_id: "ChIJLU7jZClu5kcR4PcOOO6p3I0",
    name: "Louvre Museum",
    formatted_address: "Rue de Rivoli, 75001 Paris, France",
    geometry: {
      location: {
        lat: 48.8606,
        lng: 2.3376,
      },
    },
    photos: [
      {
        photo_reference: "louvre",
        height: 1000,
        width: 1000,
      },
    ],
    rating: 4.7,
    user_ratings_total: 110000,
    types: ["museum", "tourist_attraction", "point_of_interest"],
    editorial_summary: {
      overview: "Former royal palace housing an vast collection of art & antiquities.",
    },
  },
  {
    place_id: "ChIJRcbZaklDXz4RYlEphFBu5r0",
    name: "Burj Khalifa",
    formatted_address: "1 Sheikh Mohammed bin Rashid Blvd, Dubai, United Arab Emirates",
    geometry: {
      location: {
        lat: 25.1972,
        lng: 55.2744,
      },
    },
    photos: [
      {
        photo_reference: "burj_khalifa",
        height: 1000,
        width: 1000,
      },
    ],
    rating: 4.7,
    user_ratings_total: 100000,
    types: ["tourist_attraction", "point_of_interest"],
    editorial_summary: {
      overview: "World's tallest building with observation decks & a luxury hotel.",
    },
  },
]

// Tambahkan tempat wisata Indonesia
const indonesianPlaces: GooglePlace[] = [
  {
    place_id: "ChIJN1t_tDeuEmsRUsoyG83frY4_id1",
    name: "Pantai Kuta",
    formatted_address: "Jl. Pantai Kuta, Kuta, Badung, Bali",
    geometry: {
      location: {
        lat: -8.7184,
        lng: 115.1686,
      },
    },
    photos: [
      {
        photo_reference: "pantai_kuta",
        height: 1000,
        width: 1000,
      },
    ],
    rating: 4.7,
    user_ratings_total: 12400,
    types: ["beach", "tourist_attraction", "point_of_interest"],
    editorial_summary: {
      overview: "Pantai terkenal di Bali dengan pemandangan matahari terbenam yang indah.",
    },
  },
  {
    place_id: "ChIJN1t_tDeuEmsRUsoyG83frY4_id2",
    name: "Tanah Lot",
    formatted_address: "Beraban, Kediri, Tabanan, Bali",
    geometry: {
      location: {
        lat: -8.6215,
        lng: 115.0865,
      },
    },
    photos: [
      {
        photo_reference: "tanah_lot",
        height: 1000,
        width: 1000,
      },
    ],
    rating: 4.8,
    user_ratings_total: 21000,
    types: ["tourist_attraction", "place_of_worship", "point_of_interest"],
    editorial_summary: {
      overview: "Pura yang terletak di atas batu karang di tengah laut.",
    },
  },
  {
    place_id: "ChIJN1t_tDeuEmsRUsoyG83frY4_id3",
    name: "Ubud Monkey Forest",
    formatted_address: "Jl. Monkey Forest, Ubud, Gianyar, Bali",
    geometry: {
      location: {
        lat: -8.5195,
        lng: 115.2587,
      },
    },
    photos: [
      {
        photo_reference: "ubud_monkey_forest",
        height: 1000,
        width: 1000,
      },
    ],
    rating: 4.5,
    user_ratings_total: 9800,
    types: ["natural_feature", "tourist_attraction", "point_of_interest"],
    editorial_summary: {
      overview: "Hutan suci yang dihuni oleh ratusan monyet ekor panjang.",
    },
  },
  {
    place_id: "ChIJN1t_tDeuEmsRUsoyG83frY4_id4",
    name: "Pura Besakih",
    formatted_address: "Besakih, Rendang, Karangasem, Bali",
    geometry: {
      location: {
        lat: -8.3739,
        lng: 115.4517,
      },
    },
    photos: [
      {
        photo_reference: "pura_besakih",
        height: 1000,
        width: 1000,
      },
    ],
    rating: 4.6,
    user_ratings_total: 8500,
    types: ["tourist_attraction", "place_of_worship", "point_of_interest"],
    editorial_summary: {
      overview: "Kompleks pura terbesar dan paling suci di Bali.",
    },
  },
  {
    place_id: "ChIJN1t_tDeuEmsRUsoyG83frY4_id5",
    name: "Tegallalang Rice Terrace",
    formatted_address: "Tegallalang, Gianyar, Bali",
    geometry: {
      location: {
        lat: -8.4312,
        lng: 115.2777,
      },
    },
    photos: [
      {
        photo_reference: "tegallalang",
        height: 1000,
        width: 1000,
      },
    ],
    rating: 4.4,
    user_ratings_total: 7200,
    types: ["natural_feature", "tourist_attraction", "point_of_interest"],
    editorial_summary: {
      overview: "Terasering sawah yang indah dengan sistem irigasi tradisional.",
    },
  },
  // Tambahkan Trans Studio Bandung
  {
    place_id: "ChIJN1t_tDeuEmsRUsoyG83frY4_id6",
    name: "Trans Studio Bandung",
    formatted_address: "Jl. Gatot Subroto No.289, Bandung, Jawa Barat",
    geometry: {
      location: {
        lat: -6.9246,
        lng: 107.6358,
      },
    },
    photos: [
      {
        photo_reference: "trans_studio_bandung",
        height: 1000,
        width: 1000,
      },
    ],
    rating: 4.6,
    user_ratings_total: 15600,
    types: ["amusement_park", "tourist_attraction", "point_of_interest"],
    editorial_summary: {
      overview: "Taman hiburan indoor terbesar di Indonesia dengan berbagai wahana seru.",
    },
  },
  // Tambahkan Dufan (Dunia Fantasi)
  {
    place_id: "ChIJN1t_tDeuEmsRUsoyG83frY4_id7",
    name: "Dunia Fantasi (Dufan)",
    formatted_address: "Jl. Lodan Timur No.7, Ancol, Jakarta Utara",
    geometry: {
      location: {
        lat: -6.1249,
        lng: 106.8342,
      },
    },
    photos: [
      {
        photo_reference: "dufan",
        height: 1000,
        width: 1000,
      },
    ],
    rating: 4.5,
    user_ratings_total: 18700,
    types: ["amusement_park", "tourist_attraction", "point_of_interest"],
    editorial_summary: {
      overview: "Taman hiburan terbesar di Jakarta dengan berbagai wahana untuk semua usia.",
    },
  },
  // Tambahkan Taman Mini Indonesia Indah (TMII)
  {
    place_id: "ChIJN1t_tDeuEmsRUsoyG83frY4_id8",
    name: "Taman Mini Indonesia Indah (TMII)",
    formatted_address: "Jl. Taman Mini Indonesia Indah, Jakarta Timur",
    geometry: {
      location: {
        lat: -6.3024,
        lng: 106.8951,
      },
    },
    photos: [
      {
        photo_reference: "tmii",
        height: 1000,
        width: 1000,
      },
    ],
    rating: 4.5,
    user_ratings_total: 14500,
    types: ["tourist_attraction", "park", "point_of_interest"],
    editorial_summary: {
      overview: "Taman rekreasi yang menampilkan keragaman budaya Indonesia dengan replika rumah adat.",
    },
  },
  // Tambahkan Kawah Putih
  {
    place_id: "ChIJN1t_tDeuEmsRUsoyG83frY4_id9",
    name: "Kawah Putih",
    formatted_address: "Ciwidey, Bandung, Jawa Barat",
    geometry: {
      location: {
        lat: -7.1662,
        lng: 107.4023,
      },
    },
    photos: [
      {
        photo_reference: "kawah_putih",
        height: 1000,
        width: 1000,
      },
    ],
    rating: 4.7,
    user_ratings_total: 12300,
    types: ["natural_feature", "tourist_attraction", "point_of_interest"],
    editorial_summary: {
      overview: "Danau kawah vulkanik dengan air berwarna putih kehijauan yang unik.",
    },
  },
  // Tambahkan Candi Borobudur
  {
    place_id: "ChIJN1t_tDeuEmsRUsoyG83frY4_id10",
    name: "Candi Borobudur",
    formatted_address: "Magelang, Jawa Tengah",
    geometry: {
      location: {
        lat: -7.6079,
        lng: 110.2038,
      },
    },
    photos: [
      {
        photo_reference: "borobudur",
        height: 1000,
        width: 1000,
      },
    ],
    rating: 4.8,
    user_ratings_total: 25000,
    types: ["tourist_attraction", "place_of_worship", "point_of_interest"],
    editorial_summary: {
      overview: "Candi Buddha terbesar di dunia yang dibangun pada abad ke-9.",
    },
  },
]

// Gabungkan semua tempat wisata
const allMockPlaces = [...mockPlaces, ...indonesianPlaces]

// Fungsi mock untuk searchPlaces
const mockSearchPlaces = (query: string, type: string): PlacesSearchResult => {
  let filteredPlaces = [...allMockPlaces]

  // Filter berdasarkan query
  if (query) {
    const lowerQuery = query.toLowerCase()
    filteredPlaces = filteredPlaces.filter(
      (place) =>
        place.name.toLowerCase().includes(lowerQuery) ||
        place.formatted_address.toLowerCase().includes(lowerQuery) ||
        (place.editorial_summary?.overview && place.editorial_summary.overview.toLowerCase().includes(lowerQuery)),
    )
  }

  // Filter berdasarkan type
  if (type && type !== "tourist_attraction") {
    filteredPlaces = filteredPlaces.filter((place) => place.types.includes(type))
  }

  return {
    places: filteredPlaces,
    total: filteredPlaces.length,
  }
}

// Fungsi mock untuk getPlaceDetails
const mockGetPlaceDetails = (placeId: string): GooglePlace | null => {
  return allMockPlaces.find((place) => place.place_id === placeId) || null
}
