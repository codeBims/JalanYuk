import { render, screen, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom"
import MapIntegration from "@/components/map-integration"

// Mock Leaflet
global.L = {
  map: jest.fn(() => ({
    setView: jest.fn().mockReturnThis(),
    eachLayer: jest.fn(),
    fitBounds: jest.fn(),
    getZoom: jest.fn().mockReturnValue(10),
    setZoom: jest.fn(),
  })),
  tileLayer: jest.fn(() => ({
    addTo: jest.fn(),
  })),
  marker: jest.fn(() => ({
    addTo: jest.fn().mockReturnThis(),
    bindPopup: jest.fn().mockReturnThis(),
    on: jest.fn(),
  })),
  polyline: jest.fn(() => ({
    addTo: jest.fn().mockReturnThis(),
    getBounds: jest.fn(),
  })),
  latLngBounds: jest.fn(() => ({
    extend: jest.fn(),
    padding: jest.fn(),
  })),
}

// Mock document.createElement for script and link elements
const originalCreateElement = document.createElement
document.createElement = (tagName) => {
  const element = originalCreateElement.call(document, tagName)
  if (tagName === "script" || tagName === "link") {
    setTimeout(() => {
      element.onload && element.onload()
    }, 0)
  }
  return element
}

describe("MapIntegration Component", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test("renders loading state initially", () => {
    render(<MapIntegration />)
    expect(screen.getByText("Memuat peta...")).toBeInTheDocument()
  })

  test("initializes map when loaded", async () => {
    render(<MapIntegration />)

    await waitFor(() => {
      expect(global.L.map).toHaveBeenCalled()
      expect(global.L.tileLayer).toHaveBeenCalled()
    })
  })

  test("adds markers to the map", async () => {
    const markers = [
      { id: 1, position: [-8.7184, 115.1686], title: "Pantai Kuta" },
      { id: 2, position: [-8.6215, 115.0865], title: "Tanah Lot" },
    ]

    render(<MapIntegration markers={markers} />)

    await waitFor(() => {
      expect(global.L.marker).toHaveBeenCalledTimes(2)
    })
  })

  test("adds route to the map when showRoute is true", async () => {
    const routePoints = [
      [-8.7184, 115.1686],
      [-8.6215, 115.0865],
    ]

    render(<MapIntegration showRoute={true} routePoints={routePoints} />)

    await waitFor(() => {
      expect(global.L.polyline).toHaveBeenCalled()
    })
  })

  test("calls onMarkerClick when marker is clicked", async () => {
    const markers = [{ id: 1, position: [-8.7184, 115.1686], title: "Pantai Kuta" }]
    const onMarkerClick = jest.fn()

    render(<MapIntegration markers={markers} onMarkerClick={onMarkerClick} />)

    await waitFor(() => {
      expect(global.L.marker().on).toHaveBeenCalled()
      // Simulate marker click
      const clickHandler = global.L.marker().on.mock.calls[0][1]
      clickHandler()
      expect(onMarkerClick).toHaveBeenCalledWith(1)
    })
  })
})
