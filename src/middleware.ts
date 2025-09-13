import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define CORS allowlist - in production, replace with your actual frontend domain
const CORS_ALLOWLIST = [
  'http://localhost:3000',
  'https://your-vercel-app.vercel.app',
  'https://your-api-domain.onrender.com',
  'https://digital-e-gram-panchayat-ao60.onrender.com'
]

// Define CSP policy for production (includes upgrade-insecure-requests)
const CSP_POLICY_PROD = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' data: https:;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://*.mongodb.net ws: wss:;
  frame-ancestors 'none';
  upgrade-insecure-requests;
`.replace(/\s{2,}/g, ' ').trim()

// Define CSP policy for development (without upgrade-insecure-requests)
const CSP_POLICY_DEV = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' data: https:;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://*.mongodb.net ws: wss:;
  frame-ancestors 'none';
`.replace(/\s{2,}/g, ' ').trim()

export default withAuth(
  function middleware(request) {  // Remove explicit typing to allow TypeScript to infer the correct type
    const token = request.nextauth.token
    const { pathname } = request.nextUrl
    
    // Add security headers
    const response = NextResponse.next()
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    
    // Only set HSTS and use production CSP in production
    if (process.env.NODE_ENV === 'production') {
      response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
      response.headers.set('Content-Security-Policy', CSP_POLICY_PROD)
    } else {
      // Use development CSP policy without upgrade-insecure-requests
      response.headers.set('Content-Security-Policy', CSP_POLICY_DEV)
    }
    
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')
    
    // Handle CORS for API routes
    const origin = request.headers.get('origin')
    if (origin && CORS_ALLOWLIST.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin)
    }
    
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      const headers: Record<string, string> = {
        'Access-Control-Allow-Origin': origin || '',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true',
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
      }
      
      // Only add production headers in production
      if (process.env.NODE_ENV === 'production') {
        headers['Strict-Transport-Security'] = 'max-age=63072000; includeSubDomains; preload'
        headers['Content-Security-Policy'] = CSP_POLICY_PROD
      } else {
        headers['Content-Security-Policy'] = CSP_POLICY_DEV
      }
      
      return new NextResponse(null, {
        status: 204,
        headers
      })
    }
    
    // Redirect HTTP to HTTPS in production (but not on Vercel which handles this automatically)
    if (process.env.NODE_ENV === 'production' && !process.env.VERCEL && request.headers.get('x-forwarded-proto') !== 'https') {
      return NextResponse.redirect(
        `https://${request.headers.get('host')}${request.nextUrl.pathname}`,
        301
      )
    }
    
    // Role-based route protection
    if (token) {
      const userRole = token.role as string
      
      // Officer routes - only accessible by Officers
      if (pathname.startsWith('/officer') && userRole !== 'Officer') {
        return NextResponse.redirect(new URL('/403', request.url))
      }
      
      // Staff routes - only accessible by Staff and Officers
      if (pathname.startsWith('/staff') && userRole !== 'Staff' && userRole !== 'Officer') {
        return NextResponse.redirect(new URL('/403', request.url))
      }
      
      // Citizen routes - only accessible by Citizens
      if (pathname.startsWith('/citizen') && userRole !== 'Citizens') {
        return NextResponse.redirect(new URL('/403', request.url))
      }
    }
    
    return response
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Allow access to home page and auth pages without authentication
        return true
      }
    }
  }
)

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    '/api/:path*',
    '/officer/:path*',
    '/staff/:path*',
    '/citizen/:path*',
    '/((?!_next/static|_next/image|favicon.ico|auth/signin|auth/register|/).*)'
  ]
}