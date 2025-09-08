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
import { 
  ClipboardIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  UserGroupIcon,
  ChartBarIcon,
  DocumentTextIcon,
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
  submittedAt: string
}

export default function StaffDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [applications, setApplications] = useState<ApplicationType[]>([])
  const [filteredApplications, setFilteredApplications] = useState<ApplicationType[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0
  })
  const [isClient, setIsClient] = useState(false)

  // Set isClient to true after component mounts to avoid hydration issues
  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (status === 'loading') return; // Wait for session to load
    
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (session?.user && 'role' in session.user && session.user.role && session.user.role !== 'staff') {
      // Redirect if not staff
      router.push(`/${session.user.role}/dashboard`)
    } else if (session?.user) {
      fetchApplications()
    }
  }, [session, status, router])

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/applications')
      const data = await response.json()
      if (response.ok) {
        setApplications(data)
        setFilteredApplications(data)
        // Calculate stats
        const total = data.length
        const pending = data.filter((app: ApplicationType) => app.status === 'pending').length
        const inProgress = data.filter((app: ApplicationType) => app.status === 'in-progress').length
        const completed = data.filter((app: ApplicationType) => 
          app.status === 'approved' || app.status === 'rejected').length
        setStats({ total, pending, inProgress, completed })
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    filterApplications(query, statusFilter)
  }

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status)
    filterApplications(searchQuery, status)
  }

  const filterApplications = (query: string, status: string) => {
    let result = applications
    
    // Filter by search query
    if (query) {
      const lowerQuery = query.toLowerCase()
      result = result.filter(app => 
        app.service.name.toLowerCase().includes(lowerQuery) ||
        app.applicant.name.toLowerCase().includes(lowerQuery) ||
        app.applicant.email.toLowerCase().includes(lowerQuery)
      )
    }
    
    // Filter by status
    if (status !== 'all') {
      result = result.filter(app => app.status === status)
    }
    
    setFilteredApplications(result)
  }

  const updateApplicationStatus = async (applicationId: string, status: 'in-progress' | 'approved' | 'rejected', remarks = '') => {
    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          remarks
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Update the local state
        setApplications(prev => 
          prev.map(app => 
            app._id === applicationId ? { ...app, status, remarks } : app
          )
        )
        
        // Also update filtered applications
        setFilteredApplications(prev => 
          prev.map(app => 
            app._id === applicationId ? { ...app, status, remarks } : app
          )
        )
        
        // Recalculate stats
        const total = applications.length
        const pending = applications.filter(app => app.status === 'pending').length
        const inProgress = applications.filter(app => app.status === 'in-progress').length
        const completed = applications.filter(app => 
          app.status === 'approved' || app.status === 'rejected').length
        setStats({ total, pending, inProgress, completed })
      } else {
        throw new Error(data.error || 'Failed to update application')
      }
    } catch (error: any) {
      console.error('Error updating application:', error)
      // Show error in a better way in a real app
      alert('Failed to update application status')
    }
  }

  const statusOptions = ['all', 'pending', 'in-progress', 'approved', 'rejected']

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
                <Sidebar role="staff" />
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        <div className="hidden md:block w-64 flex-shrink-0">
          <Sidebar role="staff" />
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
              <h1 className="text-2xl sm:text-3xl font-heading font-bold text-gray-900">Staff Dashboard</h1>
              <p className="mt-1 sm:mt-2 text-gray-600 text-sm sm:text-base">Welcome, {session?.user?.name}</p>
            </div>
          </div>

          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              {/* Stats Overview */}
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <StatCard 
                  title="Total Applications" 
                  value={stats.total} 
                  icon={<DocumentTextIcon className="h-5 w-5 sm:h-6 sm:w-6" />} 
                  color="blue" 
                />
                <StatCard 
                  title="Pending" 
                  value={stats.pending} 
                  icon={<ClockIcon className="h-5 w-5 sm:h-6 sm:w-6" />} 
                  color="yellow" 
                />
                <StatCard 
                  title="In Progress" 
                  value={stats.inProgress} 
                  icon={<UserGroupIcon className="h-5 w-5 sm:h-6 sm:w-6" />} 
                  color="purple" 
                />
                <StatCard 
                  title="Completed" 
                  value={stats.completed} 
                  icon={<CheckCircleIcon className="h-5 w-5 sm:h-6 sm:w-6" />} 
                  color="green" 
                />
              </div>
              
              {/* Applications Queue */}
              <Card>
                <div className="mb-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <h2 className="text-2xl font-heading font-bold text-gray-900">Applications Queue</h2>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      <SearchBar 
                        onSearch={handleSearch} 
                        placeholder="Search applications..." 
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
                    </div>
                  </div>
                  
                  {loading ? (
                    <SkeletonLoader type="table" />
                  ) : filteredApplications.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="mx-auto bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
                      <p className="text-gray-500">
                        {searchQuery || statusFilter !== 'all' 
                          ? 'Try adjusting your search or filter criteria' 
                          : 'No applications assigned to you'}
                      </p>
                      {(searchQuery || statusFilter !== 'all') && (
                        <button
                          onClick={() => {
                            setSearchQuery('')
                            setStatusFilter('all')
                            setFilteredApplications(applications)
                          }}
                          className="mt-4 bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Clear filters
                        </button>
                      )}
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
                        {filteredApplications.map((application) => (
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
                                onClick={() => router.push(`/staff/applications/${application._id}`)}
                                className="text-indigo-600 hover:text-indigo-900 mr-3"
                              >
                                View
                              </button>
                              {application.status === 'pending' && (
                                <button
                                  onClick={() => updateApplicationStatus(application._id, 'in-progress')}
                                  className="text-yellow-600 hover:text-yellow-900 mr-3"
                                >
                                  Start
                                </button>
                              )}
                              {application.status === 'in-progress' && (
                                <>
                                  <button
                                    onClick={() => updateApplicationStatus(application._id, 'approved')}
                                    className="text-green-600 hover:text-green-900 mr-3"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => updateApplicationStatus(application._id, 'rejected')}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                            </Table.Cell>
                          </Table.Row>
                        ))}
                      </Table.Body>
                    </Table>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}