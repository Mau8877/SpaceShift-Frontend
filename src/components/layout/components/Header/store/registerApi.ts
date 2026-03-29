import type { TokenResponse } from "@/app/store"
import type { RegisterRequest } from "../types"
import { api } from "@/app/store"

export const registerApi = api.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<TokenResponse, RegisterRequest>({
      query: (userData) => ({
        url: "/auth/registro",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ["Auth"],
    }),
  }),
  overrideExisting: false,
})

export const { useRegisterMutation } = registerApi
