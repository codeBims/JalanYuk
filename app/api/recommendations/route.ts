import { type NextRequest, NextResponse } from "next/server"

// Contoh data tempat wisata (dalam implementasi nyata akan diambil dari database)
const touristAttractions = [
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
]

// Contoh data preferensi pengguna (dalam implementasi nyata akan diambil dari database)
const userPreferences = [
  {
    user_id: 1,
    preferred_categories: ["Pantai", "Budaya"],
    avoided_categories: ["Belanja"],
    budget_level: 2,
    activity_level: 3,
  },
  {
    user_id: 2,
    preferred_categories: ["Alam", "Budaya"],
    avoided_categories: ["Kuliner"],
    budget_level: 1,
    activity_level: 2,
  },
]

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const userId = searchParams.get("user_id")
  const limit = Number.parseInt(searchParams.get("limit") || "5")

  if (!userId) {
    return NextResponse.json({ status: "error", message: "User ID is required" }, { status: 400 })
  }

  // Find user preferences
  const userPref = userPreferences.find((pref) => pref.user_id === Number.parseInt(userId))

  if (!userPref) {
    // If no preferences found, return top-rated attractions
    const topRated = [...touristAttractions].sort((a, b) => b.avg_rating - a.avg_rating).slice(0, limit)

    return NextResponse.json({
      status: "success",
      data: {
        recommendations: topRated,
        type: "top_rated",
      },
    })
  }

  // Filter attractions based on user preferences
  let recommendations = touristAttractions.filter(
    (attraction) =>
      userPref.preferred_categories.includes(attraction.category) &&
      !userPref.avoided_categories.includes(attraction.category),
  )

  // Sort by rating
  recommendations = recommendations.sort((a, b) => b.avg_rating - a.avg_rating)

  // Limit results
  recommendations = recommendations.slice(0, limit)

  return NextResponse.json({
    status: "success",
    data: {
      recommendations,
      type: "personalized",
    },
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.user_id) {
      return NextResponse.json({ status: "error", message: "User ID is required" }, { status: 400 })
    }

    // In a real implementation, this would call the AI recommendation engine
    // For this mockup, we'll simulate a response

    // Get user preferences
    const userPref = userPreferences.find((pref) => pref.user_id === body.user_id)

    let recommendations = []

    if (userPref) {
      // Filter attractions based on user preferences
      recommendations = touristAttractions.filter(
        (attraction) =>
          userPref.preferred_categories.includes(attraction.category) &&
          !userPref.avoided_categories.includes(attraction.category),
      )

      // Sort by rating
      recommendations = recommendations.sort((a, b) => b.avg_rating - a.avg_rating)

      // Limit results
      recommendations = recommendations.slice(0, 5)
    } else {
      // If no preferences found, return top-rated attractions
      recommendations = [...touristAttractions].sort((a, b) => b.avg_rating - a.avg_rating).slice(0, 5)
    }

    // Generate itinerary if requested
    if (body.generate_itinerary && body.start_date && body.end_date) {
      const start = new Date(body.start_date)
      const end = new Date(body.end_date)
      const numDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1

      const itinerary = {
        title: body.title || "Perjalanan Baru",
        description: body.description || "Itinerary yang dibuat otomatis",
        start_date: body.start_date,
        end_date: body.end_date,
        days: [],
      }

      // Create itinerary for each day
      for (let day = 0; day < numDays; day++) {
        const currentDate = new Date(start)
        currentDate.setDate(start.getDate() + day)

        const dayPlan = {
          day: day + 1,
          date: currentDate.toISOString().split("T")[0],
          attractions: [],
        }

        // Add up to 3 attractions per day
        const startIdx = (day * 3) % recommendations.length
        for (let i = 0; i < 3; i++) {
          const idx = (startIdx + i) % recommendations.length
          const timeSlots = ["09:00 - 11:00", "13:00 - 15:00", "16:00 - 18:00"]

          dayPlan.attractions.push({
            attraction_id: recommendations[idx].id,
            name: recommendations[idx].name,
            time_slot: timeSlots[i],
            notes: `Kunjungan ke ${recommendations[idx].name}`,
          })
        }

        itinerary.days.push(dayPlan)
      }

      return NextResponse.json({
        status: "success",
        data: {
          recommendations,
          itinerary,
        },
      })
    }

    return NextResponse.json({
      status: "success",
      data: {
        recommendations,
      },
    })
  } catch (error) {
    return NextResponse.json({ status: "error", message: "Invalid request body" }, { status: 400 })
  }
}
