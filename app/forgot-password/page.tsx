"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import Image from "next/image"
import { AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react"
import { config } from "@/lib/config"
import { mockApi } from "@/lib/mock-api"

export default function ForgotPassword() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!email) {
      setError("Email harus diisi")
      setIsLoading(false)
      return
    }

    try {
      // Coba gunakan API asli terlebih dahulu
      try {
        const response = await fetch(`${config.apiBaseUrl}/auth/forgot-password`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ email }),
        })

        if (response.ok) {
          setIsSuccess(true)
          setIsLoading(false)
          return
        }
      } catch (apiError) {
        console.log("API asli tidak tersedia, menggunakan mock API")
      }

      // Jika API asli gagal, gunakan mock API
      const result = await mockApi.forgotPassword(email)

      if (result.success) {
        setIsSuccess(true)
      } else {
        setError(result.message || "Email tidak ditemukan")
      }
    } catch (err: any) {
      console.error("Error requesting password reset:", err)
      setError("Gagal mengirim permintaan reset password. Silakan coba lagi nanti.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative py-12">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/placeholder.svg?height=1080&width=1920"
          alt="Beautiful mountain landscape"
          fill
          className="object-cover brightness-50"
        />
      </div>

      {/* Content */}
      <div className="z-10 w-full max-w-md px-4">
        <Card className="backdrop-blur-sm bg-white/90">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Lupa Password</CardTitle>
            <CardDescription>Masukkan email Anda untuk menerima tautan reset password</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {isSuccess ? (
              <div>
                <Alert className="mb-4 bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-600">
                    Tautan reset password telah dikirim ke email Anda. Silakan periksa kotak masuk atau folder spam
                    Anda.
                  </AlertDescription>
                </Alert>
                <div className="mt-6 flex justify-center">
                  <Button onClick={() => router.push("/login")}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Kembali ke Halaman Login
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Memproses..." : "Kirim Tautan Reset"}
                </Button>
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    Ingat password Anda?{" "}
                    <Link href="/login" className="text-blue-600 hover:underline">
                      Masuk
                    </Link>
                  </p>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
