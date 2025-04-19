"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapPin, Navigation, Clock, Car, FootprintsIcon as Walk } from "lucide-react"
import MapIntegration from "./map-integration"
import RouteLoading from "./route-loading"

interface RoutePoint {
  id: number
  name: string
  position: [number, number]
  address?: string
}

interface RouteProps {
  startPoint?: RoutePoint
  endPoint?: RoutePoint
  waypoints?: RoutePoint[]
  transportMode?: "car" | "walk" | "bicycle"
}

export default function RoutePlanner({ startPoint, endPoint, waypoints = [], transportMode = "car" }: RouteProps) {
  const [route, setRoute] = useState<Array<[number, number]>>([])
  const [estimatedTime, setEstimatedTime] = useState<string>("")
  const [estimatedDistance, setEstimatedDistance] = useState<string>("")
  const [selectedTransportMode, setSelectedTransportMode] = useState<"car" | "walk" | "bicycle">(transportMode)
  const [isLoading, setIsLoading] = useState(false)

  // All points including start, end and waypoints
  const allPoints = [...(startPoint ? [startPoint] : []), ...waypoints, ...(endPoint ? [endPoint] : [])]

  // Markers for the map
  const markers = allPoints.map((point) => ({
    id: point.id,
    position: point.position,
    title: point.name,
    description: point.address,
  }))

  // Simulate fetching route from OpenStreetMap Routing API
  useEffect(() => {
    if (startPoint && endPoint) {
      // In a real implementation, this would call the OSRM API
      // For this mockup, we'll simulate a route
      setIsLoading(true)

      // Create a simple route between points
      const routePoints: Array<[number, number]> = [
        startPoint.position,
        ...waypoints.map((wp) => wp.position),
        endPoint.position,
      ]

      // Add some intermediate points to make the route look more realistic
      const enhancedRoute: Array<[number, number]> = []
      for (let i = 0; i < routePoints.length - 1; i++) {
        const start = routePoints[i]
        const end = routePoints[i + 1]

        enhancedRoute.push(start)

        // Add 2 intermediate points
        for (let j = 1; j <= 2; j++) {
          const ratio = j / 3
          const lat = start[0] + (end[0] - start[0]) * ratio
          const lng = start[1] + (end[1] - start[1]) * ratio

          // Add some randomness to make it look like a real route
          const jitter = 0.002 * (Math.random() - 0.5)
          enhancedRoute.push([lat + jitter, lng + jitter])
        }
      }

      enhancedRoute.push(routePoints[routePoints.length - 1])
      setRoute(enhancedRoute)

      // Calculate estimated time and distance
      let distance = 0
      for (let i = 0; i < routePoints.length - 1; i++) {
        distance += calculateDistance(routePoints[i], routePoints[i + 1])
      }

      // Round to 1 decimal place
      distance = Math.round(distance * 10) / 10

      // Calculate time based on transport mode
      let speed: number
      switch (selectedTransportMode) {
        case "car":
          speed = 40 // km/h
          break
        case "bicycle":
          speed = 15 // km/h
          break
        case "walk":
          speed = 5 // km/h
          break
        default:
          speed = 40
      }

      const timeHours = distance / speed
      let timeString: string

      if (timeHours < 1) {
        const timeMinutes = Math.round(timeHours * 60)
        timeString = `${timeMinutes} menit`
      } else {
        const hours = Math.floor(timeHours)
        const minutes = Math.round((timeHours - hours) * 60)
        timeString = `${hours} jam ${minutes} menit`
      }

      setEstimatedDistance(`${distance} km`)
      setEstimatedTime(timeString)
      setIsLoading(false)
    }
  }, [startPoint, endPoint, waypoints, selectedTransportMode])

  // Calculate distance between two points using Haversine formula
  function calculateDistance(point1: [number, number], point2: [number, number]): number {
    const R = 6371 // Earth's radius in km
    const dLat = ((point2[0] - point1[0]) * Math.PI) / 180
    const dLon = ((point2[1] - point1[1]) * Math.PI) / 180

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((point1[0] * Math.PI) / 180) *
        Math.cos((point2[0] * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c

    return distance
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5 text-blue-600" />
            Rute Perjalanan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Transport mode selection */}
            <div className="flex gap-2">
              <Button
                variant={selectedTransportMode === "car" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setSelectedTransportMode("car")}
              >
                <Car className="mr-2 h-4 w-4" />
                Mobil
              </Button>
              <Button
                variant={selectedTransportMode === "walk" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setSelectedTransportMode("walk")}
              >
                <Walk className="mr-2 h-4 w-4" />
                Jalan Kaki
              </Button>
              <Button
                variant={selectedTransportMode === "bicycle" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setSelectedTransportMode("bicycle")}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M5 19a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M19 19a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 19v-4l-3-3 5-4 2 3h3"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Sepeda
              </Button>
            </div>

            {/* Start and end points */}
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="start">Titik Awal</Label>
                <div className="flex gap-2">
                  <Input id="start" value={startPoint?.name || ""} placeholder="Pilih titik awal" readOnly />
                  <Button variant="outline" size="icon">
                    <MapPin className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="end">Titik Akhir</Label>
                <div className="flex gap-2">
                  <Input id="end" value={endPoint?.name || ""} placeholder="Pilih titik akhir" readOnly />
                  <Button variant="outline" size="icon">
                    <MapPin className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Waypoints */}
            {waypoints.length > 0 && (
              <div className="space-y-2">
                <Label>Tempat Singgah</Label>
                {waypoints.map((waypoint, index) => (
                  <div key={waypoint.id} className="flex gap-2 items-center">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <Input value={waypoint.name} readOnly />
                  </div>
                ))}
              </div>
            )}

            {/* Route info */}
            {isLoading ? (
              <RouteLoading />
            ) : (
              estimatedTime &&
              estimatedDistance && (
                <div className="flex gap-4 mt-4 p-3 bg-blue-50 rounded-md">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-500">Waktu Tempuh</p>
                      <p className="font-medium">{estimatedTime}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Navigation className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-500">Jarak</p>
                      <p className="font-medium">{estimatedDistance}</p>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </CardContent>
      </Card>

      {/* Map with route */}
      <MapIntegration markers={markers} showRoute={true} routePoints={route} height="400px" />
    </div>
  )
}
