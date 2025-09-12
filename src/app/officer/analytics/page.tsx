'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'
import Card from '@/components/Card'
import Chart from '@/components/Chart'
import StatCard from '@/components/StatCard'
import { 
  Bars3Icon, 
  XMarkIcon,
  DocumentTextIcon,
  UsersIcon,
  BuildingOfficeIcon,
  ArrowDownTrayIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'

// Mock data for charts
const applicationStatusData = {
  labels: ['Pending', 'In Progress', 'Approved', 'Rejected'],
  datasets: [
    {
      label: 'Applications',
      data: [120, 80, 250, 40]
    }
  ]
}

const serviceUsageData = {
  labels: ['Birth Certificate', 'Death Certificate', 'Income Certificate', 'Residence Certificate', 'Property Tax'],
  datasets: [
    {
      label: 'Applications',
      data: [120, 95, 80, 75, 60]
    }
  ]
}

const monthlyApplicationsData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  datasets: [
    {
      label: 'Applications',
      data: [40, 55, 60, 70, 85, 90, 100, 110, 95, 80, 70, 60]
    }
  ]
}

export default function OfficerAnalytics() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
    totalUsers: 0,
    totalServices: 0,
    totalDownloads: 0,
    avgProcessingTime: 0
  })

  useEffect(() => {
    if (status === 'loading') return
    
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (session?.user && 'role' in session.user && session.user.role && session.user.role !== 'officer') {
      router.push(`/${session.user.role}/dashboard`)
    } else if (session?.user && stats.totalApplications === 0) {
      // Mock data for stats - only set if not already set
      setStats({
        totalApplications: 490,
        pendingApplications: 120,
        approvedApplications: 250,
        rejectedApplications: 40,
        totalUsers: 1250,
        totalServices: 25,
        totalDownloads: 320,
        avgProcessingTime: 2.5
      })
    }
  }, [session, status, router, stats.totalApplications])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex flex-1">
          <div className="hidden md:block w-64 bg-gray-200 animate-pulse"></div>
          <div className="flex-1 p-6">
            <div className="bg-white rounded-lg shadow animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-24 bg-gray-200 rounded"></div>
                ))}
              </div>
              <div className="h-64 bg-gray-200 rounded mb-6"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
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
            <h1 className="text-3xl font-heading font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-2">Comprehensive insights and performance metrics</p>
          </div>
          
          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard 
              title="Total Applications" 
              value={stats.totalApplications} 
              icon={<DocumentTextIcon className="h-6 w-6" />} 
              color="blue" 
            />
            <StatCard 
              title="Pending Applications" 
              value={stats.pendingApplications} 
              icon={<ClockIcon className="h-6 w-6" />} 
              color="yellow" 
            />
            <StatCard 
              title="Approved Applications" 
              value={stats.approvedApplications} 
              icon={<CheckCircleIcon className="h-6 w-6" />} 
              color="green" 
            />
            <StatCard 
              title="Rejected Applications" 
              value={stats.rejectedApplications} 
              icon={<XCircleIcon className="h-6 w-6" />} 
              color="red" 
            />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Application Status Distribution */}
            <Card title="Application Status Distribution">
              <Chart 
                type="pie" 
                data={applicationStatusData} 
              />
            </Card>
            
            {/* Service Usage */}
            <Card title="Top Services by Usage">
              <Chart 
                type="bar" 
                data={serviceUsageData} 
              />
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Monthly Applications */}
            <Card title="Monthly Applications Trend" className="lg:col-span-2">
              <Chart 
                type="line" 
                data={monthlyApplicationsData} 
              />
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <div className="flex justify-center mb-3">
                <UsersIcon className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.totalUsers}</h3>
              <p className="text-gray-600">Total Users</p>
            </Card>
            
            <Card className="text-center">
              <div className="flex justify-center mb-3">
                <BuildingOfficeIcon className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.totalServices}</h3>
              <p className="text-gray-600">Active Services</p>
            </Card>
            
            <Card className="text-center">
              <div className="flex justify-center mb-3">
                <ArrowDownTrayIcon className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.totalDownloads}</h3>
              <p className="text-gray-600">Total Downloads</p>
            </Card>
            
            <Card className="text-center">
              <div className="flex justify-center mb-3">
                <ChartBarIcon className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.avgProcessingTime} days</h3>
              <p className="text-gray-600">Avg. Processing Time</p>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}