/**
 * API client for making requests to the backend
 */
import { config } from "./config"

interface ApiOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE"
  body?: any
  headers?: Record<string, string>
  cache?: RequestCache
}

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

export async function apiRequest<T = any>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { method = "GET", body, headers = {}, cache = "default" } = options

  const url = `${config.apiBaseUrl}/${endpoint.startsWith("/") ? endpoint.slice(1) : endpoint}`

  const requestOptions: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    cache,
    credentials: "include",
  }

  if (body) {
    requestOptions.body = JSON.stringify(body)
  }

  try {
    const response = await fetch(url, requestOptions)

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

    return await response.json()
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    // Network errors or other issues
    throw new ApiError(error instanceof Error ? error.message : "Unknown API error", 0)
  }
}

// Convenience methods
export const api = {
  get: <T = any>(endpoint: string, options?: Omit<ApiOptions, "method" | "body">) =>
    apiRequest<T>(endpoint, { ...options, method: "GET" }),

  post: <T = any>(endpoint: string, body: any, options?: Omit<ApiOptions, "method">) =>
    apiRequest<T>(endpoint, { ...options, method: "POST", body }),

  put: <T = any>(endpoint: string, body: any, options?: Omit<ApiOptions, "method">) =>
    apiRequest<T>(endpoint, { ...options, method: "PUT", body }),

  delete: <T = any>(endpoint: string, options?: Omit<ApiOptions, "method">) =>
    apiRequest<T>(endpoint, { ...options, method: "DELETE" }),
}
