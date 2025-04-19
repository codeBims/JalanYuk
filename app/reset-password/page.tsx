"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import Image from "next/image"
import { AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react"
import { authService } from "@/services/api-service"

export default function ResetPassword() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [formData, setFormData] = useState({
    password: "",
    passwordConfirmation: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    // Check if token is provided
    if (!token) {
      setError("Token reset password tidak valid. Silakan coba lagi permintaan reset password.")
    }
  }, [token])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Validate passwords
    if (formData.password !== formData.passwordConfirmation) {
      setError("Password dan konfirmasi password tidak cocok")
      setIsLoading(false)
      return
    }

    if (formData.password.length < 8) {
      setError("Password harus minimal 8 karakter")
      setIsLoading(false)
      return
    }

    try {
      if (!token) {
        throw new Error("Token reset password tidak valid")
      }

      await authService.resetPassword(token, formData.password, formData.passwordConfirmation)
      setIsSuccess(true)
    } catch (err: any) {
      setError(err.message || "Gagal reset password. Silakan coba lagi.")
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
            <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
            <CardDescription>Buat password baru untuk akun Anda</CardDescription>
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
                    Password Anda telah berhasil direset. Silakan masuk dengan password baru Anda.
                  </AlertDescription>
                </Alert>
                <div className="mt-6 flex justify-center">
                  <Button onClick={() => router.push("/login")}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Pergi ke Halaman Login
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password Baru</Label>
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
                <div className="space-y-2">
                  <Label htmlFor="passwordConfirmation">Konfirmasi Password</Label>
                  <Input
                    id="passwordConfirmation"
                    name="passwordConfirmation"
                    type="password"
                    placeholder="••••••••"
                    value={formData.passwordConfirmation}
                    onChange={handleChange}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading || !token}>
                  {isLoading ? "Memproses..." : "Reset Password"}
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
