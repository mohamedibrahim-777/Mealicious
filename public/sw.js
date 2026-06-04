// Mealicious push service worker
self.addEventListener('push', function (event) {
  if (!event.data) return
  let data = {}
  try { data = event.data.json() } catch { data = { title: 'Mealicious', body: event.data.text() } }

  const title = data.title || 'Mealicious Store'
  const options = {
    body: data.body || '',
    icon: data.icon || '/favicon.svg',
    badge: '/favicon.svg',
    data: { url: data.url || 'https://mealicious.store' },
    tag: data.tag || 'mealicious-notification',
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', function (event) {
  event.notification.close()
  const url = event.notification.data?.url || 'https://mealicious.store'
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(function (clients) {
      for (const client of clients) {
        if (client.url === url && 'focus' in client) return client.focus()
      }
      if (self.clients.openWindow) return self.clients.openWindow(url)
    })
  )
})
