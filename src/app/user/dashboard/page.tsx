'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'
import Card from '@/components/Card'
import Table from '@/components/Table'
import Badge from '@/components/Badge'
import SkeletonLoader from '@/components/SkeletonLoader'
import StatCard from '@/components/StatCard'
import QuickAction from '@/components/QuickAction'
import Notification from '@/components/Notification'
import { 
  DocumentTextIcon, 
  ClipboardIcon, 
  ArrowDownTrayIcon, 
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserIcon,
  BuildingOfficeIcon,
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
  status: 'pending' | 'in-progress' | 'approved' | 'rejected'
  submittedAt: string
  downloadStatus?: 'pending' | 'processing' | 'ready' | 'completed'
}

export default function UserDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [applications, setApplications] = useState<ApplicationType[]>([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  })
  const [isClient, setIsClient] = useState(false)

  // Set isClient to true after component mounts to avoid hydration issues
  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    console.log('User dashboard session:', { status, session }) // Debug log
    if (status === 'loading') return; // Wait for session to load
    
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (session?.user && 'role' in session.user && session.user.role) {
      console.log('User role:', session.user.role) // Debug log
      // Check if user has the correct role
      // Handle both 'citizen' and 'user' roles for Google users
      if (session.user.role !== 'citizen' && session.user.role !== 'user') {
        // Redirect to appropriate dashboard based on role
        console.log('Redirecting to role dashboard:', session.user.role) // Debug log
        router.push(`/${session.user.role}/dashboard`)
      } else {
        // For citizens, fetch applications
        console.log('Fetching applications for citizen') // Debug log
        fetchApplications()
      }
    }
  }, [session, status, router])

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/applications')
      const data = await response.json()
      if (response.ok) {
        setApplications(data)
        // Calculate stats
        const total = data.length
        const pending = data.filter((app: ApplicationType) => app.status === 'pending').length
        const approved = data.filter((app: ApplicationType) => app.status === 'approved').length
        const rejected = data.filter((app: ApplicationType) => app.status === 'rejected').length
        setStats({ total, pending, approved, rejected })
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const quickServices = [
    { 
      name: 'Birth Certificate', 
      icon: <DocumentTextIcon className="h-6 w-6" />,
      onClick: () => router.push('/user/services?category=certificates')
    },
    { 
      name: 'Death Certificate', 
      icon: <DocumentTextIcon className="h-6 w-6" />,
      onClick: () => router.push('/user/services?category=certificates')
    },
    { 
      name: 'Government Schemes', 
      icon: <ChartBarIcon className="h-6 w-6" />,
      onClick: () => router.push('/user/services?category=schemes')
    },
    { 
      name: 'Grievance', 
      icon: <ChatBubbleLeftRightIcon className="h-6 w-6" />,
      onClick: () => router.push('/user/services?category=complaints')
    },
    { 
      name: 'Land Records', 
      icon: <ClipboardIcon className="h-6 w-6" />,
      onClick: () => router.push('/user/services?category=property')
    }
  ]

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

  // If user is not a citizen, don't render the dashboard
  if (session?.user && 'role' in session.user && session.user.role !== 'citizen' && session.user.role !== 'user') {
    return null; // Will be redirected by useEffect
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
                <Sidebar role="user" />
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex flex-1">
        <div className="hidden md:block w-64">
          <Sidebar role="user" />
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
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-gray-900">Citizen Dashboard</h1>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">
              Welcome, {session?.user?.name || session?.user?.email || 'User'}
            </p>
          </div>
          
          {/* Stats Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
            <StatCard 
              title="Total Applications" 
              value={stats.total} 
              icon={<ClipboardIcon className="h-5 w-5 sm:h-6 sm:w-6" />} 
              color="blue" 
            />
            <StatCard 
              title="Pending" 
              value={stats.pending} 
              icon={<ClockIcon className="h-5 w-5 sm:h-6 sm:w-6" />} 
              color="yellow" 
            />
            <StatCard 
              title="Approved" 
              value={stats.approved} 
              icon={<CheckCircleIcon className="h-5 w-5 sm:h-6 sm:w-6" />} 
              color="green" 
            />
            <StatCard 
              title="Rejected" 
              value={stats.rejected} 
              icon={<XCircleIcon className="h-5 w-5 sm:h-6 sm:w-6" />} 
              color="red" 
            />
          </div>
          
          {/* Notifications */}
          <div className="grid grid-cols-1 gap-6 mb-6">
            <Notification 
              title="New Scheme Available"
              message="Check out the new agricultural subsidy scheme for farmers in your district."
              type="info"
            />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Quick Apply Services */}
            <Card className="lg:col-span-2">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-heading font-semibold text-gray-900">Quick Apply Services</h2>
                <button
                  onClick={() => router.push('/user/services')}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  View All Services
                </button>
              </div>
              
              <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                {quickServices.map((service, index) => (
                  <button
                    key={index}
                    onClick={service.onClick}
                    className="bg-white rounded-lg p-3 sm:p-4 flex flex-col items-center justify-center border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="mb-2 text-indigo-600">{service.icon}</div>
                    <span className="text-xs sm:text-sm font-medium text-gray-900 text-center">{service.name}</span>
                  </button>
                ))}
              </div>
            </Card>
            
            {/* Instant Downloads */}
            <Card>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-heading font-semibold text-gray-900">Instant Downloads</h3>
                <ArrowDownTrayIcon className="h-5 w-5 text-gray-500" />
              </div>
              <p className="text-gray-600 mb-4 text-sm">
                Access your approved documents instantly
              </p>
              <button 
                onClick={() => router.push('/user/downloads')}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mb-2"
              >
                View Download History
              </button>
              <button 
                onClick={() => router.push('/user/test-document')}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Test Document Generation
              </button>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* My Applications */}
            <Card className="lg:col-span-2">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
                <h2 className="text-xl font-heading font-semibold text-gray-900">My Applications</h2>
                <button
                  onClick={() => router.push('/user/applications')}
                  className="bg-white text-gray-700 border border-gray-300 px-3 py-2 sm:px-4 sm:py-2 rounded-md text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 whitespace-nowrap"
                >
                  View All
                </button>
              </div>

              {loading ? (
                <SkeletonLoader type="table" />
              ) : applications.length === 0 ? (
                <div className="text-center py-8">
                  <div className="mx-auto bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 mb-4">You haven&apos;t applied for any services yet.</p>
                  <button
                    onClick={() => router.push('/user/services')}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Apply for a Service
                  </button>
                </div>
              ) : (
                <Table>
                  <Table.Head>
                    <Table.HeadCell>Service</Table.HeadCell>
                    <Table.HeadCell>Status</Table.HeadCell>
                    <Table.HeadCell>Submitted</Table.HeadCell>
                    <Table.HeadCell>Actions</Table.HeadCell>
                  </Table.Head>
                  <Table.Body>
                    {applications.slice(0, 5).map((application) => (
                      <Table.Row key={application._id}>
                        <Table.Cell>
                          <div className="text-sm font-medium text-gray-900">{application.service?.name}</div>
                        </Table.Cell>
                        <Table.Cell>
                          <Badge variant={application.status}>
                            {application.status}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell>
                          <div className="text-sm text-gray-500">
                            {new Date(application.submittedAt).toLocaleDateString()}
                          </div>
                        </Table.Cell>
                        <Table.Cell>
                          <button
                            onClick={() => router.push(`/user/applications/${application._id}`)}
                            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
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
            
            {/* Support & Notifications */}
            <div className="space-y-6">
              <Card>
                <h3 className="text-lg font-heading font-semibold text-gray-900 mb-4">Need Help?</h3>
                <p className="text-gray-600 mb-4 text-sm">
                  If you have any questions about the services or need assistance with your applications, our support team is here to help.
                </p>
                <button 
                  onClick={() => router.push('/user/services?category=complaints')}
                  className="w-full bg-gradient-to-r from-red-500 to-rose-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:from-red-600 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Contact Support
                </button>
              </Card>
              
              <Card>
                <h3 className="text-lg font-heading font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <QuickAction 
                    title="Update Profile"
                    description="Update your personal information"
                    icon={<UserIcon className="h-5 w-5" />}
                    onClick={() => router.push('/user/profile')}
                  />
                  <QuickAction 
                    title="View Services"
                    description="Browse all available services"
                    icon={<BuildingOfficeIcon className="h-5 w-5" />}
                    onClick={() => router.push('/user/services')}
                  />
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}