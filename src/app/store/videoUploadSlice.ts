import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import type { RootState } from "./redux"

export type VideoUploadPhase =
  | "subiendo"
  | "registrando"
  | "procesando"
  | "completado"
  | "error"

export interface VideoUploadItem {
  id: string // id local de la subida
  idPublicacion: string
  nombreArchivo: string
  phase: VideoUploadPhase
  progress: number // 0-100, solo durante la subida a S3
  idVideo?: string
  error?: string
}

interface VideoUploadState {
  items: VideoUploadItem[]
}

const initialState: VideoUploadState = {
  items: [],
}

const videoUploadSlice = createSlice({
  name: "videoUpload",
  initialState,
  reducers: {
    uploadStarted: (
      state,
      action: PayloadAction<{
        id: string
        idPublicacion: string
        nombreArchivo: string
      }>
    ) => {
      state.items.push({
        ...action.payload,
        phase: "subiendo",
        progress: 0,
      })
    },
    uploadProgress: (
      state,
      action: PayloadAction<{ id: string; progress: number }>
    ) => {
      const item = state.items.find((i) => i.id === action.payload.id)
      if (item) item.progress = action.payload.progress
    },
    uploadPhaseChanged: (
      state,
      action: PayloadAction<{
        id: string
        phase: VideoUploadPhase
        idVideo?: string
      }>
    ) => {
      const item = state.items.find((i) => i.id === action.payload.id)
      if (item) {
        item.phase = action.payload.phase
        if (action.payload.idVideo) item.idVideo = action.payload.idVideo
      }
    },
    uploadFailed: (
      state,
      action: PayloadAction<{ id: string; error: string }>
    ) => {
      const item = state.items.find((i) => i.id === action.payload.id)
      if (item) {
        item.phase = "error"
        item.error = action.payload.error
      }
    },
    uploadDismissed: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((i) => i.id !== action.payload)
    },
  },
})

export const {
  uploadStarted,
  uploadProgress,
  uploadPhaseChanged,
  uploadFailed,
  uploadDismissed,
} = videoUploadSlice.actions

export const selectVideoUploads = (state: RootState) => state.videoUpload.items

export default videoUploadSlice.reducer
