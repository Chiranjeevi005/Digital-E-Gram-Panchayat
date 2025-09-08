import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Define role hierarchy
export const roles = {
  citizen: 1,
  staff: 2,
  admin: 3
} as const

export type Role = keyof typeof roles

// Check if user has required role
export const hasRole = (userRole: Role, requiredRole: Role): boolean => {
  return roles[userRole] >= roles[requiredRole]
}

// Middleware to protect routes based on roles
export const withRole = (requiredRole: Role) => {
  return async (req: Request) => {
    const session = await getServerSession(authOptions)
    
    // If no session, redirect to sign in
    if (!session) {
      return {
        redirect: {
          destination: '/auth/signin',
          permanent: false,
        },
      }
    }
    
    // Check if user has required role
    if (!hasRole(session.user.role as Role, requiredRole)) {
      return {
        redirect: {
          destination: '/', // Redirect to home page or unauthorized page
          permanent: false,
        },
      }
    }
    
    // User has required role
    return {
      props: {
        session,
      },
    }
  }
}

// Helper function to check if user is authenticated
export const isAuthenticated = async () => {
  const session = await getServerSession(authOptions)
  return !!session
}

// Helper function to get current user role
export const getCurrentUserRole = async (): Promise<Role | null> => {
  const session = await getServerSession(authOptions)
  return session?.user?.role as Role || null
}