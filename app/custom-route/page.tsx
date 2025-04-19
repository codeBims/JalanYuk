"use client"

import CustomRoutePlanner from "@/components/custom-route-planner"

export default function CustomRoutePage() {
  // Penyiapan data awal untuk demonstrasi
  const initialStartPoint = {
    id: "start",
    name: "Hotel Bali Paradise",
    position: [-8.4095, 115.1889] as [number, number],
    address: "Jl. Raya Kuta No. 123, Kuta, Bali",
  }

  const initialEndPoint = {
    id: "end",
    name: "Pantai Kuta",
    position: [-8.7184, 115.1686] as [number, number],
    address: "Jl. Pantai Kuta, Kuta, Badung, Bali",
  }

  const initialWaypoints = [
    {
      id: "waypoint-1",
      name: "Tanah Lot",
      position: [-8.6215, 115.0865] as [number, number],
      address: "Beraban, Kediri, Tabanan, Bali",
    },
    {
      id: "waypoint-2",
      name: "Uluwatu Temple",
      position: [-8.8291, 115.0849] as [number, number],
      address: "Pecatu, Kuta Selatan, Badung, Bali",
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Rute Perjalanan Kustom</h1>
      <p className="text-gray-600 mb-8">
        Buat rute perjalanan kustom Anda sendiri dengan menentukan titik awal, tujuan, dan tempat singgah. Anda dapat
        mencari lokasi, memilih langsung di peta, dan melihat estimasi waktu serta jarak perjalanan.
      </p>

      <CustomRoutePlanner
        initialStartPoint={initialStartPoint}
        initialEndPoint={initialEndPoint}
        initialWaypoints={initialWaypoints}
      />
    </div>
  )
}
