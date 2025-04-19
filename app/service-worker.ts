/// <reference lib="webworker" />

import { CacheableResponsePlugin } from "workbox-cacheable-response"
import { clientsClaim } from "workbox-core"
import { ExpirationPlugin } from "workbox-expiration"
import { precacheAndRoute } from "workbox-precaching"
import { registerRoute } from "workbox-routing"
import { CacheFirst, StaleWhileRevalidate } from "workbox-strategies"

declare const self: ServiceWorkerGlobalScope

// Mengklaim klien dan melewati fase menunggu
clientsClaim()

// Precache semua aset yang dihasilkan oleh webpack
precacheAndRoute(self.__WB_MANIFEST)

// Cache gambar dengan strategi Cache First
registerRoute(
  ({ request }) => request.destination === "image",
  new CacheFirst({
    cacheName: "images-cache",
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 hari
      }),
    ],
  }),
)

// Cache API dengan strategi Stale While Revalidate
registerRoute(
  ({ url }) => url.pathname.startsWith("/api/"),
  new StaleWhileRevalidate({
    cacheName: "api-cache",
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 24 * 60 * 60, // 1 hari
      }),
    ],
  }),
)

// Cache font dengan strategi Cache First
registerRoute(
  ({ request }) => request.destination === "font",
  new CacheFirst({
    cacheName: "fonts-cache",
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 60 * 60 * 24 * 365, // 1 tahun
      }),
    ],
  }),
)

// Menangani navigasi ke halaman yang belum di-cache
registerRoute(
  ({ request }) => request.mode === "navigate",
  async () => {
    try {
      // Coba ambil halaman dari jaringan
      return await fetch(new Request(self.location.origin))
    } catch (error) {
      // Jika gagal, tampilkan halaman offline
      return caches.match("/offline.html")
    }
  },
)

// Menangani pesan dari klien
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting()
  }
})

// Menangani notifikasi push
self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {}

  const options = {
    body: data.body || "Ada pembaruan dari JalanYuk!",
    icon: "/icon-192x192.png",
    badge: "/badge-96x96.png",
    data: {
      url: data.url || "/",
    },
  }

  event.waitUntil(self.registration.showNotification(data.title || "JalanYuk Notification", options))
})

// Menangani klik pada notifikasi
self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      const url = event.notification.data.url

      // Jika ada jendela yang sudah terbuka, fokuskan
      for (const client of clientList) {
        if (client.url === url && "focus" in client) {
          return client.focus()
        }
      }

      // Jika tidak ada jendela yang terbuka, buka yang baru
      if (clients.openWindow) {
        return clients.openWindow(url)
      }
    }),
  )
})
