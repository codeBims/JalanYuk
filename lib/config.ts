/**
 * Application configuration based on environment variables
 */

export const config = {
  // API URLs
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "/api",
  osrmApiUrl: process.env.NEXT_PUBLIC_OSRM_API_URL || "https://router.project-osrm.org",

  // Google Maps & Places API Configuration
  googleMaps: {
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY || "", // bisa digunakan juga untuk Directions API
    directionsEndpoint: "https://maps.googleapis.com/maps/api/directions/json",
    placesEndpoint: "https://maps.googleapis.com/maps/api/place/nearbysearch/json",
  },

  // Feature flags
  enableOfflineSupport: process.env.NEXT_PUBLIC_ENABLE_OFFLINE_SUPPORT === "true",
  enableAnalytics: process.env.NODE_ENV === "production",

  // App metadata
  appName: "JalanYuk",
  appDescription: "Perencana perjalanan terpadu dengan rekomendasi AI dan integrasi peta",
  appVersion: "1.0.0",
};
