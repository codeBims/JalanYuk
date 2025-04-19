"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Navigation, LocateFixed, Plus, Minus } from "lucide-react"

interface MapProps {
  center?: [number, number]
  zoom?: number
  markers?: Array<{
    id: string | number
    position: [number, number]
    title: string
    description?: string
    type?: "start" | "end" | "waypoint"
  }>
  showRoute?: boolean
  routePoints?: Array<[number, number]>
  height?: string
  onMarkerClick?: (markerId: string | number) => void
  onMapClick?: (position: [number, number]) => void
  interactive?: boolean
}

export default function MapIntegration({
  center = [-8.4095, 115.1889], // Default: Bali
  zoom = 12,
  markers = [],
  showRoute = false,
  routePoints = [],
  height = "400px",
  onMarkerClick,
  onMapClick,
  interactive = false,
}: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersLayerRef = useRef<any>(null)
  const routeLayerRef = useRef<any>(null)
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)

  // Load OpenStreetMap and Leaflet
  useEffect(() => {
    if (typeof window !== "undefined" && !window.L) {
      // Load Leaflet CSS
      const linkEl = document.createElement("link")
      linkEl.rel = "stylesheet"
      linkEl.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      linkEl.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
      linkEl.crossOrigin = ""
      document.head.appendChild(linkEl)

      // Load Leaflet JS
      const scriptEl = document.createElement("script")
      scriptEl.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
      scriptEl.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
      scriptEl.crossOrigin = ""
      scriptEl.onload = () => setIsMapLoaded(true)
      document.head.appendChild(scriptEl)
    } else if (window.L) {
      setIsMapLoaded(true)
    }
  }, [])

  // Initialize map
  useEffect(() => {
    if (isMapLoaded && mapRef.current && !mapInstanceRef.current) {
      const L = window.L

      // Create map instance
      const map = L.map(mapRef.current).setView(center, zoom)

      // Add tile layer (OpenStreetMap)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map)

      // Create layers for markers and route
      markersLayerRef.current = L.layerGroup().addTo(map)
      routeLayerRef.current = L.layerGroup().addTo(map)

      // Add click handler if provided
      if (onMapClick && interactive) {
        map.on("click", (e: any) => {
          const position: [number, number] = [e.latlng.lat, e.latlng.lng]
          onMapClick(position)
        })
      }

      mapInstanceRef.current = map
    }
  }, [isMapLoaded, center, zoom, onMapClick, interactive])

  // Get marker icon based on type
  const getMarkerIcon = (type = "waypoint") => {
    if (!isMapLoaded || !window.L) return null

    // Define different icons for start, end, and waypoints
    const L = window.L

    if (type === "start") {
      return L.divIcon({
        html: `<div class="flex items-center justify-center w-6 h-6 bg-green-500 text-white rounded-full border-2 border-white shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/></svg>
              </div>`,
        className: "",
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      })
    } else if (type === "end") {
      return L.divIcon({
        html: `<div class="flex items-center justify-center w-6 h-6 bg-red-500 text-white rounded-full border-2 border-white shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </div>`,
        className: "",
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      })
    }

    // Default waypoint marker
    return L.divIcon({
      html: `<div class="flex items-center justify-center w-6 h-6 bg-blue-500 text-white rounded-full border-2 border-white shadow-md">
              <span class="text-xs font-bold"></span>
            </div>`,
      className: "",
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    })
  }

  // Add markers to map
  useEffect(() => {
    if (isMapLoaded && mapInstanceRef.current && markersLayerRef.current) {
      const L = window.L
      const markersLayer = markersLayerRef.current

      // Clear existing markers
      markersLayer.clearLayers()

      // Add new markers
      if (markers.length > 0) {
        markers.forEach((marker) => {
          if (!marker.position) return

          // Determine icon color based on marker type
          let markerIcon
          if (marker.type === "start") {
            markerIcon = L.divIcon({
              html: `<div class="w-6 h-6 rounded-full bg-green-500 border-2 border-white flex items-center justify-center text-white font-bold">S</div>`,
              className: "custom-div-icon",
              iconSize: [24, 24],
              iconAnchor: [12, 12],
            })
          } else if (marker.type === "end") {
            markerIcon = L.divIcon({
              html: `<div class="w-6 h-6 rounded-full bg-red-500 border-2 border-white flex items-center justify-center text-white font-bold">E</div>`,
              className: "custom-div-icon",
              iconSize: [24, 24],
              iconAnchor: [12, 12],
            })
          } else {
            // Default or waypoint
            markerIcon = L.divIcon({
              html: `<div class="w-6 h-6 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-white font-bold"></div>`,
              className: "custom-div-icon",
              iconSize: [24, 24],
              iconAnchor: [12, 12],
            })
          }

          const markerInstance = L.marker(marker.position, { icon: markerIcon })
            .addTo(markersLayer)
            .bindPopup(`<strong>${marker.title}</strong>${marker.description ? `<br>${marker.description}` : ""}`)

          if (onMarkerClick) {
            markerInstance.on("click", () => onMarkerClick(marker.id))
          }
        })

        // Fit bounds to markers if more than one
        if (markers.length > 1) {
          const bounds = L.latLngBounds(markers.map((m) => m.position))
          mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] })
        } else if (markers.length === 1) {
          // Center on the single marker
          mapInstanceRef.current.setView(markers[0].position, zoom)
        }
      }
    }
  }, [isMapLoaded, markers, onMarkerClick, zoom])

  // Add route to map
  useEffect(() => {
    if (isMapLoaded && mapInstanceRef.current && routeLayerRef.current && showRoute) {
      const L = window.L
      const routeLayer = routeLayerRef.current

      // Clear existing routes
      routeLayer.clearLayers()

      // Add new route if we have points
      if (routePoints.length >= 2) {
        // Add route polyline
        const polyline = L.polyline(routePoints, {
          color: "#4F46E5", // Indigo color
          weight: 5,
          opacity: 0.7,
          lineJoin: "round",
        }).addTo(routeLayer)

        // Fit bounds to route
        mapInstanceRef.current.fitBounds(polyline.getBounds(), { padding: [50, 50] })
      }
    }
  }, [isMapLoaded, showRoute, routePoints])

  // Get user's current location
  const getUserLocation = () => {
    if (navigator.geolocation && mapInstanceRef.current) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation: [number, number] = [position.coords.latitude, position.coords.longitude]
          setUserLocation(userLocation)
          mapInstanceRef.current.setView(userLocation, 15)

          // If onMapClick is provided and we're in interactive mode, call it with the user's location
          if (interactive && onMapClick) {
            onMapClick(userLocation)
          }
        },
        (error) => {
          console.error("Error getting location:", error)
        },
      )
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-blue-600" />
          Peta Lokasi
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div ref={mapRef} className="rounded-md overflow-hidden" style={{ height, width: "100%" }}>
            {!isMapLoaded && (
              <div className="h-full w-full flex items-center justify-center bg-gray-100">
                <div className="text-center">
                  <MapPin className="h-8 w-8 text-blue-600 mx-auto mb-2 animate-pulse" />
                  <p className="text-gray-600">Memuat peta...</p>
                </div>
              </div>
            )}
          </div>

          {isMapLoaded && (
            <div className="absolute top-3 right-3 flex flex-col gap-2">
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8 bg-white text-gray-700 hover:bg-gray-100 shadow-md"
                onClick={() => {
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.setView(center, zoom)
                  }
                }}
              >
                <LocateFixed className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8 bg-white text-gray-700 hover:bg-gray-100 shadow-md"
                onClick={getUserLocation}
              >
                <Navigation className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8 bg-white text-gray-700 hover:bg-gray-100 shadow-md"
                onClick={() => {
                  if (mapInstanceRef.current) {
                    const currentZoom = mapInstanceRef.current.getZoom()
                    mapInstanceRef.current.setZoom(currentZoom + 1)
                  }
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8 bg-white text-gray-700 hover:bg-gray-100 shadow-md"
                onClick={() => {
                  if (mapInstanceRef.current) {
                    const currentZoom = mapInstanceRef.current.getZoom()
                    mapInstanceRef.current.setZoom(currentZoom - 1)
                  }
                }}
              >
                <Minus className="h-4 w-4" />
              </Button>
            </div>
          )}

          {interactive && isMapLoaded && (
            <div className="absolute bottom-3 left-3 bg-white p-2 rounded-md shadow-md text-sm text-gray-700">
              <p className="font-medium">Petunjuk:</p>
              <p>• Klik pada peta untuk memilih lokasi</p>
              <p>
                • Klik <Navigation className="inline h-3 w-3" /> untuk lokasi Anda saat ini
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
