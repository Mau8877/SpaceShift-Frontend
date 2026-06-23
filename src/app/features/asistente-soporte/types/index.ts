/** Un tramo de tiempo del audio asociado a una pose de boca (letra ARKit). */
export interface LipSyncCue {
  start: number
  end: number
  value: string // 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'X'
}

/** Resultado de sintetizar voz: audio reproducible + datos de lip-sync. */
export interface TtsResult {
  audioUrl: string
  lipSyncData: LipSyncCue[]
  duration: number
  /** Libera el blob URL del audio (llamar al terminar). */
  revoke: () => void
}

/** Una opción de avatar 3D seleccionable. */
export interface AvatarOption {
  id: string
  label: string
  path: string
  emoji: string
}

/** Mensaje en el formato que espera el endpoint de chat del LLM. */
export interface ChatMessage {
  role: "system" | "user" | "assistant"
  content: string
}
