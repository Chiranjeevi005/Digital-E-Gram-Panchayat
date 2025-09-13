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
  const staffUsers = users.filter(user => user.role === 'staff' || user.role === 'Staff').length
  const citizenUsers = users.filter(user => user.role === 'user' || user.role === 'citizen' || user.role === 'Citizens').length

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
                <Sidebar role="Officer" />
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        <div className="hidden md:block w-64 flex-shrink-0">
          <Sidebar role="Officer" />
        </div>
        
        <main className="flex-1 overflow-y-auto">
          <div className="md:hidden mb-3 px-3 pt-3">
            <button
              type="button"
              className="-ml-0.5 -mt-0.5 h-10 w-10 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          
          <div className="bg-white shadow">
            <div className="max-w-7xl mx-auto py-3 sm:py-4 px-3 sm:px-4">
              <h1 className="text-xl sm:text-2xl font-heading font-bold text-gray-900">Officer Dashboard</h1>
              <p className="mt-1 text-gray-600 text-xs sm:text-sm">Welcome, {session?.user?.name}</p>
            </div>
          </div>

          <div className="max-w-7xl mx-auto py-4 sm:px-4">
            <div className="px-2 sm:px-0">
              {/* Stats Overview - Responsive grid for mobile */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                <StatCard 
                  title="Total Apps" 
                  value={totalApplications} 
                  icon={<DocumentTextIcon className="h-4 w-4 sm:h-5 sm:w-5" />} 
                  color="blue" 
                />
                <StatCard 
                  title="Pending" 
                  value={pendingApplications} 
                  icon={<ClockIcon className="h-4 w-4 sm:h-5 sm:w-5" />} 
                  color="yellow" 
                />
                <StatCard 
                  title="Approved" 
                  value={approvedApplications} 
                  icon={<CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5" />} 
                  color="green" 
                />
                <StatCard 
                  title="Active Services" 
                  value={activeServices} 
                  icon={<BuildingOfficeIcon className="h-4 w-4 sm:h-5 sm:w-5" />} 
                  color="purple" 
                />
              </div>
              
              {/* Services and Applications Overview - Stacked on mobile */}
              <div className="grid grid-cols-1 gap-4 sm:gap-6 mb-6">
                {/* Services Management */}
                <Card className="w-full">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                    <h3 className="text-base sm:text-lg font-heading font-semibold text-gray-900">Services Management</h3>
                    <button
                      onClick={() => router.push('/officer/services')}
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-medium hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 whitespace-nowrap"
                    >
                      Manage Services
                    </button>
                  </div>
                  {servicesLoading ? (
                    <SkeletonLoader type="card" className="h-24 sm:h-32" />
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-xs sm:text-sm font-medium text-gray-700">Active Services</span>
                          <span className="text-xs sm:text-sm font-medium text-gray-700">{activeServices} of {services.length}</span>
                        </div>
                        <ProgressBar 
                          value={activeServices} 
                          max={services.length} 
                          showPercentage 
                          className="h-1.5 sm:h-2"
                        />
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-gray-50 rounded-lg p-2 text-center">
                          <p className="text-[0.6rem] sm:text-xs text-gray-600">Total</p>
                          <p className="text-base sm:text-lg font-bold text-gray-900">{services.length}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-2 text-center">
                          <p className="text-[0.6rem] sm:text-xs text-gray-600">Active</p>
                          <p className="text-base sm:text-lg font-bold text-green-600">{activeServices}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-2 text-center">
                          <p className="text-[0.6rem] sm:text-xs text-gray-600">Inactive</p>
                          <p className="text-base sm:text-lg font-bold text-gray-600">{inactiveServices}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
                
                {/* User Management */}
                <Card className="w-full">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                    <h3 className="text-base sm:text-lg font-heading font-semibold text-gray-900">User Management</h3>
                    <button
                      onClick={() => router.push('/officer/users')}
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-medium hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 whitespace-nowrap"
                    >
                      Manage Users
                    </button>
                  </div>
                  {usersLoading ? (
                    <SkeletonLoader type="card" className="h-24 sm:h-32" />
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-xs sm:text-sm font-medium text-gray-700">User Distribution</span>
                          <span className="text-xs sm:text-sm font-medium text-gray-700">{totalUsers} total</span>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <div className="flex justify-between text-[0.6rem] sm:text-xs text-gray-600 mb-1">
                              <span>Citizens</span>
                              <span>{citizenUsers}</span>
                            </div>
                            <ProgressBar 
                              value={citizenUsers} 
                              max={totalUsers} 
                              className="h-1.5 sm:h-2"
                            />
                          </div>
                          <div>
                            <div className="flex justify-between text-[0.6rem] sm:text-xs text-gray-600 mb-1">
                              <span>Staff</span>
                              <span>{staffUsers}</span>
                            </div>
                            <ProgressBar 
                              value={staffUsers} 
                              max={totalUsers} 
                              className="h-1.5 sm:h-2"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-gray-50 rounded-lg p-2 text-center">
                          <p className="text-[0.6rem] sm:text-xs text-gray-600">Total Users</p>
                          <p className="text-base sm:text-lg font-bold text-gray-900">{totalUsers}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-2 text-center">
                          <p className="text-[0.6rem] sm:text-xs text-gray-600">Staff Members</p>
                          <p className="text-base sm:text-lg font-bold text-indigo-600">{staffUsers}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              </div>
              
              {/* Applications and Approvals - Full width on mobile */}
              <div className="grid grid-cols-1 gap-4 sm:gap-6 mb-6">
                {/* Applications Overview */}
                <Card className="w-full">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                    <h3 className="text-base sm:text-lg font-heading font-semibold text-gray-900">Applications Overview</h3>
                    <button
                      onClick={() => router.push('/officer/applications')}
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-medium hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 whitespace-nowrap"
                    >
                      View All
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <StatCard 
                        title="Total" 
                        value={totalApplications} 
                        icon={<DocumentTextIcon className="h-3 w-3" />}
                        size="sm"
                      />
                      <StatCard 
                        title="Pending" 
                        value={pendingApplications} 
                        icon={<ClockIcon className="h-3 w-3" />}
                        color="yellow"
                        size="sm"
                      />
                      <StatCard 
                        title="In Progress" 
                        value={inProgressApplications} 
                        icon={<UserGroupIcon className="h-3 w-3" />}
                        color="purple"
                        size="sm"
                      />
                      <StatCard 
                        title="Completed" 
                        value={approvedApplications + rejectedApplications} 
                        icon={<CheckCircleIcon className="h-3 w-3" />}
                        color="green"
                        size="sm"
                      />
                    </div>
                    
                    <div className="pt-2">
                      <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-2">Status Distribution</h4>
                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between text-[0.6rem] sm:text-xs text-gray-600 mb-1">
                            <span>Pending</span>
                            <span>{pendingApplications}</span>
                          </div>
                          <ProgressBar 
                            value={pendingApplications} 
                            max={totalApplications} 
                            className="h-1.5 sm:h-2"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-[0.6rem] sm:text-xs text-gray-600 mb-1">
                            <span>In Progress</span>
                            <span>{inProgressApplications}</span>
                          </div>
                          <ProgressBar 
                            value={inProgressApplications} 
                            max={totalApplications} 
                            className="h-1.5 sm:h-2"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-[0.6rem] sm:text-xs text-gray-600 mb-1">
                            <span>Approved</span>
                            <span>{approvedApplications}</span>
                          </div>
                          <ProgressBar 
                            value={approvedApplications} 
                            max={totalApplications} 
                            className="h-1.5 sm:h-2"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-[0.6rem] sm:text-xs text-gray-600 mb-1">
                            <span>Rejected</span>
                            <span>{rejectedApplications}</span>
                          </div>
                          <ProgressBar 
                            value={rejectedApplications} 
                            max={totalApplications} 
                            className="h-1.5 sm:h-2"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
                
                {/* Recent Applications */}
                <Card className="w-full">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                    <h3 className="text-base sm:text-lg font-heading font-semibold text-gray-900">Recent Applications</h3>
                    <button
                      onClick={() => router.push('/officer/applications')}
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-medium hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 whitespace-nowrap"
                    >
                      View All
                    </button>
                  </div>
                  {applicationsLoading ? (
                    <SkeletonLoader type="table" />
                  ) : applications.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-gray-500 text-sm">No applications found</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-2 py-2 text-left text-[0.6rem] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                            <th scope="col" className="px-2 py-2 text-left text-[0.6rem] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
                            <th scope="col" className="px-2 py-2 text-left text-[0.6rem] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-2 py-2 text-right text-[0.6rem] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {applications.slice(0, 5).map((application) => (
                            <tr key={application._id}>
                              <td className="px-2 py-2 whitespace-nowrap">
                                <div className="text-[0.6rem] sm:text-xs font-medium text-gray-900 truncate max-w-[60px] sm:max-w-[100px]">{application.service?.name}</div>
                              </td>
                              <td className="px-2 py-2">
                                <div className="text-[0.6rem] sm:text-xs text-gray-900 truncate max-w-[60px]">{application.applicant?.name}</div>
                              </td>
                              <td className="px-2 py-2 whitespace-nowrap">
                                <Badge variant={application.status}>
                                  {application.status}
                                </Badge>
                              </td>
                              <td className="px-2 py-2 whitespace-nowrap text-right text-[0.6rem] sm:text-xs font-medium">
                                <button
                                  onClick={() => router.push(`/officer/applications/${application._id}`)}
                                  className="text-indigo-600 hover:text-indigo-900"
                                >
                                  View
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}