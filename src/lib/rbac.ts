import { getServerSession } from 'next-auth'
import { authOptions } from './auth'

// Define role types that match our system
export type Role = 'Citizens' | 'Staff' | 'Officer'

// Check if user has required role
export const hasRole = (userRole: Role | undefined, requiredRole: Role): boolean => {
  // If user role is not defined, they don't have the required role
  if (!userRole) return false
  
  // Define role hierarchy (higher number means more privileges)
  const roleHierarchy: Record<Role, number> = {
    Citizens: 1,
    Staff: 2,
    Officer: 3
  }
  
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
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
    if (!hasRole(session.user?.role as Role | undefined, requiredRole)) {
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
  return (session?.user?.role as Role) || null
}