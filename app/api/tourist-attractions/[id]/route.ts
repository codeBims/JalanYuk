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

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const id = Number.parseInt(params.id)

  // Find the attraction by ID
  const attraction = touristAttractions.find((a) => a.id === id)

  if (!attraction) {
    return NextResponse.json({ status: "error", message: "Tourist attraction not found" }, { status: 404 })
  }

  return NextResponse.json({
    status: "success",
    data: {
      attraction,
    },
  })
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const body = await request.json()

    // Find the attraction by ID
    const attractionIndex = touristAttractions.findIndex((a) => a.id === id)

    if (attractionIndex === -1) {
      return NextResponse.json({ status: "error", message: "Tourist attraction not found" }, { status: 404 })
    }

    // Update the attraction (in a real app, this would be a database update)
    const updatedAttraction = {
      ...touristAttractions[attractionIndex],
      ...body,
      updated_at: new Date().toISOString(),
    }

    touristAttractions[attractionIndex] = updatedAttraction

    return NextResponse.json({
      status: "success",
      data: {
        attraction: updatedAttraction,
      },
    })
  } catch (error) {
    return NextResponse.json({ status: "error", message: "Invalid request body" }, { status: 400 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const id = Number.parseInt(params.id)

  // Find the attraction by ID
  const attractionIndex = touristAttractions.findIndex((a) => a.id === id)

  if (attractionIndex === -1) {
    return NextResponse.json({ status: "error", message: "Tourist attraction not found" }, { status: 404 })
  }

  // Remove the attraction (in a real app, this would be a database delete)
  touristAttractions.splice(attractionIndex, 1)

  return NextResponse.json({
    status: "success",
    data: null,
  })
}
