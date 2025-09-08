import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    // Get the session
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Not authenticated'
        },
        { status: 401 }
      )
    }
    
    return NextResponse.json({
      success: true,
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role
      }
    })
  } catch (error: any) {
    console.error('Auth verification error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error'
      },
      { status: 500 }
    )
  }
}