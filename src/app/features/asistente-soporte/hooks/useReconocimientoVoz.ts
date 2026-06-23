import { useCallback, useEffect, useRef, useState } from "react"

// Tipado mínimo de la Web Speech API (no está en las libs estándar de TS).
interface SpeechAlternativeLike {
  readonly transcript: string
}
interface SpeechResultLike {
  readonly isFinal: boolean
  readonly 0: SpeechAlternativeLike
}
interface SpeechRecognitionEventLike {
  readonly results: ArrayLike<SpeechResultLike>
}
interface SpeechRecognitionLike {
  lang: string
  continuous: boolean
  interimResults: boolean
  start(): void
  stop(): void
  abort(): void
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onerror: (() => void) | null
  onend: (() => void) | null
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike

function getRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor
    webkitSpeechRecognition?: SpeechRecognitionCtor
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

interface UseReconocimientoVozOptions {
  /** Texto parcial/final mientras el usuario dicta. */
  onTranscript: (text: string) => void
  /** Se llama con la transcripción final cuando el usuario termina de hablar. */
  onFinal: (text: string) => void
}

/**
 * Wrapper de la Web Speech API (STT) en español. `supported` es false si el
 * navegador no la soporta (entonces no se muestra el botón de mic).
 */
export function useReconocimientoVoz({
  onTranscript,
  onFinal,
}: UseReconocimientoVozOptions) {
  const [supported, setSupported] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const ctorRef = useRef<SpeechRecognitionCtor | null>(null)

  // El soporte solo se conoce en cliente (evita mismatch de hidratación SSR).
  useEffect(() => {
    ctorRef.current = getRecognitionCtor()
    setSupported(ctorRef.current !== null)
  }, [])

  useEffect(() => {
    return () => recognitionRef.current?.abort()
  }, [])

  const toggleListen = useCallback(() => {
    const ctor = ctorRef.current
    if (!ctor) return

    if (isListening) {
      recognitionRef.current?.stop()
      return
    }

    const rec = new ctor()
    rec.lang = "es-ES"
    rec.continuous = false
    rec.interimResults = true

    rec.onresult = (event) => {
      let transcript = ""
      let isFinal = false
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i]
        transcript += result[0].transcript
        if (result.isFinal) isFinal = true
      }
      onTranscript(transcript)
      if (isFinal) {
        rec.stop()
        onFinal(transcript)
      }
    }

    rec.onerror = () => setIsListening(false)
    rec.onend = () => setIsListening(false)

    recognitionRef.current = rec
    setIsListening(true)
    rec.start()
  }, [isListening, onTranscript, onFinal])

  return { supported, isListening, toggleListen }
}
