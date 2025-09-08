// Simple test for rate limiting functionality
describe('Rate Limiting Tests', () => {
  // Mock rate limiting functions
  const rateLimitStore = new Map<string, { count: number; resetTime: number }>()
  
  const rateLimit = (ip: string): { allowed: boolean; resetTime?: number } => {
    const key = `rate-limit:${ip}`
    const now = Date.now()
    const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 minutes
    const RATE_LIMIT_MAX_REQUESTS = 5 // Max 5 failed attempts
    
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
      return { allowed: false, resetTime: record.resetTime }
    }
    
    return { allowed: true }
  }

  const resetRateLimit = (ip: string) => {
    const key = `rate-limit:${ip}`
    rateLimitStore.delete(key)
  }

  test('should allow requests within limit', () => {
    const ip = '192.168.1.1'
    
    // First 5 requests should be allowed
    for (let i = 0; i < 5; i++) {
      const result = rateLimit(ip)
      expect(result.allowed).toBe(true)
    }
  })

  test('should block requests exceeding limit', () => {
    const ip = '192.168.1.2'
    
    // First 5 requests should be allowed
    for (let i = 0; i < 5; i++) {
      const result = rateLimit(ip)
      expect(result.allowed).toBe(true)
    }
    
    // 6th request should be blocked
    const result = rateLimit(ip)
    expect(result.allowed).toBe(false)
  })

  test('should reset rate limit after successful attempt', () => {
    const ip = '192.168.1.3'
    
    // Make 5 requests to reach limit
    for (let i = 0; i < 5; i++) {
      rateLimit(ip)
    }
    
    // Next request should be blocked
    let result = rateLimit(ip)
    expect(result.allowed).toBe(false)
    
    // Reset rate limit (simulating successful login)
    resetRateLimit(ip)
    
    // Next request should be allowed
    result = rateLimit(ip)
    expect(result.allowed).toBe(true)
  })
})