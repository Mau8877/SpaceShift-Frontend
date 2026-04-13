import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"

interface ChatUiState {
  isChatOpen: boolean
  activeConversacionId: string | null
  /** Map de userId -> true si está online */
  onlineUsers: Record<string, boolean>
  /** Map de conversacionId -> true si el otro usuario está escribiendo */
  typingUsers: Record<string, boolean>
}

const initialState: ChatUiState = {
  isChatOpen: false,
  activeConversacionId: null,
  onlineUsers: {},
  typingUsers: {},
}

export const chatUiSlice = createSlice({
  name: "chatUi",
  initialState,
  reducers: {
    setChatOpen: (state, action: PayloadAction<boolean>) => {
      state.isChatOpen = action.payload
    },
    openChatWithConversation: (state, action: PayloadAction<string>) => {
      state.isChatOpen = true
      state.activeConversacionId = action.payload
    },
    setActiveConversation: (state, action: PayloadAction<string | null>) => {
      state.activeConversacionId = action.payload
    },
    setUserOnline: (state, action: PayloadAction<{ userId: string; online: boolean }>) => {
      state.onlineUsers[action.payload.userId] = action.payload.online
    },
    setTyping: (state, action: PayloadAction<{ conversacionId: string; isTyping: boolean }>) => {
      state.typingUsers[action.payload.conversacionId] = action.payload.isTyping
    },
  },
})

export const {
  setChatOpen,
  openChatWithConversation,
  setActiveConversation,
  setUserOnline,
  setTyping,
} = chatUiSlice.actions
export default chatUiSlice.reducer
