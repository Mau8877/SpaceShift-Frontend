import { configureStore } from "@reduxjs/toolkit"
import { setupListeners } from "@reduxjs/toolkit/query"
import { api } from "./api/api"
import authReducer from "./authSlice"

export const store = configureStore({
  reducer: {
    // Estado de autenticación (Memoria)
    auth: authReducer,

    // API global (Sistema Nervioso)
    [api.reducerPath]: api.reducer,
  },

  // Middlewares (Logs, Toasts, Auto-refresh)
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Evita avisos molestos por datos complejos
    }).concat(api.middleware),

  devTools: import.meta.env.DEV, // Solo habilita Redux DevTools en desarrollo
})

// Listeners (Para que funcione el refetch al volver a la pestaña)
setupListeners(store.dispatch)

// --- TIPADO PARA TYPESCRIPT ---
// Esto es lo que permite que useAppSelector sepa qué datos hay en el store
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
