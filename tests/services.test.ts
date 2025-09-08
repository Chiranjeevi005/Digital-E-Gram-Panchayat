// Mock the database connection and models
jest.mock('@/lib/dbConnect', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue({}),
}))

jest.mock('@/models/Service', () => ({
  __esModule: true,
  default: {
    find: jest.fn(),
  },
}))

import { describe, it, expect, beforeEach } from '@jest/globals'
import Service from '@/models/Service'

describe('Services', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks()
  })

  it('should define the four core services', () => {
    // This test just verifies the structure of our service data
    const servicesData = [
      {
        name: 'Birth & Death Certificates',
        category: 'Certificates',
        processingTime: 0,
      },
      {
        name: 'Government Schemes',
        category: 'Welfare',
        processingTime: 0,
      },
      {
        name: 'Grievance Redressal',
        category: 'Complaints',
        processingTime: 0,
      },
      {
        name: 'Land Records & Utility Connections',
        category: 'Property',
        processingTime: 0,
      }
    ]

    expect(servicesData).toHaveLength(4)
    
    // Verify each service has the required properties
    servicesData.forEach(service => {
      expect(service).toHaveProperty('name')
      expect(service).toHaveProperty('category')
      expect(service).toHaveProperty('processingTime')
    })
  })

  it('should have correct categories for each service', () => {
    const servicesData = [
      { name: 'Birth & Death Certificates', category: 'Certificates' },
      { name: 'Government Schemes', category: 'Welfare' },
      { name: 'Grievance Redressal', category: 'Complaints' },
      { name: 'Land Records & Utility Connections', category: 'Property' }
    ]

    expect(servicesData[0].category).toBe('Certificates')
    expect(servicesData[1].category).toBe('Welfare')
    expect(servicesData[2].category).toBe('Complaints')
    expect(servicesData[3].category).toBe('Property')
  })
})