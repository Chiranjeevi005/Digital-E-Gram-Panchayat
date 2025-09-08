import { createHash, randomBytes } from 'crypto';

/**
 * Sanitize input to prevent XSS attacks
 * @param input - String to sanitize
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
  // Basic HTML entity encoding
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Create a signed URL with expiration
 * @param resourceId - ID of the resource
 * @param expiresIn - Expiration time in milliseconds
 * @returns Signed URL with token and expiration
 */
export function createSignedUrl(resourceId: string, expiresIn: number = 3600000): { url: string, token: string, expiresAt: number } {
  const expiresAt = Date.now() + expiresIn;
  const tokenData = `${resourceId}:${expiresAt}:${process.env.SIGNING_SECRET || 'fallback-secret'}`;
  const token = createHash('sha256').update(tokenData).digest('hex');
  
  return {
    url: `/api/downloads/${resourceId}?token=${token}&expires=${expiresAt}`,
    token,
    expiresAt
  };
}

/**
 * Verify a signed URL
 * @param resourceId - ID of the resource
 * @param token - Token from the URL
 * @param expiresAt - Expiration timestamp
 * @returns Boolean indicating if the signature is valid
 */
export function verifySignedUrl(resourceId: string, token: string, expiresAt: number): boolean {
  // Check if expired
  if (Date.now() > expiresAt) {
    return false;
  }
  
  // Recreate the token and compare
  const tokenData = `${resourceId}:${expiresAt}:${process.env.SIGNING_SECRET || 'fallback-secret'}`;
  const expectedToken = createHash('sha256').update(tokenData).digest('hex');
  
  return token === expectedToken;
}

/**
 * Generate a secure random token
 * @param length - Length of the token in bytes
 * @returns Hex-encoded secure random token
 */
export function generateSecureToken(length: number = 32): string {
  return randomBytes(length).toString('hex');
}

/**
 * Hash sensitive data
 * @param data - Data to hash
 * @returns Hashed data
 */
export function hashSensitiveData(data: string): string {
  return createHash('sha256').update(data).digest('hex');
}