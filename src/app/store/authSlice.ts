import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface User {
  id: string
  email: string
  name: string
  role: string
}

interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  sessionId: string | null
}

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  sessionId: null,
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      { payload }: PayloadAction<{ 
        user: User
        access: string
        refresh: string
        session_id: string 
      }>
    ) => {
      state.user = payload.user
      state.token = payload.access
      state.refreshToken = payload.refresh
      state.sessionId = payload.session_id
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.refreshToken = null
      state.sessionId = null
    },
  },
})

export const { setCredentials, logout } = authSlice.actions
export default authSlice.reducer