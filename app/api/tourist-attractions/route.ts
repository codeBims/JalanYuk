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
    images: [
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
    ],
    avg_rating: 4.7,
    total_reviews: 1240,
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z",
  },
  {
    id: 2,
    name: "Tanah Lot",
    description: "Pura yang terletak di atas batu karang di tengah laut.",
    address: "Beraban, Kediri, Tabanan, Bali",
    latitude: -8.6215,
    longitude: 115.0865,
    category: "Budaya",
    images: ["/placeholder.svg?height=400&width=600", "/placeholder.svg?height=400&width=600"],
    avg_rating: 4.8,
    total_reviews: 2100,
    created_at: "2023-01-02T00:00:00Z",
    updated_at: "2023-01-02T00:00:00Z",
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
    created_at: "2023-01-03T00:00:00Z",
    updated_at: "2023-01-03T00:00:00Z",
  },
]

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const category = searchParams.get("category")
  const query = searchParams.get("query")
  const limit = Number.parseInt(searchParams.get("limit") || "10")
  const page = Number.parseInt(searchParams.get("page") || "1")

  let filteredAttractions = [...touristAttractions]

  // Filter by category if provided
  if (category) {
    filteredAttractions = filteredAttractions.filter(
      (attraction) => attraction.category.toLowerCase() === category.toLowerCase(),
    )
  }

  // Filter by search query if provided
  if (query) {
    const searchQuery = query.toLowerCase()
    filteredAttractions = filteredAttractions.filter(
      (attraction) =>
        attraction.name.toLowerCase().includes(searchQuery) ||
        attraction.description.toLowerCase().includes(searchQuery) ||
        attraction.address.toLowerCase().includes(searchQuery),
    )
  }

  // Pagination
  const startIndex = (page - 1) * limit
  const endIndex = page * limit
  const paginatedAttractions = filteredAttractions.slice(startIndex, endIndex)

  return NextResponse.json({
    status: "success",
    data: {
      attractions: paginatedAttractions,
      pagination: {
        total: filteredAttractions.length,
        page,
        limit,
        pages: Math.ceil(filteredAttractions.length / limit),
      },
    },
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    const requiredFields = ["name", "description", "address", "latitude", "longitude", "category"]
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ status: "error", message: `Field '${field}' is required` }, { status: 400 })
      }
    }

    // In a real implementation, this would save to a database
    const newAttraction = {
      id: touristAttractions.length + 1,
      name: body.name,
      description: body.description,
      address: body.address,
      latitude: body.latitude,
      longitude: body.longitude,
      category: body.category,
      images: body.images || [],
      avg_rating: 0,
      total_reviews: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Add to the array (in a real app, this would be a database insert)
    touristAttractions.push(newAttraction)

    return NextResponse.json(
      {
        status: "success",
        data: {
          attraction: newAttraction,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    return NextResponse.json({ status: "error", message: "Invalid request body" }, { status: 400 })
  }
}
