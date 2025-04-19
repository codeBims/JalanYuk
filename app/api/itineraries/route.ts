import { type NextRequest, NextResponse } from "next/server"

// Contoh data itinerary (dalam implementasi nyata akan diambil dari database)
const itineraries = [
  {
    id: 1,
    user_id: 1,
    title: "Liburan ke Bali",
    description: "Liburan keluarga ke Bali selama 3 hari 2 malam",
    start_date: "2023-04-01",
    end_date: "2023-04-03",
    is_public: true,
    created_at: "2023-03-15T00:00:00Z",
    updated_at: "2023-03-15T00:00:00Z",
    items: [
      {
        id: 1,
        itinerary_id: 1,
        attraction_id: 1,
        start_time: "2023-04-01T09:00:00Z",
        end_time: "2023-04-01T11:00:00Z",
        notes: "Bawa sunscreen",
        day_number: 1,
        order_number: 1,
      },
      {
        id: 2,
        itinerary_id: 1,
        attraction_id: 2,
        start_time: "2023-04-01T13:00:00Z",
        end_time: "2023-04-01T15:00:00Z",
        notes: "Cek pasang surut air",
        day_number: 1,
        order_number: 2,
      },
      {
        id: 3,
        itinerary_id: 1,
        attraction_id: 3,
        start_time: "2023-04-01T16:00:00Z",
        end_time: "2023-04-01T18:00:00Z",
        notes: "Nonton Kecak Dance",
        day_number: 1,
        order_number: 3,
      },
    ],
  },
  {
    id: 2,
    user_id: 2,
    title: "Jelajah Yogyakarta",
    description: "Mengunjungi tempat-tempat bersejarah di Yogyakarta",
    start_date: "2023-05-10",
    end_date: "2023-05-12",
    is_public: true,
    created_at: "2023-04-20T00:00:00Z",
    updated_at: "2023-04-20T00:00:00Z",
    items: [],
  },
]

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const userId = searchParams.get("user_id")
  const isPublic = searchParams.get("is_public")
  const limit = Number.parseInt(searchParams.get("limit") || "10")
  const page = Number.parseInt(searchParams.get("page") || "1")

  let filteredItineraries = [...itineraries]

  // Filter by user ID if provided
  if (userId) {
    filteredItineraries = filteredItineraries.filter((itinerary) => itinerary.user_id === Number.parseInt(userId))
  }

  // Filter by public status if provided
  if (isPublic) {
    filteredItineraries = filteredItineraries.filter((itinerary) => itinerary.is_public === (isPublic === "true"))
  }

  // Pagination
  const startIndex = (page - 1) * limit
  const endIndex = page * limit
  const paginatedItineraries = filteredItineraries.slice(startIndex, endIndex)

  return NextResponse.json({
    status: "success",
    data: {
      itineraries: paginatedItineraries,
      pagination: {
        total: filteredItineraries.length,
        page,
        limit,
        pages: Math.ceil(filteredItineraries.length / limit),
      },
    },
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    const requiredFields = ["user_id", "title", "start_date", "end_date"]
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ status: "error", message: `Field '${field}' is required` }, { status: 400 })
      }
    }

    // In a real implementation, this would save to a database
    const newItinerary = {
      id: itineraries.length + 1,
      user_id: body.user_id,
      title: body.title,
      description: body.description || "",
      start_date: body.start_date,
      end_date: body.end_date,
      is_public: body.is_public || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      items: [],
    }

    // Add to the array (in a real app, this would be a database insert)
    itineraries.push(newItinerary)

    return NextResponse.json(
      {
        status: "success",
        data: {
          itinerary: newItinerary,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    return NextResponse.json({ status: "error", message: "Invalid request body" }, { status: 400 })
  }
}
