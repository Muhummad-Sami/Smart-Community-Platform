self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('smart-comm-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/manifest.json',
        '/icon-192x192.png',
        '/icon-512x512.png',
      ])
    })
  )
})

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request)
    })
  )
})

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {}
  const title = data.title || 'New Notification'
  const options = {
    body: data.body || 'You have a new update.',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    data: data.url || '/'
  }

  event.waitUntil(
    self.registration.showNotification(title, options)
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    clients.openWindow(event.notification.data)
  )
})
