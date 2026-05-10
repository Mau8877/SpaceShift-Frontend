importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js')

// NOTA: El Service Worker no puede leer import.meta.env — estos valores son públicos (no son secrets).
// Reemplaza VITE_FIREBASE_APP_ID con el valor real de tu Firebase Console.
firebase.initializeApp({
  apiKey: 'AIzaSyDNLz5dyZhflUMiZ7BxQakUZGnkj8Ld0E8',
  authDomain: 'spaceshift-87b19.firebaseapp.com',
  projectId: 'spaceshift-87b19',
  storageBucket: 'spaceshift-87b19.firebasestorage.app',
  messagingSenderId: '771831287139',
  appId: '1:771831287139:web:72aadc89432c545a669756',
})

const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title ?? 'SpaceShift'
  const body = payload.notification?.body ?? ''
  self.registration.showNotification(title, {
    body,
    icon: '/favicon.ico',
    data: payload.data ?? {},
  })
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const conversacionId = event.notification.data?.conversacionId
  const url = conversacionId ? `/?chat=${conversacionId}` : '/'
  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ('focus' in client) return client.focus()
        }
        return clients.openWindow(url)
      }),
  )
})
