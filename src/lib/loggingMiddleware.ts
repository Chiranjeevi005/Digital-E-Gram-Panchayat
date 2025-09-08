import { NextRequest, NextResponse } from 'next/server'
import logger from './logger'
import Log from '@/models/Log'
import dbConnect from './dbConnect'

export async function loggingMiddleware(request: NextRequest) {
  await dbConnect()
  
  const startTime = Date.now()
  
  // Log the incoming request
  logger.info({
    method: request.method,
    url: request.url,
    headers: {
      'user-agent': request.headers.get('user-agent'),
      'content-type': request.headers.get('content-type'),
    },
    ip: request.headers.get('x-forwarded-for') || 'unknown',
  }, 'Incoming request')
  
  // Create a log entry in the database
  try {
    const logEntry = new Log({
      action: 'request',
      performedBy: null, // Will be populated if user is authenticated
      targetType: 'api',
      details: {
        method: request.method,
        url: request.url,
        headers: Object.fromEntries(request.headers),
        ip: request.headers.get('x-forwarded-for') || 'unknown',
      },
    })
    
    await logEntry.save()
  } catch (error: any) {
    logger.error('Failed to create log entry:', error)
  }
  
  // Return a function to log the response
  return async (response: NextResponse) => {
    const duration = Date.now() - startTime
    
    logger.info({
      status: response.status,
      duration: `${duration}ms`,
    }, 'Response sent')
  }
}