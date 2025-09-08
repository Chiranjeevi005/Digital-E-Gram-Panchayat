import { hasRole } from '@/lib/rbac'
import { validatePassword } from '@/lib/passwordValidator'

describe('Authentication System', () => {
  describe('Role-Based Access Control', () => {
    test('should correctly validate role hierarchy', () => {
      // Admin should have access to all roles
      expect(hasRole('admin', 'admin')).toBe(true)
      expect(hasRole('admin', 'staff')).toBe(true)
      expect(hasRole('admin', 'citizen')).toBe(true)
      
      // Staff should have access to citizen and staff roles, but not admin
      expect(hasRole('staff', 'admin')).toBe(false)
      expect(hasRole('staff', 'staff')).toBe(true)
      expect(hasRole('staff', 'citizen')).toBe(true)
      
      // Citizen should only have access to citizen role
      expect(hasRole('citizen', 'admin')).toBe(false)
      expect(hasRole('citizen', 'staff')).toBe(false)
      expect(hasRole('citizen', 'citizen')).toBe(true)
    })
  })

  describe('Password Validation', () => {
    test('should validate strong passwords', () => {
      const strongPassword = 'MyStr0ng!Pass'
      const result = validatePassword(strongPassword)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('should reject weak passwords', () => {
      const weakPassword = 'weak'
      const result = validatePassword(weakPassword)
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    test('should enforce minimum length', () => {
      const shortPassword = 'Short1!'
      const result = validatePassword(shortPassword)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password must be at least 8 characters long')
    })

    test('should enforce uppercase requirement', () => {
      const noUppercase = 'nouppercase1!'
      const result = validatePassword(noUppercase)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password must contain at least one uppercase letter')
    })

    test('should enforce lowercase requirement', () => {
      const noLowercase = 'NOLOWERCASE1!'
      const result = validatePassword(noLowercase)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password must contain at least one lowercase letter')
    })

    test('should enforce number requirement', () => {
      const noNumbers = 'NoNumbers!'
      const result = validatePassword(noNumbers)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password must contain at least one number')
    })

    test('should enforce special character requirement', () => {
      const noSpecial = 'NoSpecial1'
      const result = validatePassword(noSpecial)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password must contain at least one special character')
    })
  })
})