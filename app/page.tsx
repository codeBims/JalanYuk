"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"
import { Search, MapPin, Calendar, Star, Clock, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

export default function HomePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen">
      {/* Hero Section with Background */}
      <section className="relative py-20 md:py-32">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/placeholder.svg?height=1080&width=1920"
            alt="Beautiful landscape"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Rencanakan Perjalanan Impian Anda dengan JalanYuk
            </h1>
            <p className="text-xl text-gray-200 mb-8">
              Temukan tempat wisata terbaik, buat itinerary perjalanan, dan dapatkan rekomendasi sesuai preferensi Anda.
            </p>

            {/* Search Bar */}
            <div className="bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Cari tempat wisata..."
                  className="pl-10 w-full"
                  onKeyDown={(e) =>
                    e.key === "Enter" && router.push(`/explore?query=${encodeURIComponent(e.currentTarget.value)}`)
                  }
                />
              </div>
              <div className="flex-1 relative">
                <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Tanggal perjalanan"
                  className="pl-10 w-full"
                  onClick={() => router.push("/itinerary-planner")}
                />
              </div>
              <Button size="lg" className="md:w-auto w-full" onClick={() => router.push("/explore")}>
                Cari
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Fitur Utama</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<MapPin className="h-10 w-10 text-blue-600" />}
              title="Pencarian Tempat Wisata"
              description="Temukan tempat wisata berdasarkan kata kunci atau kategori tertentu."
              onClick={() => router.push("/explore")}
            />
            <FeatureCard
              icon={<Star className="h-10 w-10 text-blue-600" />}
              title="Ulasan & Rating"
              description="Lihat ulasan dan rating dari pengunjung lain sebelum memilih tujuan wisata."
              onClick={() => router.push("/explore")}
            />
            <FeatureCard
              icon={<Calendar className="h-10 w-10 text-blue-600" />}
              title="Itinerary Planner"
              description="Susun rencana perjalanan secara otomatis maupun manual dengan mudah."
              onClick={() => router.push("/itinerary-planner")}
            />
            <FeatureCard
              icon={<TrendingUp className="h-10 w-10 text-blue-600" />}
              title="Rekomendasi Berbasis AI"
              description="Dapatkan rekomendasi tempat wisata berdasarkan preferensi Anda."
              onClick={() => router.push("/recommendations")}
            />
            <FeatureCard
              icon={<MapPin className="h-10 w-10 text-blue-600" />}
              title="Integrasi Peta"
              description="Lihat lokasi dan rute perjalanan dengan estimasi waktu yang akurat."
              onClick={() => router.push("/demo-route")}
            />
            <FeatureCard
              icon={<Clock className="h-10 w-10 text-blue-600" />}
              title="Notifikasi & Pengingat"
              description="Terima notifikasi dan pengingat terkait rencana perjalanan Anda."
              onClick={() => router.push("/notifications")}
            />
          </div>
        </div>
      </section>

      {/* Popular Destinations with Background */}
      <section className="py-16 relative">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/placeholder.svg?height=1080&width=1920"
            alt="Mountain landscape"
            fill
            className="object-cover opacity-20"
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-3xl font-bold text-center mb-12">Destinasi Populer</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <DestinationCard
              image="/placeholder.svg?height=200&width=300"
              title="Pantai Kuta, Bali"
              rating={4.8}
              reviews={1240}
              category="Pantai"
              onClick={() => router.push("/tempat-wisata/1")}
            />
            <DestinationCard
              image="/placeholder.svg?height=200&width=300"
              title="Candi Borobudur, Magelang"
              rating={4.9}
              reviews={2100}
              category="Sejarah"
              onClick={() => router.push("/tempat-wisata/2")}
            />
            <DestinationCard
              image="/placeholder.svg?height=200&width=300"
              title="Kawah Putih, Bandung"
              rating={4.7}
              reviews={980}
              category="Alam"
              onClick={() => router.push("/tempat-wisata/3")}
            />
          </div>

          <div className="text-center mt-10">
            <Button variant="outline" size="lg" onClick={() => router.push("/explore")}>
              Lihat Lebih Banyak
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Cara Kerja</h2>

          <div className="grid md:grid-cols-4 gap-8">
            <StepCard
              number="1"
              title="Buat Akun"
              description="Daftar dan isi preferensi perjalanan Anda."
              onClick={() => router.push("/register")}
            />
            <StepCard
              number="2"
              title="Cari Destinasi"
              description="Temukan tempat wisata yang sesuai dengan keinginan Anda."
              onClick={() => router.push("/explore")}
            />
            <StepCard
              number="3"
              title="Buat Itinerary"
              description="Susun rencana perjalanan dengan mudah dan fleksibel."
              onClick={() => router.push("/itinerary-planner")}
            />
            <StepCard
              number="4"
              title="Jalan-Jalan!"
              description="Nikmati perjalanan dengan panduan dari JalanYuk."
              onClick={() => router.push("/demo-route")}
            />
          </div>
        </div>
      </section>

      {/* CTA Section with Background */}
      <section className="py-16 relative">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/placeholder.svg?height=1080&width=1920"
            alt="Beautiful beach sunset"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-blue-600/80"></div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl font-bold mb-6 text-white">Siap Memulai Petualangan?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-white">
            Daftar sekarang dan mulai rencanakan perjalanan impian Anda dengan JalanYuk.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              onClick={() => window.open("https://play.google.com/store/apps", "_blank")}
            >
              Unduh Aplikasi
            </Button>
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100"
              onClick={() => router.push("/register")}
            >
              Daftar Sekarang
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

// Component untuk Feature Card
function FeatureCard({ icon, title, description, onClick }) {
  return (
    <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer" onClick={onClick}>
      <CardContent className="pt-6">
        <div className="inline-flex items-center justify-center p-3 bg-blue-50 rounded-full mb-4">{icon}</div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
        <Button variant="outline" size="sm">
          Pelajari Lebih Lanjut
        </Button>
      </CardContent>
    </Card>
  )
}

// Component untuk Destination Card
function DestinationCard({ image, title, rating, reviews, category, onClick }) {
  return (
    <Card
      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer bg-white/90 backdrop-blur-sm"
      onClick={onClick}
    >
      <div className="relative h-48">
        <Image src={image || "/placeholder.svg"} alt={title} fill className="object-cover" />
        <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded text-sm font-medium">{category}</div>
      </div>
      <CardContent className="p-4">
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
          <span className="font-medium">{rating}</span>
          <span className="text-gray-500">({reviews} ulasan)</span>
        </div>
      </CardContent>
    </Card>
  )
}

// Component untuk Step Card
function StepCard({ number, title, description, onClick }) {
  return (
    <div className="text-center cursor-pointer" onClick={onClick}>
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white text-xl font-bold mb-4">
        {number}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <Button variant="link">Mulai Sekarang</Button>
    </div>
  )
}
