import { useEffect, useRef, useState, useCallback } from "react"
import { Client, IMessage, StompConfig } from "@stomp/stompjs"
import Cookies from "js-cookie"

interface UseChatSocketProps {
  onMessageReceived: (message: any) => void
  enabled?: boolean
  topics?: string[]
}

export function useChatSocket({ onMessageReceived, enabled = true, topics = [] }: UseChatSocketProps) {
  const [isConnected, setIsConnected] = useState(false)
  const clientRef = useRef<Client | null>(null)
  const onMessageReceivedRef = useRef(onMessageReceived)
  const subscriptionsRef = useRef<Map<string, any>>(new Map())

  // FIX 1: Ref para topics — onConnect lee siempre el valor más reciente (evita stale closure)
  const topicsRef = useRef<string[]>(topics)

  // FIX 2: String estable — evita que el useEffect de suscripciones corra en cada render
  const topicsKey = topics.join(",")

  // Actualizar refs en cada render
  useEffect(() => {
    onMessageReceivedRef.current = onMessageReceived
  }, [onMessageReceived])

  useEffect(() => {
    topicsRef.current = topics
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicsKey])

  const connect = useCallback(() => {
    if (clientRef.current?.active) return

    const token = Cookies.get("token")
    if (!token) {
      console.warn("[STOMP] No token found, skipping connection.")
      return
    }

    const brokerURL = import.meta.env.VITE_WS_URL || "ws://localhost:8081/ws-chat"

    const config: StompConfig = {
      brokerURL,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: (str) => {
        if (import.meta.env.DEV) console.log(`[STOMP] ${str}`)
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.info("[STOMP] Connected to broker")
        setIsConnected(true)

        subscriptionsRef.current.clear()

        // Cola privada del usuario
        const sub = clientRef.current?.subscribe("/user/queue/messages", (message: IMessage) => {
          try {
            const body = JSON.parse(message.body)
            onMessageReceivedRef.current(body)
          } catch (err) {
            console.error("[STOMP] Error parsing message body:", err)
          }
        })
        if (sub) subscriptionsRef.current.set("/user/queue/messages", sub)

        // FIX 1 aplicado: lee topicsRef.current en vez del closure inicial (que siempre era [])
        topicsRef.current.forEach(topic => {
          if (!subscriptionsRef.current.has(topic)) {
            const s = clientRef.current?.subscribe(topic, (message: IMessage) => {
              try {
                const body = JSON.parse(message.body)
                onMessageReceivedRef.current(body)
              } catch (err) {
                console.error("[STOMP] Error parsing message body:", err)
              }
            })
            if (s) subscriptionsRef.current.set(topic, s)
          }
        })
      },
      onStompError: (frame) => {
        console.error("[STOMP] Broker reported error: " + frame.headers["message"])
        console.error("[STOMP] Additional details: " + frame.body)
      },
      onDisconnect: () => {
        console.info("[STOMP] Disconnected")
        setIsConnected(false)
      },
    }

    const client = new Client(config)
    client.activate()
    clientRef.current = client
  }, []) // Sin dependencias — el ref siempre tiene el valor actual

  const disconnect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.deactivate()
      clientRef.current = null
      setIsConnected(false)
    }
  }, [])

  const sendMessage = useCallback((destination: string, body: any) => {
    if (clientRef.current && clientRef.current.connected) {
      clientRef.current.publish({
        destination,
        body: JSON.stringify(body),
      })
    } else {
      console.warn("[STOMP] Cannot send message: not connected.")
    }
  }, [])

  useEffect(() => {
    if (enabled) {
      connect()
    } else {
      disconnect()
    }

    return () => {
      disconnect()
    }
  }, [enabled, connect, disconnect])

  // FIX 2 aplicado: topicsKey (string) en vez de topics (array nuevo cada render)
  // Esto evita el loop infinito de suscripciones/desuscripciones
  useEffect(() => {
    if (!isConnected || !clientRef.current?.connected) return

    const currentTopics = topicsRef.current

    // Desuscribir tópicos que ya no están en la lista
    subscriptionsRef.current.forEach((sub, topic) => {
      if (topic !== "/user/queue/messages" && !currentTopics.includes(topic)) {
        sub.unsubscribe()
        subscriptionsRef.current.delete(topic)
        if (import.meta.env.DEV) console.log(`[STOMP] Unsubscribed from ${topic}`)
      }
    })

    // Suscribir nuevos tópicos
    currentTopics.forEach(topic => {
      if (!subscriptionsRef.current.has(topic)) {
        const sub = clientRef.current?.subscribe(topic, (message: IMessage) => {
          try {
            const body = JSON.parse(message.body)
            onMessageReceivedRef.current(body)
          } catch (err) {
            console.error("[STOMP] Error parsing message body:", err)
          }
        })
        if (sub) {
          subscriptionsRef.current.set(topic, sub)
          if (import.meta.env.DEV) console.log(`[STOMP] Subscribed to ${topic}`)
        }
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicsKey, isConnected])

  return {
    isConnected,
    sendMessage,
  }
}
