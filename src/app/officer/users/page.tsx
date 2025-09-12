'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'
import Card from '@/components/Card'
import Table from '@/components/Table'
import Button from '@/components/Button'
import Form from '@/components/Form'
import Modal from '@/components/Modal'
import Badge from '@/components/Badge'
import SkeletonLoader from '@/components/SkeletonLoader'
import SearchBar from '@/components/SearchBar'
import { 
  Bars3Icon, 
  XMarkIcon,
  PencilIcon,
  TrashIcon,
  InformationCircleIcon,
  UserPlusIcon,
  UserGroupIcon,
  UserIcon
} from '@heroicons/react/24/outline'

interface UserType {
  _id: string
  name: string
  email: string
  role: 'user' | 'staff' | 'officer'
  status: 'active' | 'inactive' | 'suspended'
  department?: string
  position?: string
  employeeId?: string
  createdAt: string
}

export default function OfficerUsers() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<UserType[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserType[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserType | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user' as 'user' | 'staff' | 'officer',
    status: 'active' as 'active' | 'inactive' | 'suspended',
    department: '',
    position: '',
    employeeId: ''
  })
  const [formError, setFormError] = useState('')

  useEffect(() => {
    if (status === 'loading') return
    
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (session?.user && 'role' in session.user && session.user.role && session.user.role !== 'officer') {
      router.push(`/${session.user.role}/dashboard`)
    } else if (session?.user) {
      fetchUsers()
    }
  }, [session, status, router])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users')
      const data = await response.json()
      
      if (response.ok) {
        setUsers(data)
        setFilteredUsers(data)
      } else {
        throw new Error(data.error || 'Failed to fetch users')
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      // Use mock data for demonstration if API fails
      const mockUsers: UserType[] = [
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
          role: 'staff',
          status: 'active',
          department: 'Health',
          position: 'Health Officer',
          employeeId: 'EMP002',
          createdAt: '2023-02-20'
        },
        {
          _id: '3',
          name: 'Robert Johnson',
          email: 'robert.j@example.com',
          role: 'user',
          status: 'active',
          createdAt: '2023-03-10'
        },
        {
          _id: '4',
          name: 'Emily Davis',
          email: 'emily.davis@example.com',
          role: 'staff',
          status: 'inactive',
          department: 'Education',
          position: 'Education Officer',
          employeeId: 'EMP003',
          createdAt: '2023-04-05'
        },
        {
          _id: '5',
          name: 'Michael Wilson',
          email: 'michael.w@example.com',
          role: 'user',
          status: 'active',
          createdAt: '2023-05-12'
        },
        {
          _id: '6',
          name: 'Sarah Brown',
          email: 'sarah.brown@example.com',
          role: 'officer',
          status: 'active',
          department: 'Administration',
          position: 'Deputy Officer',
          employeeId: 'EMP004',
          createdAt: '2023-06-18'
        }
      ]
      
      setUsers(mockUsers)
      setFilteredUsers(mockUsers)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    filterUsers(query, statusFilter, roleFilter)
  }

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status)
    filterUsers(searchQuery, status, roleFilter)
  }

  const handleRoleFilter = (role: string) => {
    setRoleFilter(role)
    filterUsers(searchQuery, statusFilter, role)
  }

  const filterUsers = (query: string, status: string, role: string) => {
    let result = users
    
    // Filter by search query
    if (query) {
      const lowerQuery = query.toLowerCase()
      result = result.filter(user => 
        user.name.toLowerCase().includes(lowerQuery) ||
        user.email.toLowerCase().includes(lowerQuery) ||
        (user.employeeId && user.employeeId.toLowerCase().includes(lowerQuery)) ||
        (user.department && user.department.toLowerCase().includes(lowerQuery))
      )
    }
    
    // Filter by status
    if (status !== 'all') {
      result = result.filter(user => user.status === status)
    }
    
    // Filter by role
    if (role !== 'all') {
      result = result.filter(user => user.role === role)
    }
    
    setFilteredUsers(result)
  }

  const handleCreateUser = () => {
    setEditingUser(null)
    setFormData({
      name: '',
      email: '',
      role: 'user',
      status: 'active',
      department: '',
      position: '',
      employeeId: ''
    })
    setFormError('')
    setIsModalOpen(true)
  }

  const handleEditUser = (user: UserType) => {
    setEditingUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      department: user.department || '',
      position: user.position || '',
      employeeId: user.employeeId || ''
    })
    setFormError('')
    setIsModalOpen(true)
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        // Remove the user from the local state
        setUsers(prev => prev.filter(user => user._id !== userId))
        setFilteredUsers(prev => prev.filter(user => user._id !== userId))
      } else {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete user')
      }
    } catch (error: any) {
      console.error('Error deleting user:', error)
      alert('Failed to delete user: ' + error.message)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    // Validate form
    if (!formData.name.trim()) {
      setFormError('Name is required')
      return
    }

    if (!formData.email.trim()) {
      setFormError('Email is required')
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setFormError('Please enter a valid email address')
      return
    }

    try {
      const method = editingUser ? 'PUT' : 'POST'
      const url = editingUser ? `/api/users/${editingUser._id}` : '/api/users'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        if (editingUser) {
          // Update existing user
          setUsers(prev => prev.map(user => user._id === editingUser._id ? data : user))
          setFilteredUsers(prev => prev.map(user => user._id === editingUser._id ? data : user))
        } else {
          // Add new user
          setUsers(prev => [...prev, data])
          setFilteredUsers(prev => [...prev, data])
        }

        setIsModalOpen(false)
      } else {
        throw new Error(data.error || `Failed to ${editingUser ? 'update' : 'create'} user`)
      }
    } catch (error: any) {
      console.error(`Error ${editingUser ? 'updating' : 'creating'} user:`, error)
      setFormError(error.message)
    }
  }

  const statusOptions = ['all', 'active', 'inactive', 'suspended']
  const roleOptions = ['all', 'user', 'staff', 'officer']

  // Get current counts for role limits
  const getCitizenCount = () => users.filter(user => user.role === 'user').length
  const getStaffCount = () => users.filter(user => user.role === 'staff').length
  const getOfficerCount = () => users.filter(user => user.role === 'officer').length

  // Check if role limits are reached
  const isStaffLimitReached = getStaffCount() >= 2
  const isOfficerLimitReached = getOfficerCount() >= 1

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex flex-1">
          <div className="hidden md:block w-64">
            <SkeletonLoader type="card" className="h-full" />
          </div>
          <div className="flex-1 p-6">
            <SkeletonLoader type="card" className="h-full" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      {/* Mobile sidebar */}
      <div className="md:hidden">
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 flex">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  type="button"
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="sr-only">Close sidebar</span>
                  <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                </button>
              </div>
              <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                <Sidebar role="Officer" />
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex flex-1">
        <div className="hidden md:block w-64">
          <Sidebar role="Officer" />
        </div>
        
        <main className="flex-1 p-6">
          <div className="md:hidden mb-4">
            <button
              type="button"
              className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          
          <div className="mb-6">
            <h1 className="text-3xl font-heading font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-2">Manage citizen, staff, and officer accounts</p>
          </div>

          {/* Role Limits Info */}
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <InformationCircleIcon className="h-5 w-5 text-blue-400 mr-2" />
              <h3 className="text-sm font-medium text-blue-800">Account Limits</h3>
            </div>
            <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="text-sm font-medium text-gray-900">Citizens</div>
                <div className="mt-1 text-2xl font-bold text-gray-900">Unlimited</div>
                <div className="mt-1 text-xs text-gray-500">Current: {getCitizenCount()}</div>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="text-sm font-medium text-gray-900">Staff</div>
                <div className="mt-1 text-2xl font-bold text-gray-900">2 Max</div>
                <div className={`mt-1 text-xs ${getStaffCount() >= 2 ? 'text-red-500' : 'text-gray-500'}`}>
                  Current: {getStaffCount()}/2
                </div>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="text-sm font-medium text-gray-900">Officers</div>
                <div className="mt-1 text-2xl font-bold text-gray-900">1 Max</div>
                <div className={`mt-1 text-xs ${getOfficerCount() >= 1 ? 'text-red-500' : 'text-gray-500'}`}>
                  Current: {getOfficerCount()}/1
                </div>
              </div>
            </div>
          </div>
          
          <Card>
            <div className="mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <h2 className="text-xl font-heading font-semibold text-gray-900">User Directory</h2>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <SearchBar 
                    onSearch={handleSearch} 
                    placeholder="Search users..." 
                    className="w-full sm:w-64"
                  />
                  
                  <select 
                    value={statusFilter}
                    onChange={(e) => handleStatusFilter(e.target.value)}
                    className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {statusOptions.map(option => (
                      <option key={option} value={option} className="bg-white">
                        {option === 'all' ? 'All Statuses' : option.charAt(0).toUpperCase() + option.slice(1)}
                      </option>
                    ))}
                  </select>
                  
                  <select 
                    value={roleFilter}
                    onChange={(e) => handleRoleFilter(e.target.value)}
                    className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {roleOptions.map(option => (
                      <option key={option} value={option} className="bg-white">
                        {option === 'all' ? 'All Roles' : option.charAt(0).toUpperCase() + option.slice(1)}
                      </option>
                    ))}
                  </select>
                  
                  <button
                    onClick={handleCreateUser}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center"
                  >
                    <UserPlusIcon className="h-4 w-4 mr-1" />
                    Add User
                  </button>
                </div>
              </div>
              
              {loading ? (
                <SkeletonLoader type="table" />
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                    <UserGroupIcon className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                  <p className="text-gray-500">
                    {searchQuery || statusFilter !== 'all' || roleFilter !== 'all'
                      ? 'Try adjusting your search or filter criteria'
                      : 'No users in the system'}
                  </p>
                  {(searchQuery || statusFilter !== 'all' || roleFilter !== 'all') && (
                    <button
                      onClick={() => {
                        setSearchQuery('')
                        setStatusFilter('all')
                        setRoleFilter('all')
                        setFilteredUsers(users)
                      }}
                      className="mt-4 bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Clear filters
                    </button>
                  )}
                  <button
                    onClick={handleCreateUser}
                    className="mt-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Create your first user
                  </button>
                </div>
              ) : (
                <Table>
                  <Table.Head>
                    <Table.HeadCell>User</Table.HeadCell>
                    <Table.HeadCell>Role</Table.HeadCell>
                    <Table.HeadCell>Department</Table.HeadCell>
                    <Table.HeadCell>Status</Table.HeadCell>
                    <Table.HeadCell>Created</Table.HeadCell>
                    <Table.HeadCell className="text-right">Actions</Table.HeadCell>
                  </Table.Head>
                  <Table.Body>
                    {filteredUsers.map((user) => (
                      <Table.Row key={user._id}>
                        <Table.Cell>
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                              <UserIcon className="h-6 w-6 text-indigo-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                              {user.employeeId && (
                                <div className="text-xs text-gray-400">ID: {user.employeeId}</div>
                              )}
                            </div>
                          </div>
                        </Table.Cell>
                        <Table.Cell>
                          <Badge variant={user.role === 'user' ? 'default' : user.role === 'staff' ? 'pending' : 'approved'}>
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell>
                          <div className="text-sm text-gray-900">
                            {user.department || 'N/A'}
                          </div>
                          {user.position && (
                            <div className="text-sm text-gray-500">
                              {user.position}
                            </div>
                          )}
                        </Table.Cell>
                        <Table.Cell>
                          <Badge variant={user.status === 'active' ? 'approved' : user.status === 'inactive' ? 'pending' : 'rejected'}>
                            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell className="text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </Table.Cell>
                        <Table.Cell className="text-right text-sm font-medium">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              )}
            </div>
          </Card>
        </main>
      </div>

      {/* User Modal */}
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Edit User' : 'Create New User'}
      >
        <Form onSubmit={handleSubmit}>
          {formError && (
            <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
              {formError}
            </div>
          )}

          <div className="space-y-4">
            <Form.Field label="Full Name" required>
              <Form.Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter full name"
              />
            </Form.Field>

            <Form.Field label="Email Address" required>
              <Form.Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter email address"
              />
            </Form.Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Field label="Role" required>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'user' | 'staff' | 'officer' })}
                  className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  disabled={editingUser !== null} // Can't change role when editing
                >
                  <option value="user">Citizen</option>
                  <option 
                    value="staff" 
                    disabled={isStaffLimitReached && editingUser === null}
                  >
                    Staff Member {isStaffLimitReached && editingUser === null ? '(Limit reached)' : ''}
                  </option>
                  <option 
                    value="officer" 
                    disabled={isOfficerLimitReached && editingUser === null}
                  >
                    Officer {isOfficerLimitReached && editingUser === null ? '(Limit reached)' : ''}
                  </option>
                </select>
              </Form.Field>

              <Form.Field label="Status" required>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' | 'suspended' })}
                  className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </Form.Field>
            </div>

            {(formData.role === 'staff' || formData.role === 'officer') && (
              <>
                <Form.Field label="Employee ID">
                  <Form.Input
                    type="text"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    placeholder="Enter employee ID"
                  />
                </Form.Field>

                <Form.Field label="Department">
                  <Form.Input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="Enter department"
                  />
                </Form.Field>

                <Form.Field label="Position">
                  <Form.Input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    placeholder="Enter position"
                  />
                </Form.Field>
              </>
            )}
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              disabled={
                (formData.role === 'staff' && isStaffLimitReached && editingUser === null) ||
                (formData.role === 'officer' && isOfficerLimitReached && editingUser === null)
              }
            >
              {editingUser ? 'Update User' : 'Create User'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  )
}