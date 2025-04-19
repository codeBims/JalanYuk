import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Tentang JalanYuk</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Visi Kami</h2>
          <p className="text-gray-700 mb-4">
            JalanYuk hadir untuk memudahkan wisatawan dalam merencanakan perjalanan mereka di Indonesia. Kami percaya
            bahwa perjalanan yang baik dimulai dari perencanaan yang matang.
          </p>
          <p className="text-gray-700">
            Visi kami adalah menjadi platform perencana perjalanan terpadu terbaik di Indonesia yang menghubungkan
            wisatawan dengan destinasi wisata menarik di seluruh nusantara.
          </p>
        </div>
        <div className="relative h-64 md:h-auto rounded-lg overflow-hidden">
          <Image src="/placeholder.svg?height=400&width=600" alt="JalanYuk Team" fill className="object-cover" />
        </div>
      </div>

      <h2 className="text-2xl font-semibold mb-4">Fitur Utama</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-2">Pencarian Tempat Wisata</h3>
            <p className="text-gray-700">
              Temukan tempat wisata berdasarkan kata kunci atau kategori tertentu dengan mudah.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-2">Itinerary Planner</h3>
            <p className="text-gray-700">
              Susun rencana perjalanan secara otomatis maupun manual dengan fitur drag and drop.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-2">Rekomendasi Berbasis AI</h3>
            <p className="text-gray-700">
              Dapatkan rekomendasi tempat wisata berdasarkan preferensi dan riwayat perjalanan Anda.
            </p>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-2xl font-semibold mb-4">Tim Kami</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        {[1, 2, 3, 4].map((member) => (
          <Card key={member}>
            <CardContent className="p-6 text-center">
              <div className="relative w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden">
                <Image
                  src={`/placeholder.svg?height=128&width=128`}
                  alt={`Team Member ${member}`}
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-lg font-semibold">Anggota Tim {member}</h3>
              <p className="text-gray-600">Posisi</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <h2 className="text-2xl font-semibold mb-4">Hubungi Kami</h2>
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-semibold mb-4">Informasi Kontak</h3>
              <p className="mb-2">
                <strong>Email:</strong> info@jalanyuk.com
              </p>
              <p className="mb-2">
                <strong>Telepon:</strong> +62 123 4567 890
              </p>
              <p className="mb-2">
                <strong>Alamat:</strong> Jl. Contoh No. 123, Jakarta, Indonesia
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-4">Ikuti Kami</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-blue-600 hover:text-blue-800">
                  Instagram
                </a>
                <a href="#" className="text-blue-600 hover:text-blue-800">
                  Twitter
                </a>
                <a href="#" className="text-blue-600 hover:text-blue-800">
                  Facebook
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Kirim Pesan</h3>
              <form className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nama
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Pesan
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Kirim Pesan
                </button>
              </form>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
