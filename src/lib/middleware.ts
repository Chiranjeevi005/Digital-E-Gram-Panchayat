import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    // Get the token from the request
    const token = req.nextauth.token
    
    // If there's no token, redirect to sign in
    if (!token) {
      return NextResponse.redirect(new URL('/auth/signin', req.url))
    }
    
    // Get the pathname
    const { pathname } = req.nextUrl
    
    // Check role-based access
    const userRole = token.role as string
    
    // Protect officer routes - only Officer can access
    if (pathname.startsWith('/officer') && userRole !== 'Officer') {
      return NextResponse.redirect(new URL('/auth/signin', req.url))
    }
    
    // Protect staff routes - only Staff and Officer can access
    if (pathname.startsWith('/staff') && userRole !== 'Staff' && userRole !== 'Officer') {
      return NextResponse.redirect(new URL('/auth/signin', req.url))
    }
    
    // Protect citizen routes - only Citizens can access
    if (pathname.startsWith('/citizen') && userRole !== 'Citizens') {
      return NextResponse.redirect(new URL('/auth/signin', req.url))
    }
    
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    }
  }
)

export const config = {
  matcher: [
    '/officer/:path*',
    '/staff/:path*',
    '/citizen/:path*'
  ]
}