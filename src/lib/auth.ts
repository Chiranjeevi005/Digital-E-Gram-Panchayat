import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcrypt'
import dbConnect from './dbConnect'
import User from '../models/User'
import logger from './logger'
import { JWT } from 'next-auth/jwt'
import { Session } from 'next-auth'

// Extend the User type to include our custom properties
interface ExtendedUser {
  id: string
  name: string
  email: string
  role: string
  provider?: string
}

// Extend the JWT type to include our custom properties
interface ExtendedJWT extends JWT {
  id: string
  name: string
  email: string
  role: string
  provider?: string
}

// Extend the Session type to include our custom properties
interface ExtendedSession extends Session {
  user: {
    id: string
    name: string
    email: string
    role: 'Citizens' | 'Staff' | 'Officer'
    image: string | null
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        role: { label: 'Role', type: 'text' }
      },
      async authorize(credentials) {
        // Validate input
        if (!credentials?.email || !credentials?.password || !credentials?.role) {
          console.log('Missing credentials:', { email: credentials?.email, role: credentials?.role })
          return null
        }

        try {
          // Connect to database
          await dbConnect()

          // Find user with role and local provider
          const user = await User.findOne({ 
            email: credentials.email,
            role: credentials.role,
            provider: 'local'
          }).select('+password')

          // Log the search attempt for debugging
          console.log('Searching for user:', { 
            email: credentials.email, 
            role: credentials.role,
            userFound: !!user 
          })

          // Check if user exists and password is valid
          if (user && user.password && await bcrypt.compare(credentials.password, user.password)) {
            // Check if account is deactivated
            if (user.isDeactivated) {
              console.log('User account is deactivated:', user.email)
              return null
            }
            
            console.log('User authenticated successfully:', { 
              id: user._id.toString(), 
              name: user.name, 
              email: user.email, 
              role: user.role 
            })
            
            return {
              id: user._id.toString(),
              name: user.name,
              email: user.email,
              role: user.role
            }
          } else {
            console.log('Authentication failed for user:', { 
              email: credentials.email, 
              role: credentials.role,
              userFound: !!user,
              passwordValid: user && user.password ? 'checked' : 'not checked'
            })
          }
        } catch (error: any) {
          logger.error('Authorization error:', error)
          console.error('Authorization error:', error)
        }
        
        return null
      }
    })
    // Removed GoogleProvider as requested
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Initial sign in
      if (user) {
        token.id = (user as ExtendedUser).id
        token.name = user.name
        token.email = user.email
        token.role = (user as ExtendedUser).role
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id
        session.user.name = token.name
        session.user.email = token.email
        session.user.role = token.role as 'Citizens' | 'Staff' | 'Officer'  // Exact role names as specified
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET
}

// Helper function to get session
export async function getSession() {
  // This would typically use getServerSession from next-auth
  // Implementation depends on your specific needs
  return null
}

// Helper function to check if user is authenticated
export async function isAuthenticated() {
  // This would typically check the session
  // Implementation depends on your specific needs
  return false
}

// Helper function to check user role
export async function hasRole(requiredRole: 'Citizens' | 'Staff' | 'Officer') {  // Exact role names as specified
  // This would typically check the session user's role
  // Implementation depends on your specific needs
  return false
}