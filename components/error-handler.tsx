"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import { useRouter } from "next/navigation"

interface ErrorHandlerProps {
  error: Error
  reset: () => void
  children?: React.ReactNode
}

export default function ErrorHandler({ error, reset, children }: ErrorHandlerProps) {
  const router = useRouter()
  const [errorDetails, setErrorDetails] = useState<string | null>(null)

  useEffect(() => {
    // Log the error to the console in development
    if (process.env.NODE_ENV !== "production") {
      console.error("Application error:", error)
    }

    // Extract error details
    if (error.name === "ApiError") {
      setErrorDetails(`Status: ${(error as any).status || "Unknown"}`)
    }
  }, [error])

  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            <CardTitle>Terjadi Kesalahan</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 mb-4">{error.message || "Terjadi kesalahan yang tidak diketahui."}</p>

          {errorDetails && (
            <div className="bg-gray-100 p-3 rounded-md text-sm text-gray-700 font-mono">{errorDetails}</div>
          )}

          {children}
        </CardContent>
        <CardFooter className="flex gap-3">
          <Button onClick={() => reset()} className="flex-1">
            <RefreshCw className="mr-2 h-4 w-4" />
            Coba Lagi
          </Button>
          <Button variant="outline" onClick={() => router.push("/")} className="flex-1">
            <Home className="mr-2 h-4 w-4" />
            Kembali ke Beranda
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
