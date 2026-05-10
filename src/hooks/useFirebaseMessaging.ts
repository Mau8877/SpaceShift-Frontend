import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import { addNotificacion } from '@/app/store/notificacionesSlice'
import { firebaseApp } from '@/lib/firebase'

export function useFirebaseMessaging() {
  const dispatch = useAppDispatch()
  const { isAuthenticated, token } = useAppSelector((state) => state.auth)

  useEffect(() => {
    if (!isAuthenticated || !token || !firebaseApp) return

    let unsubscribe: (() => void) | undefined

    const setup = async () => {
      try {
        if (!('Notification' in window)) return
        const permission = await Notification.requestPermission()
        if (permission !== 'granted') return

        const { getMessaging, getToken, onMessage } = await import('firebase/messaging')
        const messaging = getMessaging(firebaseApp)

        const fcmToken = await getToken(messaging, {
          vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
          serviceWorkerRegistration: await navigator.serviceWorker.register(
            '/firebase-messaging-sw.js',
          ),
        })

        if (fcmToken) {
          await fetch(
            `${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8081/api'}/notificaciones/token`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ tokenFcm: fcmToken, plataforma: 'WEB' }),
            },
          )
        }

        unsubscribe = onMessage(messaging, (payload) => {
          const title = payload.notification?.title ?? 'SpaceShift'
          const body = payload.notification?.body ?? ''

          dispatch(
            addNotificacion({
              id: crypto.randomUUID(),
              title,
              body,
              type: payload.data?.type ?? '',
              data: (payload.data as Record<string, string>) ?? {},
              receivedAt: new Date().toISOString(),
              read: false,
            }),
          )
        })
      } catch (err) {
        console.error('[FCM] Error durante setup:', err)
      }
    }

    setup()
    return () => unsubscribe?.()
  }, [isAuthenticated, token, dispatch])
}
