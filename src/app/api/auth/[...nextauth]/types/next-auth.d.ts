import 'next-auth'
import 'next-auth/jwt'

// Extend the default session and user types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      role: string
      provider?: string
    }
  }

  interface User {
    id: string
    name: string
    email: string
    role: string
    provider?: string
    emailVerified?: Date | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    name: string
    email: string
    role: string
    provider?: string
  }
}