import { NextRequest, NextFetchEvent, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import logger from '@/lib/logger'

// Define protected routes and their required roles
const protectedRoutes: { [key: string]: string[] } = {
  '/api/users': ['admin'],
  '/api/services': ['admin', 'staff'],
  '/api/applications': ['admin', 'staff', 'citizen'],
  '/officer': ['admin'],
  '/staff': ['staff', 'admin'],
  '/user': ['citizen', 'staff', 'admin']
}

// Role hierarchy
const roleHierarchy: { [key: string]: number } = {
  'citizen': 1,
  'staff': 2,
  'admin': 3
}

// Check if user has required role
const hasRequiredRole = (userRole: string, requiredRoles: string[]): boolean => {
  const userRoleLevel = roleHierarchy[userRole] || 0
  
  return requiredRoles.some(role => roleHierarchy[role] <= userRoleLevel)
}

export async function middleware(request: NextRequest, event: NextFetchEvent) {
  const { pathname } = request.nextUrl
  
  // Check if this is a protected route
  const protectedRoute = Object.keys(protectedRoutes).find(route => 
    pathname.startsWith(route)
  )
  
  if (protectedRoute) {
    // Get user token
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    
    // If no token, redirect to sign in
    if (!token) {
      const url = new URL('/auth/signin', request.url)
      url.searchParams.set('callbackUrl', encodeURI(request.url))
      return NextResponse.redirect(url)
    }
    
    // Check if user has required role
    const requiredRoles = protectedRoutes[protectedRoute]
    if (!hasRequiredRole(token.role, requiredRoles)) {
      logger.warn(`Unauthorized access attempt by ${token.email} to ${pathname}`)
      return new NextResponse('Forbidden', { status: 403 })
    }
  }
  
  return NextResponse.next()
}

// Configure which paths to run middleware on
export const config = {
  matcher: [
    '/api/:path*',
    '/officer/:path*',
    '/staff/:path*',
    '/user/:path*'
  ]
}