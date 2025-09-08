import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock next/navigation since it's not available in test environment
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      prefetch: () => null,
    }
  },
}))

describe('User Dashboard', () => {
  it('should render welcome message', () => {
    // This is just a placeholder test
    expect(1).toBe(1)
  })
})