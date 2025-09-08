import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import bcrypt from 'bcrypt'
import dbConnect from './dbConnect'
import User from '@/models/User'
import logger from '@/lib/logger'
import { rateLimit, resetRateLimit } from '@/lib/rateLimiter'

// Extend the User type to include our custom properties
interface ExtendedUser extends Record<string, any> {
  id: string
  name: string
  email: string
  role: string
  provider?: string
  emailVerified?: Date | null
  phone?: string
  address?: string
  district?: string
  state?: string
  pincode?: string
}

// Extend the JWT type to include our custom properties
interface ExtendedJWT extends Record<string, any> {
  id: string
  name: string
  email: string
  role: string
  provider?: string
  phone?: string
  address?: string
  district?: string
  state?: string
  pincode?: string
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
      async authorize(credentials, req) {
        // Validate input
        if (!credentials?.email || !credentials?.password || !credentials?.role) {
          throw new Error('Missing credentials')
        }

        try {
          // Apply rate limiting
          const { allowed, resetTime } = rateLimit(req as any)
          if (!allowed) {
            throw new Error(`Too many failed attempts. Try again later.`)
          }

          // Connect to database
          await dbConnect()

          // Find user with role and local provider
          const user = await User.findOne({ 
            email: credentials.email,
            role: credentials.role,
            provider: 'local'
          }).select('+password')

          // Check if user exists
          if (!user) {
            throw new Error('Invalid credentials')
          }

          // Check if account is deactivated
          if (user.isDeactivated) {
            throw new Error('Account is deactivated')
          }

          // Validate password
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password || ''
          )

          if (!isPasswordValid) {
            throw new Error('Invalid credentials')
          }

          // Reset rate limit on successful login
          resetRateLimit(req as any)

          // Return user object with proper typing
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role
          } as ExtendedUser
        } catch (error: any) {
          logger.error('Authorization error:', error)
          throw error
        }
      }
    }),
    // Google Provider - only for citizens
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      profile(profile) {
        return {
          id: profile.sub,
          name: `${profile.given_name} ${profile.family_name}`,
          email: profile.email,
          role: 'citizen', // Force role to citizen for Google sign-ins
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account }: { token: ExtendedJWT; user?: ExtendedUser; account?: any }) {
      console.log('JWT callback called with:', { token, user, account }) // Debug log
      // Initial sign in
      if (user) {
        token.id = user.id
        token.name = user.name
        token.email = user.email
        token.role = user.role
        // Only set provider for Google sign-ins
        if (account?.provider === 'google') {
          token.provider = 'google'
        }
      
        // For Google sign-ins, we need to check if user exists in our database
        if (account?.provider === 'google') {
          try {
            await dbConnect()
          
            // Check if user already exists
            let existingUser = await User.findOne({ 
              email: user.email,
              provider: 'google'
            })
          
            console.log('Existing Google user found:', existingUser) // Debug log
          
            if (!existingUser) {
              // Create new user with Google details
              existingUser = new User({
                name: user.name,
                email: user.email,
                password: null, // No password for Google accounts
                role: 'citizen', // Force role to citizen
                provider: 'google',
                emailVerified: new Date() // Google accounts are verified by default
              })
              await existingUser.save()
              console.log('New Google user created:', existingUser) // Debug log
            }
          
            // Update token with user details from database
            token.id = existingUser._id.toString()
            token.name = existingUser.name || user.name // Fallback to Google name if database name is empty
            token.role = existingUser.role
            // Include profile information in the token
            token.phone = existingUser.phone
            token.address = existingUser.address
            token.district = existingUser.district
            token.state = existingUser.state
            token.pincode = existingUser.pincode
            console.log('Token updated with user data:', token) // Debug log
          } catch (error: any) {
            logger.error('Error during Google sign-in:', error)
            console.error('Error during Google sign-in:', error) // Debug log
            // Don't throw error here as it will break the auth flow
            // Instead, log it and continue
          }
        }
      } else {
        // For subsequent requests, fetch updated profile information
        try {
          await dbConnect()
          const user = await User.findById(token.id).select('name phone address district state pincode role')
          if (user) {
            token.name = user.name
            token.role = user.role
            token.phone = user.phone
            token.address = user.address
            token.district = user.district
            token.state = user.state
            token.pincode = user.pincode
          }
        } catch (error) {
          console.error('Error fetching user data for token:', error)
        }
      }
      console.log('JWT callback returning token:', token) // Debug log
      return token
    },
    async session({ session, token }: { session: any; token: ExtendedJWT }) {
      console.log('Session callback called with:', { session, token }) // Debug log
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.name = token.name as string
        session.user.email = token.email as string
        session.user.role = token.role as 'admin' | 'staff' | 'citizen' | 'user'
        // Include profile information in the session
        if (token.phone !== undefined) (session.user as any).phone = token.phone
        if (token.address !== undefined) (session.user as any).address = token.address
        if (token.district !== undefined) (session.user as any).district = token.district
        if (token.state !== undefined) (session.user as any).state = token.state
        if (token.pincode !== undefined) (session.user as any).pincode = token.pincode
        // Only set provider if it exists in the token
        if (token.provider) {
          (session.user as any).provider = token.provider as 'local' | 'google'
        }
      }
      console.log('Session callback returning session:', session) // Debug log
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
  secret: process.env.NEXTAUTH_SECRET,
  // Prevent Admin/Staff from logging in via Google
  events: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        // Ensure only citizens can sign in with Google
        if ((user as ExtendedUser).role !== 'citizen') {
          throw new Error('Only citizens can sign in with Google')
        }
      }
    }
  }
}