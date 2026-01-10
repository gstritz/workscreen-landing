/**
 * Validation utilities for questionnaire fields
 */

/**
 * Validate email format
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email || email.trim() === '') {
    return { valid: false, error: 'Email is required' }
  }

  // RFC 5322 compliant email regex (simplified but comprehensive)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Please enter a valid email address' }
  }

  return { valid: true }
}

/**
 * Validate phone number format
 * Accepts various formats: (123) 456-7890, 123-456-7890, 123.456.7890, 1234567890, +1 123 456 7890
 */
export function validatePhone(phone: string): { valid: boolean; error?: string } {
  if (!phone || phone.trim() === '') {
    return { valid: false, error: 'Phone number is required' }
  }

  // Remove common formatting characters
  const cleaned = phone.replace(/[\s\-\(\)\.\+]/g, '')
  
  // Check if it's all digits and has reasonable length (10-15 digits)
  const phoneRegex = /^\d{10,15}$/
  
  if (!phoneRegex.test(cleaned)) {
    return { valid: false, error: 'Please enter a valid phone number (10-15 digits)' }
  }

  return { valid: true }
}

/**
 * Validate name (first or last name, or full name)
 * Minimum 2 characters, allows letters, hyphens, apostrophes, and spaces
 * For full names, requires at least one space
 */
export function validateName(name: string, minLength: number = 2, isFullName: boolean = false): { valid: boolean; error?: string } {
  if (!name || name.trim() === '') {
    return { valid: false, error: 'Name is required' }
  }

  const trimmed = name.trim()

  if (trimmed.length < minLength) {
    return { valid: false, error: `Name must be at least ${minLength} characters` }
  }

  // For full names, require at least one space
  if (isFullName && !trimmed.includes(' ')) {
    return { valid: false, error: 'Please enter your full name (first and last name)' }
  }

  // Allow letters, hyphens, apostrophes, and spaces
  const nameRegex = /^[a-zA-Z\s\-']+$/
  
  if (!nameRegex.test(trimmed)) {
    return { valid: false, error: 'Name can only contain letters, spaces, hyphens, and apostrophes' }
  }

  return { valid: true }
}

/**
 * Get validation error for a field based on its type and value
 */
export function getFieldValidationError(
  fieldType: string,
  value: any,
  fieldRef?: string,
  fieldTitle?: string
): string | null {
  if (value === undefined || value === null || value === '') {
    return null // Required validation is handled separately
  }

  const stringValue = String(value).trim()

  switch (fieldType) {
    case 'email':
      const emailResult = validateEmail(stringValue)
      return emailResult.valid ? null : emailResult.error || null

    case 'phone_number':
      const phoneResult = validatePhone(stringValue)
      return phoneResult.valid ? null : phoneResult.error || null

    case 'short_text':
      // Check if this is a phone, name, or other special field based on ref or title
      const titleLower = (fieldTitle || '').toLowerCase()
      const refLower = (fieldRef || '').toLowerCase()
      
      // Check for phone number field
      const isPhone = 
        fieldType === 'phone_number' ||
        refLower.includes('phone') ||
        titleLower.includes("phone number") ||
        titleLower.includes("phone") ||
        refLower === 'a045cd11-7955-47cf-b030-914e5a96eba5' // Phone field ref from Typeform
      
      if (isPhone) {
        const phoneResult = validatePhone(stringValue)
        return phoneResult.valid ? null : phoneResult.error || null
      }
      
      // Check for name fields
      const isFirstName = 
        refLower.includes('firstname') || 
        refLower.includes('first-name') ||
        refLower === '01f5gpz3hmgrhhb9zhq80c021f' ||
        titleLower.includes("first name") ||
        titleLower.includes("firstname") ||
        (titleLower.includes("what's your") && titleLower.includes("first"))
      
      const isLastName = 
        refLower.includes('lastname') || 
        refLower.includes('last-name') ||
        refLower === '0b08c677-50f6-40c1-95e5-19b14fdfd9c2' ||
        titleLower.includes("last name") ||
        titleLower.includes("lastname") ||
        (titleLower.includes("what is your") && titleLower.includes("last"))
      
      const isFullName = 
        refLower.includes('fullname') ||
        refLower.includes('full-name') ||
        titleLower.includes("full name") ||
        titleLower.includes("fullname") ||
        (titleLower.includes("what's your") && titleLower.includes("full"))
      
      if (isFirstName || isLastName || isFullName) {
        // For full name, require at least 3 characters (first + space + last) and at least one space
        const minLength = isFullName ? 3 : 2
        const nameResult = validateName(stringValue, minLength, isFullName)
        return nameResult.valid ? null : nameResult.error || null
      }
      return null

    default:
      return null
  }
}
