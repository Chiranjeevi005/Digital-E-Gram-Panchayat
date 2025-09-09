import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Check environment variables
    const envCheck = {
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'NOT SET',
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'SET' : 'NOT SET',
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'NOT SET',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT SET',
    }

    // Check if required variables are present
    const isConfigured = !!(
      process.env.NEXTAUTH_URL && 
      process.env.GOOGLE_CLIENT_ID && 
      process.env.GOOGLE_CLIENT_SECRET && 
      process.env.NEXTAUTH_SECRET
    )

    return NextResponse.json({
      success: true,
      message: 'Health check successful',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      envCheck,
      isConfigured,
      redirectUri: process.env.NEXTAUTH_URL 
        ? `${process.env.NEXTAUTH_URL}/api/auth/callback/google` 
        : 'NEXTAUTH_URL not set'
    })
  } catch (error) {
    console.error('Health check error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}