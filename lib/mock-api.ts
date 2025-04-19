// Mock API untuk digunakan saat backend tidak tersedia
// Ini akan memungkinkan aplikasi tetap berfungsi untuk demo

interface User {
  id: number
  name: string
  email: string
}

// Ubah fungsi getUsers dan saveUsers untuk menghindari akses localStorage di server
const getUsers = (): User[] => {
  if (typeof window === "undefined") return []

  try {
    const usersJson = localStorage.getItem("jalanyuk_users")
    return usersJson ? JSON.parse(usersJson) : []
  } catch (error) {
    console.error("Error getting users from localStorage:", error)
    return []
  }
}

const saveUsers = (users: User[]) => {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem("jalanyuk_users", JSON.stringify(users))
  } catch (error) {
    console.error("Error saving users to localStorage:", error)
  }
}

// Inisialisasi dengan beberapa pengguna demo jika belum ada
const initializeUsers = () => {
  if (typeof window === "undefined") return

  try {
    const users = getUsers()
    if (users.length === 0) {
      saveUsers([{ id: 1, name: "Demo User", email: "demo@example.com" }])
    }
  } catch (error) {
    console.error("Error initializing users:", error)
  }
}

// Panggil inisialisasi hanya di client-side
if (typeof window !== "undefined") {
  // Gunakan setTimeout untuk memastikan kode dijalankan setelah hydration
  setTimeout(() => {
    initializeUsers()
  }, 0)
}

export const mockApi = {
  // Auth endpoints
  register: async (name: string, email: string, password: string) => {
    return new Promise<{ success: boolean; message?: string }>((resolve) => {
      setTimeout(() => {
        const users = getUsers()

        // Cek apakah email sudah terdaftar
        if (users.some((user) => user.email === email)) {
          resolve({ success: false, message: "Email sudah terdaftar" })
          return
        }

        // Tambahkan pengguna baru
        const newUser = { id: Date.now(), name, email }
        users.push(newUser)
        saveUsers(users)

        resolve({ success: true })
      }, 1000) // Simulasi delay jaringan
    })
  },

  login: async (email: string, password: string) => {
    return new Promise<{ success: boolean; user?: User; message?: string }>((resolve) => {
      setTimeout(() => {
        const users = getUsers()
        const user = users.find((user) => user.email === email)

        if (!user) {
          resolve({ success: false, message: "Email tidak terdaftar" })
          return
        }

        // Dalam demo ini, kita tidak memeriksa password
        resolve({
          success: true,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
          },
        })
      }, 1000)
    })
  },

  forgotPassword: async (email: string) => {
    return new Promise<{ success: boolean; message?: string }>((resolve) => {
      setTimeout(() => {
        const users = getUsers()
        const user = users.find((user) => user.email === email)

        if (!user) {
          resolve({ success: false, message: "Email tidak terdaftar" })
          return
        }

        resolve({ success: true })
      }, 1000)
    })
  },

  resetPassword: async (token: string, password: string) => {
    return new Promise<{ success: boolean; message?: string }>((resolve) => {
      setTimeout(() => {
        // Dalam demo ini, kita selalu mengembalikan sukses
        resolve({ success: true })
      }, 1000)
    })
  },
}
