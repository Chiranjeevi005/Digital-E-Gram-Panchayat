import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'

// This is just for debugging purposes
export async function GET() {
  try {
    // Check if environment variables are set
    const envCheck = {
      GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL
    }

    // Check auth options
    const providers = authOptions.providers.map(provider => {
      if (typeof provider === 'object' && provider !== null && 'id' in provider) {
        return {
          id: provider.id,
          name: provider.name
        }
      }
      return null
    }).filter(Boolean)

    return NextResponse.json({
      success: true,
      envCheck,
      providers,
      message: 'Auth configuration check complete'
    })
  } catch (error) {
    console.error('Debug auth error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}