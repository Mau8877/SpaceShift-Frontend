import { loadSpeechSdk } from "./azureSpeechSdk"
import { AZURE_TO_ARKIT } from "../lib/visemeMapping"
import { DEFAULT_VOICE } from "../config/asistente.config"
import type { LipSyncCue, TtsResult } from "../types"

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081/api"

/** Pide al backend un token efímero de Azure (la key vive solo en el servidor). */
async function fetchSpeechToken(): Promise<{ token: string; region: string }> {
  const r = await fetch(`${API_BASE}/asistente/speech-token`)
  if (!r.ok) throw new Error(`No se pudo obtener el token de voz (${r.status})`)
  return r.json()
}

/**
 * Sintetiza `text` con Azure TTS y captura los visemes para el lip-sync.
 * Devuelve el audio como blob URL (no se reproduce por el SDK) y los cues.
 */
export async function synthesizeSpeech(
  text: string,
  voiceName = DEFAULT_VOICE,
): Promise<TtsResult> {
  const sdk = await loadSpeechSdk()
  const { token, region } = await fetchSpeechToken()
  const speechConfig = sdk.SpeechConfig.fromAuthorizationToken(token, region)
  speechConfig.speechSynthesisVoiceName = voiceName
  speechConfig.speechSynthesisOutputFormat =
    sdk.SpeechSynthesisOutputFormat.Audio24Khz48KBitRateMonoMp3

  // null → el audio queda en result.audioData (no se reproduce por el altavoz del SDK).
  const synthesizer = new sdk.SpeechSynthesizer(
    speechConfig,
    null as unknown as InstanceType<typeof sdk.AudioConfig>,
  )

  const rawVisemes: { audioOffset: number; visemeId: number }[] = []
  synthesizer.visemeReceived = (_s, e) => {
    rawVisemes.push({
      audioOffset: e.audioOffset / 10_000_000,
      visemeId: e.visemeId,
    })
  }

  return new Promise<TtsResult>((resolve, reject) => {
    synthesizer.speakTextAsync(
      text,
      (result) => {
        synthesizer.close()
        if (result.reason !== sdk.ResultReason.SynthesizingAudioCompleted) {
          reject(new Error(`Azure TTS error: ${result.errorDetails}`))
          return
        }

        const totalDuration = result.audioDuration / 10_000_000
        const lipSyncData = convertVisemes(rawVisemes, totalDuration)
        const blob = new Blob([result.audioData], { type: "audio/mp3" })
        const audioUrl = URL.createObjectURL(blob)

        resolve({
          audioUrl,
          lipSyncData,
          duration: totalDuration,
          revoke: () => URL.revokeObjectURL(audioUrl),
        })
      },
      (error) => {
        synthesizer.close()
        reject(error)
      },
    )
  })
}

/** Cada cue va desde su offset hasta el offset del siguiente (el último hasta el final). */
function convertVisemes(
  visemes: { audioOffset: number; visemeId: number }[],
  totalDuration: number,
): LipSyncCue[] {
  return visemes.map((v, i, arr) => ({
    start: v.audioOffset,
    end: arr[i + 1]?.audioOffset ?? totalDuration,
    value: AZURE_TO_ARKIT[v.visemeId] ?? "X",
  }))
}
