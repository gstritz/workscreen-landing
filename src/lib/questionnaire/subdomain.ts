/**
 * Utilities for subdomain extraction and validation
 */

/**
 * Extract subdomain from hostname
 * Examples:
 * - "sanfordlaw.workchat.law" -> "sanfordlaw"
 * - "www.workchat.law" -> null
 * - "workchat.law" -> null
 * - "localhost:3000" -> null (development)
 */
export function extractSubdomain(hostname: string | null): string | null {
  if (!hostname) return null

  // Remove port if present
  const host = hostname.split(':')[0]

  // Handle localhost/development
  if (host === 'localhost' || host === '127.0.0.1') {
    return null
  }

  // Split by dots
  const parts = host.split('.')

  // If we have at least 3 parts (subdomain.domain.tld), extract subdomain
  // For "sanfordlaw.workchat.law" -> ["sanfordlaw", "workchat", "law"]
  if (parts.length >= 3) {
    // Skip "www" subdomain
    if (parts[0] === 'www' && parts.length > 3) {
      return parts[1]
    }
    return parts[0]
  }

  return null
}

/**
 * Validate subdomain format
 * - Only lowercase letters, numbers, and hyphens
 * - Cannot start or end with hyphen
 * - 1-63 characters
 */
export function validateSubdomain(subdomain: string): boolean {
  if (!subdomain || subdomain.length < 1 || subdomain.length > 63) {
    return false
  }

  // Must start and end with alphanumeric
  if (!/^[a-z0-9]/.test(subdomain) || !/[a-z0-9]$/.test(subdomain)) {
    return false
  }

  // Only lowercase letters, numbers, and hyphens
  return /^[a-z0-9-]+$/.test(subdomain)
}

/**
 * Sanitize subdomain (for creating from firm name)
 */
export function sanitizeSubdomain(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, '-') // Replace invalid chars with hyphen
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    .substring(0, 63) // Max length
}
