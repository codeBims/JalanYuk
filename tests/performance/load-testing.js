import http from "k6/http"
import { sleep, check } from "k6"
import { Counter, Rate, Trend } from "k6/metrics"

// Custom metrics
const errors = new Counter("errors")
const apiRequestDuration = new Trend("api_request_duration")
const apiRequests = new Rate("api_requests")

// Test configuration
export const options = {
  stages: [
    { duration: "1m", target: 50 }, // Ramp up to 50 users over 1 minute
    { duration: "3m", target: 50 }, // Stay at 50 users for 3 minutes
    { duration: "1m", target: 100 }, // Ramp up to 100 users over 1 minute
    { duration: "5m", target: 100 }, // Stay at 100 users for 5 minutes
    { duration: "1m", target: 0 }, // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ["p(95)<500"], // 95% of requests should be below 500ms
    "api_request_duration{endpoint:tourist-attractions}": ["p(95)<300"], // 95% of tourist attraction requests should be below 300ms
    "api_request_duration{endpoint:recommendations}": ["p(95)<1000"], // 95% of recommendation requests should be below 1000ms
    errors: ["rate<0.1"], // Error rate should be less than 10%
  },
}

// Base URL for the API
const BASE_URL = "https://api.jalanyuk.com"

// Utility function to check response and record metrics
function checkResponse(response, endpoint) {
  const success = check(response, {
    "status is 200": (r) => r.status === 200,
    "response body has data": (r) => r.json("data") !== null,
  })

  if (!success) {
    errors.add(1)
    console.log(`Error with ${endpoint}: ${response.status} - ${response.body}`)
  }

  apiRequestDuration.add(response.timings.duration, { endpoint })
  apiRequests.add(1, { endpoint })
}

// Main test function
export default function () {
  // Test tourist attractions endpoint
  let response = http.get(`${BASE_URL}/api/tourist-attractions`)
  checkResponse(response, "tourist-attractions")

  // Test tourist attraction details endpoint
  const attractionId = Math.floor(Math.random() * 10) + 1 // Random ID between 1-10
  response = http.get(`${BASE_URL}/api/tourist-attractions/${attractionId}`)
  checkResponse(response, "tourist-attraction-details")

  // Test recommendations endpoint
  const userId = Math.floor(Math.random() * 100) + 1 // Random user ID between 1-100
  response = http.get(`${BASE_URL}/api/recommendations?user_id=${userId}`)
  checkResponse(response, "recommendations")

  // Test itinerary generation endpoint
  const payload = JSON.stringify({
    user_id: userId,
    start_date: "2023-06-01",
    end_date: "2023-06-03",
    location: "Bali",
  })

  response = http.post(`${BASE_URL}/api/recommendations/generate-itinerary`, payload, {
    headers: { "Content-Type": "application/json" },
  })
  checkResponse(response, "itinerary-generation")

  // Wait between iterations
  sleep(Math.random() * 3 + 1) // Random sleep between 1-4 seconds
}
