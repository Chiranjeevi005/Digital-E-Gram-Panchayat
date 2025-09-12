import { NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'

export async function GET() {
  try {
    // Test database connection
    await dbConnect()
    
    // Check environment variables
    const envCheck = {
      NEXTAUTH_URL: process.env.NEXTAUTH_URL ? 'SET' : 'NOT SET',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT SET',
      MONGODB_URI: process.env.MONGODB_URI ? 'SET' : 'NOT SET'
    }
    
    // Check if required environment variables are set
    const isConfigured = Object.values(envCheck).every(value => value === 'SET')
    
    return NextResponse.json({
      success: true,
      message: 'Health check successful',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      envCheck,
      isConfigured
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