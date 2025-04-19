import { API_BASE_URL, API_ENDPOINTS, TOKEN_STORAGE_KEY } from "@/lib/api-config"

// Error class for API errors
export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

// Get auth token from storage
const getToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem(TOKEN_STORAGE_KEY)
  }
  return null
}

// Set auth token in storage
const setToken = (token: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_STORAGE_KEY, token)
  }
}

// Remove auth token from storage
const removeToken = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
  }
}

// Base API request function
const apiRequest = async <T = any>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`

  // Default headers
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...options.headers,
  }

  // Add auth token if available
  const token = getToken()
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  // Make the request
  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Include cookies for Laravel Sanctum authentication
  })

  // Handle non-2xx responses
  if (!response.ok) {
    let errorMessage = `API Error: ${response.status} ${response.statusText}`

    try {
      const errorData = await response.json()
      if (errorData.message) {
        errorMessage = errorData.message
      }
    } catch (e) {
      // Ignore JSON parsing error
    }

    throw new ApiError(errorMessage, response.status)
  }

  // Parse JSON response
  const data = await response.json()
  return data
}

// Fetch CSRF cookie for Laravel Sanctum
const getCsrfCookie = async (): Promise<void> => {
  const url = `${API_BASE_URL}/sanctum/csrf-cookie`
  await fetch(url, {
    method: "GET",
    credentials: "include",
  })
}

// Auth services
export const authService = {
  // Login user
  login: async (email: string, password: string) => {
    const data = await apiRequest<{ token: string; user: any }>(API_ENDPOINTS.LOGIN, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })

    // Store token
    setToken(data.token)

    return data.user
  },

  // Register user
  register: async (name: string, email: string, password: string, password_confirmation: string) => {
    return apiRequest(API_ENDPOINTS.REGISTER, {
      method: "POST",
      body: JSON.stringify({ name, email, password, password_confirmation }),
    })
  },

  // Logout user
  logout: async () => {
    try {
      // Fetch CSRF cookie before logout
      await getCsrfCookie()
      await apiRequest(API_ENDPOINTS.LOGOUT, { method: "POST" })
    } finally {
      // Always remove token even if API call fails
      removeToken()
    }
  },

  // Get current user
  getCurrentUser: async () => {
    return apiRequest(API_ENDPOINTS.USER)
  },

  // Update user profile
  updateProfile: async (userData: any) => {
    return apiRequest(API_ENDPOINTS.UPDATE_PROFILE, {
      method: "PUT",
      body: JSON.stringify(userData),
    })
  },

  // Request password reset
  requestPasswordReset: async (email: string) => {
    return apiRequest(API_ENDPOINTS.REQUEST_PASSWORD_RESET, {
      method: "POST",
      body: JSON.stringify({ email }),
    })
  },

  // Reset password with token
  resetPassword: async (token: string, password: string, password_confirmation: string) => {
    return apiRequest(API_ENDPOINTS.RESET_PASSWORD, {
      method: "POST",
      body: JSON.stringify({ token, password, password_confirmation }),
    })
  },
}

// Auth services
export const authService = {
  // Login user
  login: async (email: string, password: string) => {
    const data = await apiRequest<{ token: string; user: any }>(API_ENDPOINTS.LOGIN, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })

    // Store token
    setToken(data.token)

    return data.user
  },

  // Register user
  register: async (name: string, email: string, password: string, password_confirmation: string) => {
    return apiRequest(API_ENDPOINTS.REGISTER, {
      method: "POST",
      body: JSON.stringify({ name, email, password, password_confirmation }),
    })
  },

  // Logout user
  logout: async () => {
    try {
      await apiRequest(API_ENDPOINTS.LOGOUT, { method: "POST" })
    } finally {
      // Always remove token even if API call fails
      removeToken()
    }
  },

  // Get current user
  getCurrentUser: async () => {
    return apiRequest(API_ENDPOINTS.USER)
  },

  // Update user profile
  updateProfile: async (userData: any) => {
    return apiRequest(API_ENDPOINTS.UPDATE_PROFILE, {
      method: "PUT",
      body: JSON.stringify(userData),
    })
  },

  // Request password reset
  requestPasswordReset: async (email: string) => {
    return apiRequest(API_ENDPOINTS.REQUEST_PASSWORD_RESET, {
      method: "POST",
      body: JSON.stringify({ email }),
    })
  },

  // Reset password with token
  resetPassword: async (token: string, password: string, password_confirmation: string) => {
    return apiRequest(API_ENDPOINTS.RESET_PASSWORD, {
      method: "POST",
      body: JSON.stringify({ token, password, password_confirmation }),
    })
  },
}

// Itinerary services
export const itineraryService = {
  // Get all itineraries for current user
  getItineraries: async () => {
    return apiRequest(`${API_ENDPOINTS.ITINERARIES}`)
  },

  // Get itinerary by ID
  getItinerary: async (id: string) => {
    return apiRequest(`${API_ENDPOINTS.ITINERARIES}/${id}`)
  },

  // Create new itinerary
  createItinerary: async (itineraryData: any) => {
    return apiRequest(API_ENDPOINTS.ITINERARIES, {
      method: "POST",
      body: JSON.stringify(itineraryData),
    })
  },

  // Update itinerary
  updateItinerary: async (id: string, itineraryData: any) => {
    return apiRequest(`${API_ENDPOINTS.ITINERARIES}/${id}`, {
      method: "PUT",
      body: JSON.stringify(itineraryData),
    })
  },

  // Delete itinerary
  deleteItinerary: async (id: string) => {
    return apiRequest(`${API_ENDPOINTS.ITINERARIES}/${id}`, { method: "DELETE" })
  },
}

// Tourist attraction services
export const attractionService = {
  // Get all attractions
  getAttractions: async (params: { category?: string; query?: string; page?: number; limit?: number } = {}) => {
    const queryParams = new URLSearchParams()

    if (params.category) queryParams.append("category", params.category)
    if (params.query) queryParams.append("query", params.query)
    if (params.page) queryParams.append("page", params.page.toString())
    if (params.limit) queryParams.append("limit", params.limit.toString())

    const queryString = queryParams.toString()
    const endpoint = queryString ? `${API_ENDPOINTS.ATTRACTIONS}?${queryString}` : API_ENDPOINTS.ATTRACTIONS

    return apiRequest(endpoint)
  },

  // Get attraction by ID
  getAttraction: async (id: number) => {
    return apiRequest(`${API_ENDPOINTS.ATTRACTIONS}/${id}`)
  },
}

// Review services
export const reviewService = {
  // Get reviews for an attraction
  getReviews: async (attractionId: number) => {
    return apiRequest(`${API_ENDPOINTS.ATTRACTIONS}/${attractionId}/reviews`)
  },

  // Create a review
  createReview: async (attractionId: number, reviewData: { rating: number; comment: string }) => {
    return apiRequest(`${API_ENDPOINTS.REVIEWS}`, {
      method: "POST",
      body: JSON.stringify({
        tourist_attraction_id: attractionId,
        ...reviewData,
      }),
    })
  },
}

// Recommendation services
export const recommendationService = {
  // Get recommendations
  getRecommendations: async () => {
    return apiRequest(API_ENDPOINTS.RECOMMENDATIONS)
  },

  // Generate itinerary with AI
  generateItinerary: async (params: {
    start_date: string
    end_date: string
    location?: string
  }) => {
    return apiRequest(`${API_ENDPOINTS.RECOMMENDATIONS}/generate-itinerary`, {
      method: "POST",
      body: JSON.stringify(params),
    })
  },
}
