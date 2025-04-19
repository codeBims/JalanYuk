"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { User, Mail, MapPin, Calendar, Edit } from "lucide-react"
import Image from "next/image"
import EditProfileDialog from "@/components/edit-profile-dialog"

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Set isMounted to true after component mounts to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isLoading, isAuthenticated, router])

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user || !user.name) return "U"

    const nameParts = user.name.split(" ")
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase()

    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect in useEffect
  }

  // Only render the component after it's mounted on the client
  if (!isMounted) {
    return null
  }

  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/placeholder.svg?height=1080&width=1920"
          alt="Mountain landscape"
          fill
          className="object-cover opacity-20"
        />
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Profile Sidebar */}
            <div className="w-full md:w-1/3">
              <Card className="bg-white/90 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center">
                    <Avatar className="h-24 w-24 bg-blue-600 text-white text-2xl">
                      <AvatarFallback>{getUserInitials()}</AvatarFallback>
                    </Avatar>
                    <h2 className="mt-4 text-xl font-bold">{user?.name}</h2>
                    <p className="text-gray-500">{user?.email}</p>

                    <Button variant="outline" className="mt-4 w-full" onClick={() => setShowEditDialog(true)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Profil
                    </Button>
                  </div>

                  <div className="mt-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Nama</p>
                        <p>{user?.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p>{user?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Lokasi</p>
                        <p>Jakarta, Indonesia</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Bergabung Sejak</p>
                        <p>Maret 2023</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Profile Content */}
            <div className="w-full md:w-2/3">
              <Card className="bg-white/90 backdrop-blur-sm mb-6">
                <CardHeader>
                  <CardTitle>Riwayat Perjalanan</CardTitle>
                </CardHeader>
                <CardContent>
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="mb-4 pb-4 border-b last:border-0 last:mb-0 last:pb-0">
                      <h3 className="font-semibold">Liburan ke Bali</h3>
                      <p className="text-sm text-gray-500">1-3 April 2023</p>
                      <p className="mt-1">3 tempat wisata dikunjungi</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Ulasan Saya</CardTitle>
                </CardHeader>
                <CardContent>
                  {[1, 2].map((item) => (
                    <div key={item} className="mb-4 pb-4 border-b last:border-0 last:mb-0 last:pb-0">
                      <h3 className="font-semibold">Pantai Kuta</h3>
                      <div className="flex items-center mt-1">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`h-4 w-4 ${i < 4 ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                          </svg>
                        ))}
                      </div>
                      <p className="mt-1">Pantai yang indah dengan pemandangan matahari terbenam yang spektakuler.</p>
                      <p className="text-sm text-gray-500 mt-1">12 Maret 2023</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <EditProfileDialog open={showEditDialog} onOpenChange={setShowEditDialog} />
    </div>
  )
}
