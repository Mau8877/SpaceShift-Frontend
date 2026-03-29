import type { TokenResponse } from "@/app/store"
import type { LoginRequest } from "../types"
import { api } from "@/app/store"

export const loginApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<TokenResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["Auth"],
    }),
  }),
  overrideExisting: false,
})

export const { useLoginMutation } = loginApi
