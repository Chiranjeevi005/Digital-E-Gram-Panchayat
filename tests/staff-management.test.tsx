import { render, screen, waitFor } from '@testing-library/react'
import StaffManagement from '@/app/officer/users/page'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      prefetch: () => null,
      push: jest.fn()
    }
  },
  usePathname() {
    return '/officer/users'
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

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([
      {
        _id: '1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        role: 'staff',
        status: 'active',
        department: 'Revenue',
        position: 'Revenue Officer',
        employeeId: 'EMP001',
        createdAt: '2023-01-15'
      },
      {
        _id: '2',
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        role: 'user',
        status: 'active',
        createdAt: '2023-02-20'
      }
    ])
  })
) as jest.Mock

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

jest.mock('@/components/Table', () => {
  const MockTable = ({ children }: { children: React.ReactNode }) => {
    return <div data-testid="table">{children}</div>
  }
  
  MockTable.Head = ({ children }: { children: React.ReactNode }) => {
    return <div data-testid="table-head">{children}</div>
  }
  
  MockTable.HeadCell = ({ children }: { children: React.ReactNode }) => {
    return <div data-testid="table-head-cell">{children}</div>
  }
  
  MockTable.Body = ({ children }: { children: React.ReactNode }) => {
    return <div data-testid="table-body">{children}</div>
  }
  
  MockTable.Row = ({ children }: { children: React.ReactNode }) => {
    return <div data-testid="table-row">{children}</div>
  }
  
  MockTable.Cell = ({ children }: { children: React.ReactNode }) => {
    return <div data-testid="table-cell">{children}</div>
  }
  
  return MockTable
})

jest.mock('@/components/Badge', () => {
  return function MockBadge({ children }: { children: React.ReactNode }) {
    return <span data-testid="badge">{children}</span>
  }
})

jest.mock('@/components/SearchBar', () => {
  return function MockSearchBar() {
    return <input data-testid="search-bar" placeholder="Search users..." />
  }
})

jest.mock('@/components/Modal', () => {
  return function MockModal({ title, children, open }: { title: string; children: React.ReactNode; open: boolean }) {
    return open ? (
      <div data-testid="modal">
        <h2>{title}</h2>
        {children}
      </div>
    ) : null
  }
})

jest.mock('@/components/Form', () => {
  return function MockForm({ children, onSubmit }: { children: React.ReactNode; onSubmit: (e: React.FormEvent) => void }) {
    return <form data-testid="form" onSubmit={onSubmit}>{children}</form>
  }
})

jest.mock('@/components/Button', () => {
  return function MockButton({ children }: { children: React.ReactNode }) {
    return <button data-testid="button">{children}</button>
  }
})

jest.mock('@/components/SkeletonLoader', () => {
  return function MockSkeletonLoader() {
    return <div data-testid="skeleton-loader">Loading...</div>
  }
})

describe('StaffManagement', () => {
  it('renders the staff management page', async () => {
    render(<StaffManagement />)
    
    // Wait for the data to load and the table to be rendered
    await waitFor(() => {
      expect(screen.queryByTestId('skeleton-loader')).not.toBeInTheDocument()
    })
    
    // Check if the main heading is rendered
    expect(screen.getByText('User Management')).toBeInTheDocument()
    
    // Check if the description is rendered
    expect(screen.getByText('Manage citizen, staff, and officer accounts')).toBeInTheDocument()
    
    // Check if the user directory heading is rendered
    expect(screen.getByText('User Directory')).toBeInTheDocument()
    
    // Check if search bar is rendered
    expect(screen.getByTestId('search-bar')).toBeInTheDocument()
    
    // Check if filter dropdowns are rendered
    const filterDropdowns = screen.getAllByRole('combobox')
    expect(filterDropdowns).toHaveLength(2)
    
    // Check if add user button is rendered
    expect(screen.getByText('Add User')).toBeInTheDocument()
    
    // Check if table elements are rendered
    expect(screen.getByTestId('table')).toBeInTheDocument()
    expect(screen.getByTestId('table-head')).toBeInTheDocument()
    expect(screen.getByTestId('table-body')).toBeInTheDocument()
    
    // Check if user data is rendered
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('jane.smith@example.com')).toBeInTheDocument()
  })
})