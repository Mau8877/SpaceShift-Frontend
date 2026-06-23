import { Suspense, lazy, useCallback, useEffect, useRef, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { CustomerSupportIcon, Cancel01Icon } from "@hugeicons/core-free-icons"
import { useAppDispatch, useAppSelector } from "@/app/store/hooks"
import { Button } from "@/components/ui/button"
import { ChatAsistente } from "./ChatAsistente"
import { ask } from "../services/llm.service"
import { synthesizeSpeech } from "../services/tts.service"
import {
  clearResponse,
  setLipSync,
  setOpen,
  setResponse,
  setSpeaking,
  setThinking,
} from "../store/asistenteSlice"

// El componente 3D importa `three` (pesado y solo-navegador): carga diferida.
const Avatar3D = lazy(() => import("./Avatar3D"))

/** Limpia markdown/emojis del texto, que se leerá en voz alta. */
function sanitizeText(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/gs, "$1")
    .replace(/\*(.+?)\*/gs, "$1")
    .replace(/#{1,6}\s*/g, "")
    .replace(/\p{Extended_Pictographic}/gu, "")
    .replace(/[\u{FE00}-\u{FE0F}]/gu, "")
    .replace(/\s{2,}/g, " ")
    .trim()
}

export function AsistenteFlotante() {
  const dispatch = useAppDispatch()
  const { isOpen, isThinking, aiResponseText, lipSyncData, selectedAvatar } =
    useAppSelector((s) => s.asistente)

  // El audio y su blob URL no son serializables → se manejan con refs locales.
  const [audioEl, setAudioEl] = useState<HTMLAudioElement | null>(null)
  const revokeRef = useRef<(() => void) | null>(null)

  const cleanupAudio = useCallback(() => {
    setAudioEl((prev) => {
      if (prev) {
        prev.pause()
        prev.onended = null
      }
      return null
    })
    revokeRef.current?.()
    revokeRef.current = null
    dispatch(setLipSync(null))
  }, [dispatch])

  // Al desmontar, detener audio y liberar el blob URL.
  useEffect(() => cleanupAudio, [cleanupAudio])

  const handleAsk = useCallback(
    async (question: string) => {
      cleanupAudio()
      dispatch(clearResponse())
      dispatch(setThinking(true))

      try {
        const responseText = await ask(question)
        dispatch(setResponse(responseText))
        dispatch(setThinking(false))

        const clean = sanitizeText(responseText)
        if (!clean) return

        const result = await synthesizeSpeech(clean)
        revokeRef.current = result.revoke
        dispatch(setLipSync(result.lipSyncData))

        const audio = new Audio(result.audioUrl)
        audio.onended = () => dispatch(setSpeaking(false))
        setAudioEl(audio)
        await audio.play()
        dispatch(setSpeaking(true))
      } catch (err) {
        console.error("[Asistente] Error:", err)
        dispatch(setThinking(false))
        dispatch(setSpeaking(false))
      }
    },
    [cleanupAudio, dispatch],
  )

  const handleClose = useCallback(() => {
    cleanupAudio()
    dispatch(setSpeaking(false))
    dispatch(setOpen(false))
  }, [cleanupAudio, dispatch])

  const cleaned = sanitizeText(aiResponseText)
  const showResponse = !!aiResponseText || isThinking

  // Botón flotante cuando está cerrado.
  if (!isOpen) {
    return (
      <Button
        type="button"
        size="icon"
        onClick={() => dispatch(setOpen(true))}
        aria-label="Abrir asistente de soporte"
        className="fixed bottom-4 right-4 z-50 size-14 rounded-full shadow-lg"
      >
        <HugeiconsIcon icon={CustomerSupportIcon} strokeWidth={2} className="size-7" />
      </Button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex w-80 flex-col gap-2">
      {/* Botón cerrar flotante (sólido, siempre visible) */}
      <Button
        type="button"
        size="icon"
        onClick={handleClose}
        aria-label="Cerrar asistente"
        className="absolute right-1 top-1 z-20 size-7 rounded-full shadow-md"
      >
        <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
      </Button>

      {/* Burbuja de chat: aparece justo arriba de la cabeza del avatar */}
      {showResponse && (
        <div className="relative z-10 mx-auto -mb-14 max-h-32 max-w-[85%] overflow-y-auto rounded-2xl border bg-background px-3 py-2 text-sm text-foreground shadow-lg">
          {isThinking ? (
            <span className="inline-flex gap-1">
              <span className="animate-pulse">Pensando</span>
              <span className="animate-pulse">…</span>
            </span>
          ) : (
            cleaned
          )}
          {/* Colita de la burbuja apuntando hacia el avatar */}
          <span className="absolute -bottom-1.5 left-1/2 size-3 -translate-x-1/2 rotate-45 border-b border-r bg-background" />
        </div>
      )}

      {/* Avatar 3D — transparente, sin caja ni fondo */}
      <div className="h-72 w-full">
        <Suspense fallback={null}>
          <Avatar3D
            avatarPath={selectedAvatar.path}
            audioEl={audioEl}
            lipSyncData={lipSyncData}
          />
        </Suspense>
      </div>

      {/* Tarjeta de chat: input */}
      <div className="rounded-2xl border bg-background p-3 shadow-lg">
        <ChatAsistente onAsk={handleAsk} isThinking={isThinking} />
      </div>
    </div>
  )
}

export default AsistenteFlotante
