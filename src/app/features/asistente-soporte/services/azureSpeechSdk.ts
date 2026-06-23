// A diferencia de Angular CLI (donde el builder no resolvía el export del SDK y
// había que cargar un bundle vía <script>), Vite resuelve el paquete npm como ESM
// directamente. Importamos perezosamente para que el SDK (que usa Web Workers/wasm)
// nunca se evalúe en el servidor (SSR de Nitro): este módulo solo se carga dentro
// del widget client-only.
//
// Si en algún momento Vite falla al pre-bundlear el SDK, añadir en vite.config.ts:
//   optimizeDeps: { exclude: ["microsoft-cognitiveservices-speech-sdk"] }

import type * as SpeechSdkTypes from "microsoft-cognitiveservices-speech-sdk"

let cached: typeof SpeechSdkTypes | null = null

/** Carga perezosa del Azure Speech SDK (import dinámico ESM). */
export async function loadSpeechSdk(): Promise<typeof SpeechSdkTypes> {
  if (cached) return cached
  cached = await import("microsoft-cognitiveservices-speech-sdk")
  return cached
}
