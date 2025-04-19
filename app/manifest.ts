import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "JalanYuk - Perencana Perjalanan Terpadu",
    short_name: "JalanYuk",
    description: "Aplikasi perencana perjalanan dengan rekomendasi AI dan integrasi peta",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#3B82F6",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icon-maskable-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-maskable-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    screenshots: [
      {
        src: "/screenshot-1.png",
        sizes: "1080x1920",
        type: "image/png",
        platform: "narrow",
        label: "Halaman Beranda JalanYuk",
      },
      {
        src: "/screenshot-2.png",
        sizes: "1080x1920",
        type: "image/png",
        platform: "narrow",
        label: "Itinerary Planner JalanYuk",
      },
    ],
    orientation: "portrait",
    categories: ["travel", "navigation", "lifestyle"],
    shortcuts: [
      {
        name: "Buat Itinerary Baru",
        url: "/itinerary/new",
        description: "Buat rencana perjalanan baru",
      },
      {
        name: "Jelajahi Tempat Wisata",
        url: "/explore",
        description: "Temukan tempat wisata menarik",
      },
    ],
    related_applications: [
      {
        platform: "play",
        url: "https://play.google.com/store/apps/details?id=com.jalanyuk.app",
        id: "com.jalanyuk.app",
      },
      {
        platform: "itunes",
        url: "https://apps.apple.com/app/jalanyuk/id123456789",
      },
    ],
    prefer_related_applications: false,
  }
}
