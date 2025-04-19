"use client"

import { useState } from "react"
import RoutePlanner from "@/components/route-planner"

export default function DemoRoutePage() {
  // Sample data for demonstration
  const [routeData] = useState({
    startPoint: {
      id: 1,
      name: "Hotel Bali Paradise",
      position: [-8.4095, 115.1889] as [number, number],
      address: "Jl. Raya Kuta No. 123, Kuta, Bali",
    },
    endPoint: {
      id: 4,
      name: "Pantai Kuta",
      position: [-8.7184, 115.1686] as [number, number],
      address: "Jl. Pantai Kuta, Kuta, Badung, Bali",
    },
    waypoints: [
      {
        id: 2,
        name: "Tanah Lot",
        position: [-8.6215, 115.0865] as [number, number],
        address: "Beraban, Kediri, Tabanan, Bali",
      },
      {
        id: 3,
        name: "Uluwatu Temple",
        position: [-8.8291, 115.0849] as [number, number],
        address: "Pecatu, Kuta Selatan, Badung, Bali",
      },
    ],
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Demo Rute Perjalanan</h1>
      <p className="text-gray-600 mb-8">
        Contoh integrasi dengan OpenStreetMap untuk menampilkan rute perjalanan wisata di Bali.
      </p>

      <RoutePlanner startPoint={routeData.startPoint} endPoint={routeData.endPoint} waypoints={routeData.waypoints} />
    </div>
  )
}
