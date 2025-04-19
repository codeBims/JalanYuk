"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import Image from "next/image"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { mockApi } from "@/lib/mock-api"

export default function Login() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, isLoading: authLoading } = useAuth()
  const registered = searchParams.get("registered") === "true"

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  // Pastikan fungsi handleSubmit menyimpan user dengan benar setelah login

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Coba gunakan API asli terlebih dahulu
      try {
        await login(formData.email, formData.password)
        router.push("/")
        return
      } catch (apiError) {
        console.log("API asli tidak tersedia, menggunakan mock API")
      }

      // Jika API asli gagal, gunakan mock API
      const result = await mockApi.login(formData.email, formData.password)

      if (result.success) {
        // Simpan user di localStorage untuk demo
        localStorage.setItem("jalanyuk_current_user", JSON.stringify(result.user))

        // Update auth context
        if (typeof window !== "undefined") {
          window.location.href = "/" // Hard refresh untuk memastikan context diperbarui
        } else {
          router.push("/")
        }
      } else {
        setError(result.message || "Login gagal. Periksa email dan password Anda.")
      }
    } catch (err: any) {
      console.error("Login error:", err)
      setError(err.message || "Login gagal. Silakan coba lagi.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/placeholder.svg?height=1080&width=1920"
          alt="Beautiful landscape"
          fill
          className="object-cover brightness-50"
        />
      </div>

      {/* Content */}
      <div className="z-10 w-full max-w-md px-4">
        <Card className="backdrop-blur-sm bg-white/90">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Masuk ke JalanYuk</CardTitle>
            {registered && (
              <CardDescription className="mt-2">
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Pendaftaran berhasil! Silakan masuk.</span>
                </div>
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="nama@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                    Lupa password?
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading || authLoading}>
                {isLoading || authLoading ? "Memproses..." : "Masuk"}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Belum punya akun?{" "}
                <Link href="/register" className="text-blue-600 hover:underline">
                  Daftar sekarang
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
