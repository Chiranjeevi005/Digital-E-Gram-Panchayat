import { render, screen } from '@testing-library/react'
import OfficerAnalytics from '@/app/officer/analytics/page'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      prefetch: () => null
    }
  },
  usePathname() {
    return '/officer/analytics'
  }
}))

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  useSession() {
    return {
      data: {
        user: {
          name: 'Test Officer',
          email: 'officer@test.com',
          role: 'officer'
        }
      },
      status: 'authenticated'
    }
  }
}))

// Mock components
jest.mock('@/components/Navbar', () => {
  return function MockNavbar() {
    return <div data-testid="navbar">Navbar</div>
  }
})

jest.mock('@/components/Sidebar', () => {
  return function MockSidebar() {
    return <div data-testid="sidebar">Sidebar</div>
  }
})

jest.mock('@/components/Card', () => {
  return function MockCard({ title, children }: { title?: string; children: React.ReactNode }) {
    return (
      <div data-testid="card">
        {title && <h2>{title}</h2>}
        {children}
      </div>
    )
  }
})

jest.mock('@/components/Chart', () => {
  return function MockChart() {
    return <div data-testid="chart">Chart Component</div>
  }
})

jest.mock('@/components/StatCard', () => {
  return function MockStatCard({ title, value }: { title: string; value: number }) {
    return (
      <div data-testid="stat-card">
        <h3>{title}</h3>
        <p>{value}</p>
      </div>
    )
  }
})

describe('OfficerAnalytics', () => {
  it('renders the analytics dashboard', () => {
    render(<OfficerAnalytics />)
    
    // Check if the main heading is rendered
    expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument()
    
    // Check if the description is rendered
    expect(screen.getByText('Comprehensive insights and performance metrics')).toBeInTheDocument()
    
    // Check if stat cards are rendered
    expect(screen.getByText('Total Applications')).toBeInTheDocument()
    expect(screen.getByText('Pending Applications')).toBeInTheDocument()
    expect(screen.getByText('Approved Applications')).toBeInTheDocument()
    expect(screen.getByText('Rejected Applications')).toBeInTheDocument()
    
    // Check if charts are rendered
    expect(screen.getAllByTestId('chart')).toHaveLength(3)
    
    // Check if info cards are rendered
    expect(screen.getByText('Total Users')).toBeInTheDocument()
    expect(screen.getByText('Active Services')).toBeInTheDocument()
    expect(screen.getByText('Total Downloads')).toBeInTheDocument()
    expect(screen.getByText('Avg. Processing Time')).toBeInTheDocument()
  })
})