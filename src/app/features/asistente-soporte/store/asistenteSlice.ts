import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import { AVATAR_LIST } from "../config/asistente.config"
import type { AvatarOption, LipSyncCue } from "../types"

interface AsistenteState {
  /** Si la burbuja flotante está abierta. */
  isOpen: boolean
  /** True mientras se reproduce el audio (avatar hablando). */
  isSpeaking: boolean
  /** True mientras se espera la respuesta del LLM. */
  isThinking: boolean
  /** Último texto de respuesta del asistente. */
  aiResponseText: string
  /** Cues de lip-sync para el audio actual (null si no hay). */
  lipSyncData: LipSyncCue[] | null
  /** Avatar seleccionado. */
  selectedAvatar: AvatarOption
}

const initialState: AsistenteState = {
  isOpen: false,
  isSpeaking: false,
  isThinking: false,
  aiResponseText: "",
  lipSyncData: null,
  selectedAvatar: AVATAR_LIST[0],
}

export const asistenteSlice = createSlice({
  name: "asistente",
  initialState,
  reducers: {
    setOpen: (state, action: PayloadAction<boolean>) => {
      state.isOpen = action.payload
    },
    toggleOpen: (state) => {
      state.isOpen = !state.isOpen
    },
    setSpeaking: (state, action: PayloadAction<boolean>) => {
      state.isSpeaking = action.payload
    },
    setThinking: (state, action: PayloadAction<boolean>) => {
      state.isThinking = action.payload
    },
    setResponse: (state, action: PayloadAction<string>) => {
      state.aiResponseText = action.payload
    },
    setLipSync: (state, action: PayloadAction<LipSyncCue[] | null>) => {
      state.lipSyncData = action.payload
    },
    selectAvatar: (state, action: PayloadAction<AvatarOption>) => {
      state.selectedAvatar = action.payload
    },
    clearResponse: (state) => {
      state.aiResponseText = ""
    },
  },
})

export const {
  setOpen,
  toggleOpen,
  setSpeaking,
  setThinking,
  setResponse,
  setLipSync,
  selectAvatar,
  clearResponse,
} = asistenteSlice.actions
export default asistenteSlice.reducer
