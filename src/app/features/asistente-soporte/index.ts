// Asistente de soporte: avatar 3D parlante (lip-sync) que responde por texto o voz.
//
// NOTA DE SEGURIDAD: los servicios LLM (OpenRouter) y TTS (Azure) se llaman desde
// el navegador con las API keys en el bundle del cliente (VITE_*). Para producción
// conviene proxyar estas llamadas vía el backend o un route handler de Nitro.
//
// El widget es client-only (importa three.js / Web Speech API): montarlo siempre
// dentro de <ClientOnly> de @tanstack/react-router (ver src/routes/__root.tsx).

export { AsistenteFlotante } from "./components/AsistenteFlotante"
export { default as asistenteReducer } from "./store/asistenteSlice"
export type { AvatarOption, ChatMessage, LipSyncCue, TtsResult } from "./types"
