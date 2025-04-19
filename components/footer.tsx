"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { MapPin } from "lucide-react"
import { useRouter } from "next/navigation"

export default function Footer() {
  const router = useRouter()

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-6 w-6 text-blue-400" />
              <span className="text-2xl font-bold text-white">JalanYuk</span>
            </div>
            <p className="text-gray-400">
              Perencana perjalanan terpadu untuk memudahkan wisatawan menjelajahi Indonesia.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Fitur</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/explore" className="hover:text-white">
                  Pencarian Tempat Wisata
                </Link>
              </li>
              <li>
                <Link href="/itinerary-planner" className="hover:text-white">
                  Itinerary Planner
                </Link>
              </li>
              <li>
                <Link href="/recommendations" className="hover:text-white">
                  Rekomendasi AI
                </Link>
              </li>
              <li>
                <Link href="/demo-route" className="hover:text-white">
                  Integrasi Peta
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Perusahaan</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/about" className="hover:text-white">
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-white">
                  Karir
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-white">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white">
                  Kontak
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Unduh Aplikasi</h3>
            <div className="flex flex-col gap-3">
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => window.open("https://play.google.com/store/apps", "_blank")}
              >
                <Image
                  src="/placeholder.svg?height=24&width=24"
                  alt="Google Play"
                  width={24}
                  height={24}
                  className="mr-2"
                />
                Google Play
              </Button>
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => window.open("https://apps.apple.com", "_blank")}
              >
                <Image
                  src="/placeholder.svg?height=24&width=24"
                  alt="App Store"
                  width={24}
                  height={24}
                  className="mr-2"
                />
                App Store
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p>© {new Date().getFullYear()} JalanYuk. Hak Cipta Dilindungi.</p>
        </div>
      </div>
    </footer>
  )
}
