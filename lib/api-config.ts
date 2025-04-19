export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api"
export const TOKEN_STORAGE_KEY = "jalanyuk_auth_token"

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  LOGOUT: "/auth/logout",
  USER: "/auth/user",
  REQUEST_PASSWORD_RESET: "/auth/forgot-password",
  RESET_PASSWORD: "/auth/reset-password",
  UPDATE_PROFILE: "/auth/update-profile",

  // Itineraries
  ITINERARIES: "/itineraries",

  // Tourist Attractions
  ATTRACTIONS: "/tourist-attractions",

  // Reviews
  REVIEWS: "/reviews",

  // Recommendations
  RECOMMENDATIONS: "/recommendations",
}
