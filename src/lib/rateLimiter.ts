import { NextRequest } from 'next/server'
import logger from '@/lib/logger'

// In-memory store for rate limiting (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Rate limiter configuration
const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 5 // Max 5 failed attempts

export const rateLimit = (req: NextRequest): { allowed: boolean; resetTime?: number } => {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
  const key = `rate-limit:${ip}`
  const now = Date.now()
  
  const record = rateLimitStore.get(key)
  
  // If no record or record has expired, create new one
  if (!record || record.resetTime < now) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    })
    return { allowed: true }
  }
  
  // Increment count
  record.count += 1
  rateLimitStore.set(key, record)
  
  // Check if limit exceeded
  if (record.count > RATE_LIMIT_MAX_REQUESTS) {
    logger.warn(`Rate limit exceeded for IP: ${ip}`)
    return { allowed: false, resetTime: record.resetTime }
  }
  
  return { allowed: true }
}

// Reset rate limit for successful login
export const resetRateLimit = (req: NextRequest) => {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
  const key = `rate-limit:${ip}`
  rateLimitStore.delete(key)
}

// Get remaining attempts
export const getRemainingAttempts = (req: NextRequest): number => {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
  const key = `rate-limit:${ip}`
  const record = rateLimitStore.get(key)
  
  if (!record || record.resetTime < Date.now()) {
    return RATE_LIMIT_MAX_REQUESTS
  }
  
  return Math.max(0, RATE_LIMIT_MAX_REQUESTS - record.count)
}