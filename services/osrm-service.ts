import { config } from "@/lib/config"

/**
 * Service for interacting with the OSRM (Open Source Routing Machine) API
 * to get routes, distances, and travel times between locations
 */

interface RouteOptions {
  profile?: "driving" | "walking" | "cycling"
  alternatives?: boolean
  steps?: boolean
  geometries?: "polyline" | "geojson"
  overview?: "simplified" | "full" | "false"
  annotations?: boolean
}

interface Waypoint {
  latitude: number
  longitude: number
  name?: string
}

interface RouteResponse {
  routes: Array<{
    distance: number // meters
    duration: number // seconds
    geometry: any // polyline or geojson
    legs: Array<{
      distance: number
      duration: number
      steps: Array<any>
      summary: string
    }>
    weight: number
    weight_name: string
  }>
  waypoints: Array<{
    name: string
    location: [number, number]
    distance: number
  }>
}

const OSRM_API_URL = config.osrmApiUrl || "https://router.project-osrm.org"

export const OSRMService = {
  /**
   * Get a route between multiple waypoints
   *
   * @param waypoints Array of waypoints (latitude, longitude)
   * @param options Routing options
   * @returns Promise with route data
   */
  getRoute: async (waypoints: Waypoint[], options: RouteOptions = {}): Promise<RouteResponse> => {
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
    const url = new URL(`${OSRM_API_URL}/route/v1/${profile}/${coordinates}`)

    // Add query parameters
    url.searchParams.append("alternatives", alternatives.toString())
    url.searchParams.append("steps", steps.toString())
    url.searchParams.append("geometries", geometries)
    url.searchParams.append("overview", overview)
    url.searchParams.append("annotations", annotations.toString())

    try {
      const response = await fetch(url.toString())

      if (!response.ok) {
        throw new Error(`OSRM API error: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.code !== "Ok") {
        throw new Error(`OSRM routing error: ${data.message}`)
      }

      return data as RouteResponse
    } catch (error) {
      console.error("Error fetching route from OSRM:", error)
      throw error
    }
  },

  /**
   * Format duration in seconds to a human-readable string
   *
   * @param seconds Duration in seconds
   * @returns Formatted duration string
   */
  formatDuration: (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    if (hours > 0) {
      return `${hours} jam ${minutes} menit`
    } else {
      return `${minutes} menit`
    }
  },

  /**
   * Format distance in meters to a human-readable string
   *
   * @param meters Distance in meters
   * @returns Formatted distance string
   */
  formatDistance: (meters: number): string => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`
    } else {
      return `${Math.round(meters)} m`
    }
  },
}
