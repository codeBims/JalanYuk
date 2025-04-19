"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { MapPin, Menu, X, User, LogOut, Settings, Bell, ChevronDown } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"
import { useAuth } from "@/contexts/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface NavItem {
  label: string
  href: string
}

// Tambahkan route untuk custom route di navItems
const navItems: NavItem[] = [
  { label: "Beranda", href: "/" },
  { label: "Jelajahi", href: "/explore" },
  { label: "Itinerary", href: "/itinerary-planner" },
  { label: "Rute Kustom", href: "/custom-route" },
  { label: "Itinerary Saya", href: "/my-itineraries" },
  { label: "Tentang Kami", href: "/about" },
]

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const isMobile = useMobile()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, logout, isAuthenticated } = useAuth()

  // Di dalam komponen Header, tambahkan state untuk mengontrol rendering
  const [isClient, setIsClient] = useState(false)

  // Tambahkan useEffect untuk menandai bahwa kita berada di client-side
  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleLogout = async () => {
    try {
      console.log("Logout started")
      await logout()
      console.log("Logout successful")
      router.push("/")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user || !user.name) return "U"

    const nameParts = user.name.split(" ")
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase()

    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase()
  }

  // Ubah bagian return untuk menghindari hydration mismatch
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <MapPin className="h-6 w-6 text-blue-600" />
          <span className="text-2xl font-bold text-blue-600">JalanYuk</span>
        </Link>

        {isMobile ? (
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[250px] sm:w-[300px]">
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    <span className="text-xl font-bold text-blue-600">JalanYuk</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <nav className="flex flex-col gap-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`px-4 py-2 rounded-md ${
                        pathname === item.href
                          ? "bg-blue-50 text-blue-600 font-medium"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>

                <div className="mt-auto pt-6 border-t border-gray-200">
                  {isAuthenticated ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 px-4 py-2">
                        <Avatar className="h-8 w-8 bg-blue-600 text-white">
                          <AvatarFallback>{getUserInitials()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user?.name}</p>
                          <p className="text-sm text-gray-500">{user?.email}</p>
                        </div>
                      </div>
                      <Link
                        href="/profile"
                        className="flex items-center gap-2 px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <User className="h-5 w-5" />
                        Profil Saya
                      </Link>
                      <Link
                        href="/notifications"
                        className="flex items-center gap-2 px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Bell className="h-5 w-5" />
                        Notifikasi
                      </Link>
                      <Link
                        href="/settings"
                        className="flex items-center gap-2 px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Settings className="h-5 w-5" />
                        Pengaturan
                      </Link>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => {
                          handleLogout()
                          setIsMenuOpen(false)
                        }}
                      >
                        <LogOut className="h-5 w-5 mr-2" />
                        Keluar
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          setIsMenuOpen(false)
                          router.push("/login")
                        }}
                      >
                        Masuk
                      </Button>
                      <Button
                        className="w-full"
                        onClick={() => {
                          setIsMenuOpen(false)
                          router.push("/register")
                        }}
                      >
                        Daftar
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        ) : (
          <div className="flex items-center gap-6">
            <nav className="flex items-center gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={pathname === item.href ? "text-blue-600 font-medium" : "text-gray-700 hover:text-blue-600"}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              {/* Hanya render bagian autentikasi di client-side */}
              {isClient && (
                <>
                  {isAuthenticated ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex items-center gap-2 px-2">
                          <Avatar className="h-8 w-8 bg-blue-600 text-white">
                            <AvatarFallback>{getUserInitials()}</AvatarFallback>
                          </Avatar>
                          <span className="hidden md:inline">{user?.name}</span>
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <div className="px-2 py-1.5 text-sm">
                          <p className="font-medium">{user?.name}</p>
                          <p className="text-xs text-gray-500">{user?.email}</p>
                        </div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => router.push("/profile")}>
                          <User className="mr-2 h-4 w-4" />
                          <span>Profil Saya</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push("/notifications")}>
                          <Bell className="mr-2 h-4 w-4" />
                          <span>Notifikasi</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push("/settings")}>
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Pengaturan</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout}>
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Keluar</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <>
                      <Button variant="outline" onClick={() => router.push("/login")}>
                        Masuk
                      </Button>
                      <Button onClick={() => router.push("/register")}>Daftar</Button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
