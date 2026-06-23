import type { AvatarOption } from "../types"

/** Avatares disponibles. Por ahora solo hay un modelo en public/assets. */
export const AVATAR_LIST: AvatarOption[] = [
  { id: "avatar", label: "Asistente", path: "/assets/avatar.glb", emoji: "🧑" },
]

/** Voz por defecto de Azure TTS (español de México, femenina). */
export const DEFAULT_VOICE = "es-MX-DaliaNeural"

// El system prompt del asistente vive ahora en el backend (AsistenteService),
// que es quien llama al LLM. Aquí ya no se necesita.
