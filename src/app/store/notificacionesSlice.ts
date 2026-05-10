import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface NotificacionItem {
  id: string
  title: string
  body: string
  type: string
  data: Record<string, string>
  receivedAt: string
  read: boolean
}

interface NotificacionesState {
  items: NotificacionItem[]
}

const initialState: NotificacionesState = {
  items: [],
}

export const notificacionesSlice = createSlice({
  name: 'notificaciones',
  initialState,
  reducers: {
    addNotificacion(state, action: PayloadAction<NotificacionItem>) {
      state.items.unshift(action.payload)
      // Limitar a las últimas 20 notificaciones
      if (state.items.length > 20) {
        state.items = state.items.slice(0, 20)
      }
    },
    markAsRead(state, action: PayloadAction<string>) {
      const item = state.items.find((n) => n.id === action.payload)
      if (item) item.read = true
    },
    markAllAsRead(state) {
      state.items.forEach((n) => {
        n.read = true
      })
    },
    clearAll(state) {
      state.items = []
    },
  },
})

export const { addNotificacion, markAsRead, markAllAsRead, clearAll } =
  notificacionesSlice.actions

export default notificacionesSlice.reducer
