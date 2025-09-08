import { validatePassword, generatePasswordSuggestion } from '@/lib/passwordValidator'

describe('Password Security', () => {
  test('should reject passwords shorter than 8 characters', () => {
    const result = validatePassword('Short1!')
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('Password must be at least 8 characters long')
  })

  test('should reject passwords without uppercase letters', () => {
    const result = validatePassword('nouppercase1!')
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('Password must contain at least one uppercase letter')
  })

  test('should reject passwords without lowercase letters', () => {
    const result = validatePassword('NOLOWERCASE1!')
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('Password must contain at least one lowercase letter')
  })

  test('should reject passwords without numbers', () => {
    const result = validatePassword('NoNumbers!')
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('Password must contain at least one number')
  })

  test('should reject passwords without special characters', () => {
    const result = validatePassword('NoSpecial1')
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('Password must contain at least one special character')
  })

  test('should accept valid passwords', () => {
    const result = validatePassword('MyStr0ng!Pass')
    expect(result.isValid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  test('should generate password suggestions', () => {
    const suggestion = generatePasswordSuggestion()
    const result = validatePassword(suggestion)
    expect(result.isValid).toBe(true)
  })
})
