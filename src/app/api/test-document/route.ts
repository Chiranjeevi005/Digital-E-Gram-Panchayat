import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export async function GET(_request: NextRequest) {
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
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Document test endpoint working',
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role
      }
    })
  } catch (error: any) {
    console.error('Document test error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error'
      },
      { status: 500 }
    )
  }
}