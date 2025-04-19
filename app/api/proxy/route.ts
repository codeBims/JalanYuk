import { type NextRequest, NextResponse } from "next/server"

// Proxy server untuk menghindari CORS saat mengakses API eksternal
export async function GET(request: NextRequest) {
  try {
    // Ambil URL dari query parameter
    const url = request.nextUrl.searchParams.get("url")

    if (!url) {
      return NextResponse.json({ error: "URL parameter is required" }, { status: 400 })
    }

    // Fetch data dari URL yang diberikan
    const response = await fetch(url)

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch from URL: ${response.statusText}` },
        { status: response.status },
      )
    }

    // Ambil data dari response
    const data = await response.json()

    // Kembalikan data
    return NextResponse.json(data)
  } catch (error) {
    console.error("Proxy error:", error)
    return NextResponse.json({ error: "Failed to proxy request" }, { status: 500 })
  }
}
