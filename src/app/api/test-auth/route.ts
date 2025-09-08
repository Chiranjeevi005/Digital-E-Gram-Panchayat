import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export async function GET(_request: NextRequest) {
  try {
    // Log the request for debugging
    console.log('Test auth route called')
    
    // Get the session using the proper import
    const session = await getServerSession(authOptions)
    
    console.log('Session retrieved:', session ? 'Found' : 'Not found')
    
    if (!session) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Not authenticated',
          session: null
        },
        { status: 401 }
      )
    }
    
    // Log session details for debugging
    console.log('Session details:', {
      userId: session.user.id,
      name: session.user.name,
      email: session.user.email,
      role: session.user.role
    })
    
    return NextResponse.json({
      success: true,
      message: 'Authentication successful',
      session: {
        user: {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          role: session.user.role
        }
      }
    })
  } catch (error: any) {
    console.error('Error testing auth:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        message: error.message
      },
      { status: 500 }
    )
  }
}