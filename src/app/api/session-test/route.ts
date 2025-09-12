import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export async function GET(_request: NextRequest) {
  try {
    console.log('Session test route called')
    
    // Get session
    const session: any = await getServerSession(authOptions)
    
    console.log('Session from server:', session)
    
    if (!session || !session.user) {
      return NextResponse.json({
        success: false,
        message: 'No session found',
        session: null
      })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Session found',
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
    console.error('Session test error:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}