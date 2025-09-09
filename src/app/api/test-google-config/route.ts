import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Check if required environment variables are set
    const requiredEnvVars = [
      'NEXTAUTH_URL',
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET',
      'NEXTAUTH_SECRET'
    ]

    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar])

    if (missingEnvVars.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Missing required environment variables',
        missing: missingEnvVars
      }, { status: 500 })
    }

    // Check Google OAuth configuration
    const nextAuthUrl = process.env.NEXTAUTH_URL
    const googleClientId = process.env.GOOGLE_CLIENT_ID
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET

    // Generate the expected redirect URI
    const expectedRedirectUri = `${nextAuthUrl}/api/auth/callback/google`

    return NextResponse.json({
      success: true,
      message: 'Google OAuth configuration check complete',
      configuration: {
        nextAuthUrl,
        googleClientId: googleClientId ? `${googleClientId.substring(0, 10)}...` : 'NOT SET',
        googleClientSecret: googleClientSecret ? 'SET (hidden for security)' : 'NOT SET',
        expectedRedirectUri
      }
    })
  } catch (error) {
    console.error('Google config test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}