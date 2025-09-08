'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'
import Card from '@/components/Card'
import Table from '@/components/Table'
import Badge from '@/components/Badge'
import SearchBar from '@/components/SearchBar'
import SkeletonLoader from '@/components/SkeletonLoader'
import StatCard from '@/components/StatCard'
import ProgressBar from '@/components/ProgressBar'
import { 
  DocumentTextIcon, 
  BuildingOfficeIcon, 
  UsersIcon, 
  ChartBarIcon,
  ClipboardIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserGroupIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline'

// Disable static generation for this page
export const dynamic = 'force-dynamic'

interface ApplicationType {
  _id: string
  service: {
    name: string
  }
  applicant: {
    name: string
    email: string
  }
  status: 'pending' | 'in-progress' | 'approved' | 'rejected'
  assignedTo?: {
    name: string
  }
  submittedAt: string
}

interface ServiceType {
  _id: string
  name: string
  description: string
  processingTime: number
  isActive: boolean
}

interface UserType {
  _id: string
  name: string
  email: string
  role: string
}

export default function OfficerDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [applications, setApplications] = useState<ApplicationType[]>([])
  const [services, setServices] = useState<ServiceType[]>([])
  const [users, setUsers] = useState<UserType[]>([])
  const [loading, setLoading] = useState(true)
  const [applicationsLoading, setApplicationsLoading] = useState(true)
  const [servicesLoading, setServicesLoading] = useState(true)
  const [usersLoading, setUsersLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // Set isClient to true after component mounts to avoid hydration issues
  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (status === 'loading') return; // Wait for session to load
    
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (session?.user && (session.user as any).role && (session.user as any).role !== 'officer') {
      // Redirect if not officer
      router.push(`/${(session.user as any).role}/dashboard`)
    } else if (session?.user) {
      fetchDashboardData()
    }
  }, [session, status, router])

  const fetchDashboardData = async () => {
    try {
      // Fetch applications
      setApplicationsLoading(true)
      const appsResponse = await fetch('/api/applications')
      const appsData = await appsResponse.json()
      
      if (appsResponse.ok) {
        setApplications(appsData)
      }
      
      // Fetch services
      setServicesLoading(true)
      const servicesResponse = await fetch('/api/services')
      const servicesData = await servicesResponse.json()
      
      if (servicesResponse.ok) {
        setServices(servicesData)
      }
      
      // Fetch users
      setUsersLoading(true)
      const usersResponse = await fetch('/api/users')
      const usersData = await usersResponse.json()
      
      if (usersResponse.ok) {
        setUsers(usersData)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setApplicationsLoading(false)
      setServicesLoading(false)
      setUsersLoading(false)
      setLoading(false)
    }
  }

  const updateApplicationStatus = async (applicationId: string, status: 'pending' | 'in-progress' | 'approved' | 'rejected', assignedTo: string | undefined = undefined, remarks = '') => {
    try {
      const updateData: any = { status }
      if (assignedTo) updateData.assignedTo = assignedTo
      if (remarks) updateData.remarks = remarks
      
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      const data = await response.json()

      if (response.ok) {
        // Update the local state
        setApplications(prev => 
          prev.map(app => 
            app._id === applicationId ? { ...app, status, remarks, assignedTo: assignedTo ? { name: assignedTo } : undefined } : app
          )
        )
      } else {
        throw new Error(data.error || 'Failed to update application')
      }
    } catch (error: any) {
      console.error('Error updating application:', error)
      // Show error in a better way in a real app
      alert('Failed to update application status')
    }
  }

  // Calculate statistics
  const totalApplications = applications.length
  const pendingApplications = applications.filter(app => app.status === 'pending').length
  const inProgressApplications = applications.filter(app => app.status === 'in-progress').length
  const approvedApplications = applications.filter(app => app.status === 'approved').length
  const rejectedApplications = applications.filter(app => app.status === 'rejected').length
  
  const activeServices = services.filter(service => service.isActive).length
  const inactiveServices = services.filter(service => !service.isActive).length
  
  const totalUsers = users.length
  const staffUsers = users.filter(user => user.role === 'staff').length
  const citizenUsers = users.filter(user => user.role === 'user').length

  // Don't render anything on the server to avoid hydration issues
  if (!isClient) {
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
                <Sidebar role="officer" />
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        <div className="hidden md:block w-64 flex-shrink-0">
          <Sidebar role="officer" />
        </div>
        
        <main className="flex-1 overflow-y-auto">
          <div className="md:hidden mb-4 px-4 pt-4">
            <button
              type="button"
              className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          
          <div className="bg-white shadow">
            <div className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
              <h1 className="text-2xl sm:text-3xl font-heading font-bold text-gray-900">Officer Dashboard</h1>
              <p className="mt-1 sm:mt-2 text-gray-600 text-sm sm:text-base">Welcome, {session?.user?.name}</p>
            </div>
          </div>

          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              {/* Stats Overview */}
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <StatCard 
                  title="Total Applications" 
                  value={totalApplications} 
                  icon={<DocumentTextIcon className="h-5 w-5 sm:h-6 sm:w-6" />} 
                  color="blue" 
                />
                <StatCard 
                  title="Pending" 
                  value={pendingApplications} 
                  icon={<ClockIcon className="h-5 w-5 sm:h-6 sm:w-6" />} 
                  color="yellow" 
                />
                <StatCard 
                  title="Approved" 
                  value={approvedApplications} 
                  icon={<CheckCircleIcon className="h-5 w-5 sm:h-6 sm:w-6" />} 
                  color="green" 
                />
                <StatCard 
                  title="Active Services" 
                  value={activeServices} 
                  icon={<BuildingOfficeIcon className="h-5 w-5 sm:h-6 sm:w-6" />} 
                  color="purple" 
                />
              </div>
              
              {/* Services and Applications Overview */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-8">
                {/* Services Management */}
                <Card title="Services Management" actions={
                  <button
                    onClick={() => router.push('/officer/services')}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-3 py-1 rounded-md text-sm font-medium hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Manage Services
                  </button>
                }>
                  {servicesLoading ? (
                    <SkeletonLoader type="card" className="h-32" />
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">Active Services</span>
                          <span className="text-sm font-medium text-gray-700">{activeServices} of {services.length}</span>
                        </div>
                        <ProgressBar 
                          value={activeServices} 
                          max={services.length} 
                          showPercentage 
                        />
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 sm:gap-4">
                        <div className="bg-gray-50 rounded-lg p-2 sm:p-3 text-center">
                          <p className="text-xs sm:text-sm text-gray-600">Total</p>
                          <p className="text-lg sm:text-xl font-bold text-gray-900">{services.length}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-2 sm:p-3 text-center">
                          <p className="text-xs sm:text-sm text-gray-600">Active</p>
                          <p className="text-lg sm:text-xl font-bold text-green-600">{activeServices}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-2 sm:p-3 text-center">
                          <p className="text-xs sm:text-sm text-gray-600">Inactive</p>
                          <p className="text-lg sm:text-xl font-bold text-gray-600">{inactiveServices}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
                
                {/* User Management */}
                <Card title="User Management" actions={
                  <button
                    onClick={() => router.push('/officer/users')}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-3 py-1 rounded-md text-sm font-medium hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Manage Users
                  </button>
                }>
                  {usersLoading ? (
                    <SkeletonLoader type="card" className="h-32" />
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">User Distribution</span>
                          <span className="text-sm font-medium text-gray-700">{totalUsers} total</span>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-xs text-gray-600 mb-1">
                              <span>Citizens</span>
                              <span>{citizenUsers}</span>
                            </div>
                            <ProgressBar 
                              value={citizenUsers} 
                              max={totalUsers} 
                              className="h-2"
                            />
                          </div>
                          <div>
                            <div className="flex justify-between text-xs text-gray-600 mb-1">
                              <span>Staff</span>
                              <span>{staffUsers}</span>
                            </div>
                            <ProgressBar 
                              value={staffUsers} 
                              max={totalUsers} 
                              className="h-2"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                          <p className="text-sm text-gray-600">Total Users</p>
                          <p className="text-xl font-bold text-gray-900">{totalUsers}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                          <p className="text-sm text-gray-600">Staff Members</p>
                          <p className="text-xl font-bold text-indigo-600">{staffUsers}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              </div>
              
              {/* Applications and Approvals */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-8">
                {/* Applications Overview */}
                <Card title="Applications Overview" actions={
                  <button
                    onClick={() => router.push('/officer/applications')}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-3 py-1 rounded-md text-sm font-medium hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    View All
                  </button>
                }>
                  {applicationsLoading ? (
                    <SkeletonLoader type="card" className="h-32" />
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">Application Status</span>
                          <span className="text-sm font-medium text-gray-700">{totalApplications} total</span>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-xs text-gray-600 mb-1">
                              <span>Pending</span>
                              <span>{pendingApplications}</span>
                            </div>
                            <ProgressBar 
                              value={pendingApplications} 
                              max={totalApplications} 
                              className="h-2"
                            />
                          </div>
                          <div>
                            <div className="flex justify-between text-xs text-gray-600 mb-1">
                              <span>In Progress</span>
                              <span>{inProgressApplications}</span>
                            </div>
                            <ProgressBar 
                              value={inProgressApplications} 
                              max={totalApplications} 
                              className="h-2"
                            />
                          </div>
                          <div>
                            <div className="flex justify-between text-xs text-gray-600 mb-1">
                              <span>Approved</span>
                              <span>{approvedApplications}</span>
                            </div>
                            <ProgressBar 
                              value={approvedApplications} 
                              max={totalApplications} 
                              className="h-2"
                            />
                          </div>
                          <div>
                            <div className="flex justify-between text-xs text-gray-600 mb-1">
                              <span>Rejected</span>
                              <span>{rejectedApplications}</span>
                            </div>
                            <ProgressBar 
                              value={rejectedApplications} 
                              max={totalApplications} 
                              className="h-2"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
                
                {/* Approvals Panel */}
                <Card title="Pending Escalations" actions={
                  <button
                    onClick={() => router.push('/officer/applications?status=pending')}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-3 py-1 rounded-md text-sm font-medium hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    View All
                  </button>
                }>
                  {applicationsLoading ? (
                    <SkeletonLoader type="table" />
                  ) : applications.filter(app => app.status === 'pending').length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-gray-500">No pending escalations</p>
                    </div>
                  ) : (
                    <Table>
                      <Table.Head>
                        <Table.HeadCell>Service</Table.HeadCell>
                        <Table.HeadCell>Applicant</Table.HeadCell>
                        <Table.HeadCell>Submitted</Table.HeadCell>
                        <Table.HeadCell className="text-right">Actions</Table.HeadCell>
                      </Table.Head>
                      <Table.Body>
                        {applications
                          .filter(app => app.status === 'pending')
                          .slice(0, 3)
                          .map((application) => (
                            <Table.Row key={application._id}>
                              <Table.Cell>
                                <div className="text-sm font-medium text-gray-900">{application.service?.name}</div>
                              </Table.Cell>
                              <Table.Cell>
                                <div className="text-sm text-gray-900">{application.applicant?.name}</div>
                                <div className="text-sm text-gray-500">{application.applicant?.email}</div>
                              </Table.Cell>
                              <Table.Cell className="text-sm text-gray-500">
                                {new Date(application.submittedAt).toLocaleDateString()}
                              </Table.Cell>
                              <Table.Cell className="text-right text-sm font-medium">
                                <button
                                  onClick={() => router.push(`/officer/applications/${application._id}`)}
                                  className="text-indigo-600 hover:text-indigo-900"
                                >
                                  Review
                                </button>
                              </Table.Cell>
                            </Table.Row>
                          ))}
                      </Table.Body>
                    </Table>
                  )}
                </Card>
              </div>
              
              {/* Recent Applications */}
              <Card title="Recent Applications" actions={
                <button
                  onClick={() => router.push('/officer/applications')}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-3 py-1 rounded-md text-sm font-medium hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  View All
                </button>
              }>
                {applicationsLoading ? (
                  <SkeletonLoader type="table" />
                ) : applications.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No applications found.</p>
                  </div>
                ) : (
                  <Table>
                    <Table.Head>
                      <Table.HeadCell>Service</Table.HeadCell>
                      <Table.HeadCell>Applicant</Table.HeadCell>
                      <Table.HeadCell>Status</Table.HeadCell>
                      <Table.HeadCell>Submitted</Table.HeadCell>
                      <Table.HeadCell className="text-right">Actions</Table.HeadCell>
                    </Table.Head>
                    <Table.Body>
                      {applications.slice(0, 5).map((application) => (
                        <Table.Row key={application._id}>
                          <Table.Cell>
                            <div className="text-sm font-medium text-gray-900">{application.service?.name}</div>
                          </Table.Cell>
                          <Table.Cell>
                            <div className="text-sm text-gray-900">{application.applicant?.name}</div>
                            <div className="text-sm text-gray-500">{application.applicant?.email}</div>
                          </Table.Cell>
                          <Table.Cell>
                            <Badge variant={application.status}>
                              {application.status}
                            </Badge>
                          </Table.Cell>
                          <Table.Cell className="text-sm text-gray-500">
                            {new Date(application.submittedAt).toLocaleDateString()}
                          </Table.Cell>
                          <Table.Cell className="text-right text-sm font-medium">
                            <button
                              onClick={() => router.push(`/officer/applications/${application._id}`)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              View
                            </button>
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table>
                )}
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}