declare module "@auth/core/types" {
  interface Session {
    user?: User,
    error?: "RefreshAccessTokenError",
    accessToken: string,
    refreshToken: string,
  }
  interface User {
    role: string,
    email: string,
    id: number,
    accessToken: string,
    refreshToken: string,
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    access_token: string
    expires_at: number
    refresh_token: string
    error?: "RefreshAccessTokenError"
  }
}

export {}
