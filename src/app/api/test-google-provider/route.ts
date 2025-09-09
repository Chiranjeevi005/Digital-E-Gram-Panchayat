import { NextResponse } from 'next/server'
import GoogleProvider from 'next-auth/providers/google'

export async function GET() {
  try {
    // Check if required environment variables are set
    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      return NextResponse.json({
        success: false,
        error: 'Google OAuth credentials not configured',
        details: {
          clientId: clientId ? 'SET' : 'MISSING',
          clientSecret: clientSecret ? 'SET' : 'MISSING'
        }
      }, { status: 500 })
    }

    // Try to initialize the Google provider
    const provider = GoogleProvider({
      clientId,
      clientSecret,
      profile(profile) {
        return {
          id: profile.sub,
          name: `${profile.given_name} ${profile.family_name}`,
          email: profile.email,
          role: 'citizen',
        }
      }
    })

    // Check if the provider has the required properties
    const providerInfo = {
      id: provider.id,
      name: provider.name,
      type: provider.type,
      clientId: clientId ? `${clientId.substring(0, 10)}...` : 'NOT SET',
      clientSecret: clientSecret ? 'SET (hidden for security)' : 'NOT SET'
    }

    return NextResponse.json({
      success: true,
      message: 'Google OAuth provider initialized successfully',
      provider: providerInfo
    })
  } catch (error) {
    console.error('Google provider test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}