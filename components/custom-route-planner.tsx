"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapPin, Navigation, Clock, Car, FootprintsIcon as Walk, Plus, Trash2, AlertCircle, Info } from "lucide-react"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import MapIntegration from "./map-integration"
import RouteLoading from "./route-loading"

interface RoutePoint {
  id: string
  name: string
  position: [number, number] | null
  address?: string
  isSearching?: boolean
}

interface CustomRouteProps {
  initialStartPoint?: RoutePoint
  initialEndPoint?: RoutePoint
  initialWaypoints?: RoutePoint[]
  transportMode?: "driving" | "walking" | "cycling"
}

// Inline implementation of OSRMService to avoid import issues
const OSRMServiceInline = {
  getRoute: async (waypoints: any[], options: any = {}) => {
    if (waypoints.length < 2) {
      throw new Error("At least 2 waypoints are required")
    }

    const {
      profile = "driving",
      alternatives = false,
      steps = true,
      geometries = "geojson",
      overview = "full",
      annotations = false,
    } = options

    // Format coordinates for OSRM API
    const coordinates = waypoints.map((wp) => `${wp.longitude},${wp.latitude}`).join(";")

    // Build URL
    const OSRM_API_URL = process.env.NEXT_PUBLIC_OSRM_API_URL || "https://router.project-osrm.org"
    const url = new URL(`${OSRM_API_URL}/route/v1/${profile}/${coordinates}`)

    // Add query parameters
    url.searchParams.append("alternatives", alternatives.toString())
    url.searchParams.append("steps", steps.toString())
    url.searchParams.append("geometries", geometries)
    url.searchParams.append("overview", overview)
    url.searchParams.append("annotations", annotations.toString())

    const response = await fetch(url.toString())

    if (!response.ok) {
      throw new Error(`OSRM API error: ${response.statusText}`)
    }

    const data = await response.json()

    if (data.code !== "Ok") {
      throw new Error(`OSRM routing error: ${data.message}`)
    }

    return data
  },

  formatDuration: (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    if (hours > 0) {
      return `${hours} jam ${minutes} menit`
    } else {
      return `${minutes} menit`
    }
  },

  formatDistance: (meters: number) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`
    } else {
      return `${Math.round(meters)} m`
    }
  },
}

export default function CustomRoutePlanner({
  initialStartPoint,
  initialEndPoint,
  initialWaypoints = [],
  transportMode = "driving",
}: CustomRouteProps) {
  const [startPoint, setStartPoint] = useState<RoutePoint>(
    initialStartPoint || {
      id: "start",
      name: "",
      position: null,
    },
  )

  const [endPoint, setEndPoint] = useState<RoutePoint>(
    initialEndPoint || {
      id: "end",
      name: "",
      position: null,
    },
  )

  const [waypoints, setWaypoints] = useState<RoutePoint[]>(initialWaypoints)
  const [selectedTransportMode, setSelectedTransportMode] = useState<"driving" | "walking" | "cycling">(transportMode)
  const [route, setRoute] = useState<Array<[number, number]>>([])
  const [estimatedTime, setEstimatedTime] = useState<string>("")
  const [estimatedDistance, setEstimatedDistance] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searchingFor, setSearchingFor] = useState<string | null>(null)
  const [selectedPointType, setSelectedPointType] = useState<"start" | "end" | "waypoint" | null>(null)
  const [selectedWaypointIndex, setSelectedWaypointIndex] = useState<number>(-1)
  const [lastSearchQuery, setLastSearchQuery] = useState<string>("")

  // All points including start, end and waypoints for the map
  const allPoints = [
    ...(startPoint.position ? [{ ...startPoint, type: "start" as const }] : []),
    ...waypoints.filter((wp) => wp.position).map((wp) => ({ ...wp, type: "waypoint" as const })),
    ...(endPoint.position ? [{ ...endPoint, type: "end" as const }] : []),
  ]

  // Markers for the map
  const markers = allPoints
    .filter((point) => point.position)
    .map((point) => ({
      id: point.id,
      position: point.position as [number, number],
      title: point.name,
      description: point.address,
      type: point.type,
    }))

  // Function to geocode (get address from coordinates) using Nominatim
  const getAddressFromCoordinates = async (position: [number, number]) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position[0]}&lon=${position[1]}&zoom=18&addressdetails=1`,
      )

      if (!response.ok) {
        throw new Error("Gagal mendapatkan alamat")
      }

      const data = await response.json()
      return {
        name: data.name || data.display_name.split(",")[0],
        address: data.display_name,
      }
    } catch (error) {
      console.error("Error getting address:", error)
      return {
        name: `Lokasi (${position[0].toFixed(5)}, ${position[1].toFixed(5)})`,
        address: "Alamat tidak tersedia",
      }
    }
  }

  // Function to search for locations using Nominatim (OpenStreetMap's search API)
  const searchLocation = async (query: string, pointId: string) => {
    if (!query.trim()) return

    setSearchingFor(pointId)
    setLastSearchQuery(query)

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=id`,
      )

      if (!response.ok) {
        throw new Error("Gagal mencari lokasi")
      }

      const data = await response.json()
      setSearchResults(data)
    } catch (error) {
      console.error("Error searching location:", error)
      setError("Gagal mencari lokasi. Silakan coba lagi.")
    } finally {
      setSearchingFor(null)
    }
  }

  // Function to select a location from search results
  const selectLocation = (result: any, pointType: "start" | "end" | "waypoint", waypointIndex?: number) => {
    const position: [number, number] = [Number.parseFloat(result.lat), Number.parseFloat(result.lon)]

    if (pointType === "start") {
      setStartPoint({
        ...startPoint,
        name: result.display_name.split(",")[0],
        position,
        address: result.display_name,
      })
    } else if (pointType === "end") {
      setEndPoint({
        ...endPoint,
        name: result.display_name.split(",")[0],
        position,
        address: result.display_name,
      })
    } else if (pointType === "waypoint" && waypointIndex !== undefined) {
      const updatedWaypoints = [...waypoints]
      updatedWaypoints[waypointIndex] = {
        ...updatedWaypoints[waypointIndex],
        name: result.display_name.split(",")[0],
        position,
        address: result.display_name,
      }
      setWaypoints(updatedWaypoints)
    }

    setSearchResults([])
  }

  // Add a new waypoint
  const addWaypoint = () => {
    const newWaypoint: RoutePoint = {
      id: `waypoint-${Date.now()}`,
      name: "",
      position: null,
    }
    setWaypoints([...waypoints, newWaypoint])
  }

  // Remove a waypoint
  const removeWaypoint = (index: number) => {
    const updatedWaypoints = [...waypoints]
    updatedWaypoints.splice(index, 1)
    setWaypoints(updatedWaypoints)
  }

  // Handle drag and drop reordering of waypoints
  const onDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(waypoints)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setWaypoints(items)
  }

  // Handle map click to set points
  const handleMapClick = async (position: [number, number]) => {
    // If no point type is selected, show a message
    if (!selectedPointType) {
      setError("Silakan pilih jenis titik terlebih dahulu (Awal, Akhir, atau Singgah)")
      return
    }

    // Get address information for the clicked location
    const addressInfo = await getAddressFromCoordinates(position)

    // Update the appropriate point based on the selected type
    if (selectedPointType === "start") {
      setStartPoint({
        ...startPoint,
        name: addressInfo.name,
        position,
        address: addressInfo.address,
      })
      setSelectedPointType(null) // Reset selection after setting
    } else if (selectedPointType === "end") {
      setEndPoint({
        ...endPoint,
        name: addressInfo.name,
        position,
        address: addressInfo.address,
      })
      setSelectedPointType(null) // Reset selection after setting
    } else if (selectedPointType === "waypoint") {
      if (selectedWaypointIndex >= 0 && selectedWaypointIndex < waypoints.length) {
        // Update existing waypoint
        const updatedWaypoints = [...waypoints]
        updatedWaypoints[selectedWaypointIndex] = {
          ...updatedWaypoints[selectedWaypointIndex],
          name: addressInfo.name,
          position,
          address: addressInfo.address,
        }
        setWaypoints(updatedWaypoints)
      } else {
        // Add new waypoint
        const newWaypoint: RoutePoint = {
          id: `waypoint-${Date.now()}`,
          name: addressInfo.name,
          position,
          address: addressInfo.address,
        }
        setWaypoints([...waypoints, newWaypoint])
      }
      setSelectedPointType(null) // Reset selection
      setSelectedWaypointIndex(-1)
    }
  }

  // Mark a point type as selected for map interaction
  const selectPointTypeForMap = (type: "start" | "end" | "waypoint", index = -1) => {
    setSelectedPointType(type)
    setSelectedWaypointIndex(index)
    setError(null)
  }

  // Calculate route using OSRM
  const calculateRoute = useCallback(async () => {
    // Check if we have valid start and end points
    if (!startPoint.position || !endPoint.position) {
      setError("Titik awal dan akhir diperlukan untuk menghitung rute")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Prepare waypoints for OSRM
      const validWaypoints = waypoints.filter((wp) => wp.position)

      if (validWaypoints.length === 0) {
        // Direct route from start to end
        const routePoints = [startPoint.position, endPoint.position]

        // Call OSRM API
        const osrmWaypoints = routePoints.map((point) => ({
          latitude: point[0],
          longitude: point[1],
        }))

        const osrmResponse = await OSRMServiceInline.getRoute(osrmWaypoints, {
          profile: selectedTransportMode,
          geometries: "geojson",
          steps: true,
        })

        // Extract route geometry
        const routeCoordinates = osrmResponse.routes[0].geometry.coordinates.map(
          (coord) => [coord[1], coord[0]] as [number, number],
        )

        setRoute(routeCoordinates)

        // Set time and distance
        const durationSeconds = osrmResponse.routes[0].duration
        const distanceMeters = osrmResponse.routes[0].distance

        setEstimatedTime(OSRMServiceInline.formatDuration(durationSeconds))
        setEstimatedDistance(OSRMServiceInline.formatDistance(distanceMeters))
      } else {
        // Route with waypoints
        const routePoints = [
          startPoint.position,
          ...validWaypoints.map((wp) => wp.position as [number, number]),
          endPoint.position,
        ]

        // Call OSRM API
        const osrmWaypoints = routePoints.map((point) => ({
          latitude: point[0],
          longitude: point[1],
        }))

        const osrmResponse = await OSRMServiceInline.getRoute(osrmWaypoints, {
          profile: selectedTransportMode,
          geometries: "geojson",
          steps: true,
        })

        // Extract route geometry
        const routeCoordinates = osrmResponse.routes[0].geometry.coordinates.map(
          (coord) => [coord[1], coord[0]] as [number, number],
        )

        setRoute(routeCoordinates)

        // Set time and distance
        const durationSeconds = osrmResponse.routes[0].duration
        const distanceMeters = osrmResponse.routes[0].distance

        setEstimatedTime(OSRMServiceInline.formatDuration(durationSeconds))
        setEstimatedDistance(OSRMServiceInline.formatDistance(distanceMeters))
      }
    } catch (error) {
      console.error("Error calculating route:", error)
      setError("Gagal menghitung rute. Silakan coba lagi atau periksa titik-titik lokasi Anda.")
    } finally {
      setIsLoading(false)
    }
  }, [startPoint.position, endPoint.position, waypoints, selectedTransportMode])

  // Recalculate route when points or transport mode changes
  useEffect(() => {
    if (startPoint.position && endPoint.position) {
      calculateRoute()
    }
  }, [startPoint.position, endPoint.position, waypoints, selectedTransportMode, calculateRoute])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5 text-blue-600" />
            Rute Perjalanan Kustom
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Transport mode selection */}
            <div className="flex gap-2">
              <Button
                variant={selectedTransportMode === "driving" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setSelectedTransportMode("driving")}
              >
                <Car className="mr-2 h-4 w-4" />
                Mobil
              </Button>
              <Button
                variant={selectedTransportMode === "walking" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setSelectedTransportMode("walking")}
              >
                <Walk className="mr-2 h-4 w-4" />
                Jalan Kaki
              </Button>
              <Button
                variant={selectedTransportMode === "cycling" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setSelectedTransportMode("cycling")}
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

            {/* Map interaction info */}
            <Alert className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-600">Petunjuk Interaktif</AlertTitle>
              <AlertDescription className="text-blue-800">
                Pilih jenis titik (Awal, Akhir, atau Singgah) dengan tombol{" "}
                <MapPin className="inline h-4 w-4 text-blue-600" /> di sebelah kanan input, lalu klik pada peta untuk
                menentukan lokasinya.
              </AlertDescription>
            </Alert>

            {/* Error message */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Start point */}
            <div className="space-y-2">
              <Label htmlFor="start">Titik Awal</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="start"
                    value={startPoint.name}
                    onChange={(e) => setStartPoint({ ...startPoint, name: e.target.value })}
                    placeholder="Masukkan lokasi awal"
                    onKeyDown={(e) => e.key === "Enter" && searchLocation(startPoint.name, "start")}
                    className={selectedPointType === "start" ? "border-blue-500 ring-2 ring-blue-200" : ""}
                  />
                  {searchingFor === "start" && (
                    <div className="absolute right-3 top-3">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-600"></div>
                    </div>
                  )}

                  {/* Search results dropdown */}
                  {searchResults.length > 0 && searchingFor === "start" && (
                    <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg max-h-60 overflow-auto">
                      {searchResults.map((result, index) => (
                        <div
                          key={index}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                          onClick={() => selectLocation(result, "start")}
                        >
                          {result.display_name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <Button
                  variant={selectedPointType === "start" ? "default" : "outline"}
                  size="icon"
                  onClick={() => selectPointTypeForMap("start")}
                  title="Pilih lokasi pada peta"
                >
                  <MapPin className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Waypoints */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Tempat Singgah</Label>
                <Button variant="outline" size="sm" onClick={addWaypoint}>
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah
                </Button>
              </div>

              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="waypoints">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                      {waypoints.map((waypoint, index) => (
                        <Draggable key={waypoint.id} draggableId={waypoint.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="flex gap-2 items-center"
                            >
                              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">
                                {index + 1}
                              </div>
                              <div className="relative flex-1">
                                <Input
                                  value={waypoint.name}
                                  onChange={(e) => {
                                    const updatedWaypoints = [...waypoints]
                                    updatedWaypoints[index].name = e.target.value
                                    setWaypoints(updatedWaypoints)
                                  }}
                                  placeholder={`Tempat singgah ${index + 1}`}
                                  onKeyDown={(e) =>
                                    e.key === "Enter" && searchLocation(waypoint.name, `waypoint-${index}`)
                                  }
                                  className={
                                    selectedPointType === "waypoint" && selectedWaypointIndex === index
                                      ? "border-blue-500 ring-2 ring-blue-200"
                                      : ""
                                  }
                                />
                                {searchingFor === `waypoint-${index}` && (
                                  <div className="absolute right-3 top-3">
                                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-600"></div>
                                  </div>
                                )}

                                {/* Search results dropdown */}
                                {searchResults.length > 0 && searchingFor === `waypoint-${index}` && (
                                  <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg max-h-60 overflow-auto">
                                    {searchResults.map((result, resultIndex) => (
                                      <div
                                        key={resultIndex}
                                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                                        onClick={() => selectLocation(result, "waypoint", index)}
                                      >
                                        {result.display_name}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <Button
                                variant={
                                  selectedPointType === "waypoint" && selectedWaypointIndex === index
                                    ? "default"
                                    : "outline"
                                }
                                size="icon"
                                onClick={() => selectPointTypeForMap("waypoint", index)}
                                title="Pilih lokasi pada peta"
                              >
                                <MapPin className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeWaypoint(index)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>

            {/* End point */}
            <div className="space-y-2">
              <Label htmlFor="end">Titik Akhir</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="end"
                    value={endPoint.name}
                    onChange={(e) => setEndPoint({ ...endPoint, name: e.target.value })}
                    placeholder="Masukkan lokasi tujuan"
                    onKeyDown={(e) => e.key === "Enter" && searchLocation(endPoint.name, "end")}
                    className={selectedPointType === "end" ? "border-blue-500 ring-2 ring-blue-200" : ""}
                  />
                  {searchingFor === "end" && (
                    <div className="absolute right-3 top-3">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-600"></div>
                    </div>
                  )}

                  {/* Search results dropdown */}
                  {searchResults.length > 0 && searchingFor === "end" && (
                    <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg max-h-60 overflow-auto">
                      {searchResults.map((result, index) => (
                        <div
                          key={index}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                          onClick={() => selectLocation(result, "end")}
                        >
                          {result.display_name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <Button
                  variant={selectedPointType === "end" ? "default" : "outline"}
                  size="icon"
                  onClick={() => selectPointTypeForMap("end")}
                  title="Pilih lokasi pada peta"
                >
                  <MapPin className="h-4 w-4" />
                </Button>
              </div>
            </div>

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
      <MapIntegration
        markers={markers}
        showRoute={route.length > 0}
        routePoints={route}
        height="500px"
        interactive={true}
        onMapClick={handleMapClick}
      />
    </div>
  )
}
