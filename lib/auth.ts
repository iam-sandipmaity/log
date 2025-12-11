import { NextRequest } from 'next/server'

/**
 * Verify if the provided password matches the admin password
 */
export function verifyAdminPassword(password: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD
  
  if (!adminPassword) {
    console.error('ADMIN_PASSWORD environment variable is not set')
    return false
  }
  
  return password === adminPassword
}

/**
 * Extract and verify admin token from request headers
 */
export function verifyAdminToken(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false
  }
  
  const token = authHeader.substring(7) // Remove 'Bearer ' prefix
  return verifyAdminPassword(token)
}

/**
 * Create a simple token (in production, use JWT or similar)
 */
export function createAdminToken(password: string): string | null {
  if (verifyAdminPassword(password)) {
    // In production, you should use JWT or encrypted tokens
    // For now, we'll return the password as the token (not ideal but simple)
    return password
  }
  return null
}
