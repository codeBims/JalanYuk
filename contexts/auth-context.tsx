"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { authService, itineraryService } from "@/services/api-service"
import { ApiError } from "@/services/api-service"

interface User {
  id: number
  name: string
  email: string
  location?: string
  phone?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, passwordConfirmation: string) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
  saveItinerary: (itinerary: any) => Promise<any>
  getUserItineraries: () => Promise<any[]>
  deleteItinerary: (itineraryId: string) => Promise<void>
  updateUserProfile: (userData: Partial<User>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in on mount
    const checkAuth = async () => {
      try {
        // Hanya akses localStorage di client-side
        if (typeof window !== "undefined") {
          // Cek localStorage untuk demo
          const storedUser = localStorage.getItem("jalanyuk_current_user")
          if (storedUser) {
            setUser(JSON.parse(storedUser))
            setIsLoading(false)
            return
          }
        }

        // Get current user from API
        try {
          const userData = await authService.getCurrentUser()
          setUser(userData)
        } catch (error) {
          // If API call fails, user is not authenticated
          setUser(null)
        }
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Pastikan fungsi login menyimpan user dengan benar
  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // Login via API
      const userData = await authService.login(email, password)
      setUser(userData)
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message)
      } else {
        throw new Error("Login gagal. Silakan coba lagi.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (name: string, email: string, password: string, passwordConfirmation: string) => {
    setIsLoading(true)
    try {
      // Register via API
      await authService.register(name, email, password, passwordConfirmation)
      // Registration successful, but don't log in automatically
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message)
      } else {
        throw new Error("Pendaftaran gagal. Silakan coba lagi.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      // Logout via API
      await authService.logout()
      setUser(null)

      // Hapus data user dari localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("jalanyuk_current_user")
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Fungsi untuk memperbarui profil pengguna
  const updateUserProfile = async (userData: Partial<User>) => {
    if (!user) throw new Error("Anda harus login untuk memperbarui profil")

    try {
      // Untuk demo, update user di localStorage
      if (typeof window !== "undefined") {
        const updatedUser = {
          ...user,
          ...userData,
        }

        localStorage.setItem("jalanyuk_current_user", JSON.stringify(updatedUser))
        setUser(updatedUser)
        return
      }

      // Jika di server-side atau API asli tersedia
      // const updatedUser = await authService.updateProfile(userData)
      // setUser(updatedUser)
    } catch (error) {
      console.error("Error updating profile:", error)
      throw error
    }
  }

  // Itinerary management functions
  // Perbaiki fungsi saveItinerary untuk menambahkan user_id secara otomatis
  const saveItinerary = async (itinerary: any) => {
    if (!user) throw new Error("Anda harus login untuk menyimpan itinerary")

    try {
      // Pastikan itinerary memiliki user_id
      const itineraryWithUserId = {
        ...itinerary,
        user_id: user.id,
      }

      // Untuk demo, simpan ke localStorage
      if (typeof window !== "undefined") {
        const storedItineraries = localStorage.getItem("jalanyuk_itineraries")
        let itineraries = storedItineraries ? JSON.parse(storedItineraries) : []

        // Jika itinerary memiliki ID, update yang sudah ada
        if (itineraryWithUserId.id) {
          itineraries = itineraries.map((item: any) =>
            item.id === itineraryWithUserId.id ? itineraryWithUserId : item,
          )
        } else {
          // Jika tidak, tambahkan sebagai itinerary baru dengan ID baru
          itineraryWithUserId.id = Date.now().toString()
          itineraries.push(itineraryWithUserId)
        }

        localStorage.setItem("jalanyuk_itineraries", JSON.stringify(itineraries))
        return itineraryWithUserId
      }

      // Jika di server-side atau API asli tersedia
      if (itineraryWithUserId.id) {
        return await itineraryService.updateItinerary(itineraryWithUserId.id, itineraryWithUserId)
      } else {
        return await itineraryService.createItinerary(itineraryWithUserId)
      }
    } catch (error) {
      console.error("Error saving itinerary:", error)
      throw error
    }
  }

  const getUserItineraries = async () => {
    if (!user) return []

    try {
      // Untuk demo, buat data itinerary dummy jika user sudah login
      if (typeof window !== "undefined") {
        // Cek apakah ada itinerary di localStorage
        const storedItineraries = localStorage.getItem("jalanyuk_itineraries")

        if (!storedItineraries) {
          // Buat itinerary dummy jika belum ada
          const dummyItineraries = [
            {
              id: "1",
              title: "Liburan ke Bali",
              description: "Liburan keluarga ke Bali selama 3 hari",
              startDate: "2023-06-01",
              endDate: "2023-06-03",
              days: [
                {
                  date: "2023-06-01",
                  items: [
                    { attraction: "Pantai Kuta", time: "09:00 - 11:00", notes: "Bawa sunscreen" },
                    { attraction: "Tanah Lot", time: "14:00 - 16:00", notes: "Cek pasang surut" },
                  ],
                },
                {
                  date: "2023-06-02",
                  items: [
                    { attraction: "Ubud Monkey Forest", time: "10:00 - 12:00", notes: "Hati-hati dengan monyet" },
                    { attraction: "Tegallalang Rice Terrace", time: "14:00 - 16:00", notes: "Bawa kamera" },
                  ],
                },
                {
                  date: "2023-06-03",
                  items: [
                    { attraction: "Seminyak Beach", time: "09:00 - 11:00", notes: "Nikmati sunset" },
                    { attraction: "Jimbaran Bay", time: "18:00 - 20:00", notes: "Makan malam seafood" },
                  ],
                },
              ],
            },
          ]

          // Simpan ke localStorage
          localStorage.setItem("jalanyuk_itineraries", JSON.stringify(dummyItineraries))
          return dummyItineraries
        }

        // Kembalikan itinerary dari localStorage
        return JSON.parse(storedItineraries)
      }

      // Jika di server-side, kembalikan array kosong
      return []
    } catch (error) {
      console.error("Error getting itineraries:", error)
      return []
    }
  }

  const deleteItinerary = async (itineraryId: string) => {
    if (!user) throw new Error("Anda harus login untuk menghapus itinerary")

    try {
      // Untuk demo, hapus dari localStorage
      if (typeof window !== "undefined") {
        const storedItineraries = localStorage.getItem("jalanyuk_itineraries")
        if (storedItineraries) {
          const itineraries = JSON.parse(storedItineraries)
          const updatedItineraries = itineraries.filter((item: any) => item.id !== itineraryId)
          localStorage.setItem("jalanyuk_itineraries", JSON.stringify(updatedItineraries))
        }
      }
    } catch (error) {
      console.error("Error deleting itinerary:", error)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        saveItinerary,
        getUserItineraries,
        deleteItinerary,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
