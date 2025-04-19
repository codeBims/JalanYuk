"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bell, Calendar, MapPin, Info, X } from "lucide-react"

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "reminder",
      title: "Perjalanan ke Bali",
      message: "Perjalanan Anda ke Bali akan dimulai besok. Jangan lupa untuk memeriksa itinerary Anda.",
      date: "2023-06-14T08:00:00",
      read: false,
    },
    {
      id: 2,
      type: "recommendation",
      title: "Rekomendasi Baru",
      message: "Kami memiliki beberapa rekomendasi tempat wisata baru berdasarkan preferensi Anda.",
      date: "2023-06-13T14:30:00",
      read: false,
    },
    {
      id: 3,
      type: "info",
      title: "Pembaruan Aplikasi",
      message: "JalanYuk telah diperbarui ke versi terbaru dengan fitur-fitur baru yang menarik.",
      date: "2023-06-12T10:15:00",
      read: true,
    },
    {
      id: 4,
      type: "reminder",
      title: "Ulasan Tempat Wisata",
      message: "Bagaimana pengalaman Anda di Pantai Kuta? Berikan ulasan untuk membantu wisatawan lain.",
      date: "2023-06-11T16:45:00",
      read: true,
    },
  ])

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const markAsRead = (id) => {
    setNotifications(
      notifications.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  const deleteNotification = (id) => {
    setNotifications(notifications.filter((notification) => notification.id !== id))
  }

  const getIcon = (type) => {
    switch (type) {
      case "reminder":
        return <Calendar className="h-5 w-5 text-blue-600" />
      case "recommendation":
        return <MapPin className="h-5 w-5 text-green-600" />
      case "info":
        return <Info className="h-5 w-5 text-amber-600" />
      default:
        return <Bell className="h-5 w-5 text-gray-600" />
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Notifikasi</h1>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Tidak Ada Notifikasi</h3>
            <p className="text-gray-600">Anda tidak memiliki notifikasi saat ini.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card key={notification.id} className={notification.read ? "opacity-75" : ""}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">{getIcon(notification.type)}</div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold">{notification.title}</h3>
                        <p className="text-sm text-gray-500">{formatDate(notification.date)}</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => deleteNotification(notification.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="mt-2 text-gray-700">{notification.message}</p>
                    {!notification.read && (
                      <div className="mt-3">
                        <Button variant="outline" size="sm" onClick={() => markAsRead(notification.id)}>
                          Tandai Sudah Dibaca
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
