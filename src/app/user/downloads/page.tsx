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
import { showDownloadCompletedNotification, showDownloadErrorNotification } from '@/lib/notificationUtils'

interface DownloadHistoryType {
  _id: string
  service: {
    name: string
  }
  downloadType: 'instant' | 'processing'
  fileType: 'pdf' | 'jpeg'
  status: 'pending' | 'completed'
  createdAt: string
}

export default function DownloadHistory() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [downloads, setDownloads] = useState<DownloadHistoryType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return;
    
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (session?.user && 'role' in session.user && session.user.role && session.user.role !== 'user' && session.user.role !== 'citizen') {
      router.push(`/${session.user.role}/dashboard`)
    } else if (session?.user) {
      fetchDownloadHistory()
    }
  }, [session, status, router])

  const fetchDownloadHistory = async () => {
    try {
      const response = await fetch('/api/downloads')
      const data = await response.json()
      if (response.ok) {
        setDownloads(data)
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('Error fetching download history:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (download: DownloadHistoryType) => {
    try {
      // In a real implementation, this would trigger the actual download
      // For now, we'll just show a notification
      
      // Show success notification
      await showDownloadCompletedNotification(download.service.name, download.fileType)
    } catch (error) {
      console.error('Download error:', error)
      
      // Show error notification
      await showDownloadErrorNotification()
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex">
          <Sidebar role="user" />
          <div className="flex-grow max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 w-full">
            <div className="px-4 py-6 sm:px-0">
              <div className="mb-8">
                <div className="h-6 bg-neutral-200 rounded w-1/4 mb-4 animate-pulse"></div>
              </div>
              <SkeletonLoader type="table" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-100">
      <Navbar />
      
      <div className="flex-grow flex">
        <Sidebar role="user" />
        
        <main className="flex-grow max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 w-full">
          <div className="px-4 py-6 sm:px-0">
            <div className="mb-6">
              <h1 className="text-2xl font-heading font-bold text-neutral-900">Download History</h1>
              <p className="text-neutral-600 mt-1">View and re-download your documents</p>
            </div>
            
            <Card>
              {loading ? (
                <SkeletonLoader type="table" />
              ) : downloads.length === 0 ? (
                <div className="text-center py-12">
                  <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-neutral-900">No downloads yet</h3>
                  <p className="mt-1 text-sm text-neutral-500">
                    Documents you download will appear here.
                  </p>
                  <div className="mt-6">
                    <button
                      onClick={() => router.push('/user/services')}
                      className="btn-primary"
                    >
                      Browse Services
                    </button>
                  </div>
                </div>
              ) : (
                <Table>
                  <Table.Head>
                    <Table.HeadCell>Service</Table.HeadCell>
                    <Table.HeadCell>File Type</Table.HeadCell>
                    <Table.HeadCell>Status</Table.HeadCell>
                    <Table.HeadCell>Date</Table.HeadCell>
                    <Table.HeadCell>Actions</Table.HeadCell>
                  </Table.Head>
                  <Table.Body>
                    {downloads.map((download) => (
                      <Table.Row key={download._id}>
                        <Table.Cell className="font-medium text-neutral-900">
                          {download.service.name}
                        </Table.Cell>
                        <Table.Cell>
                          <Badge variant="default">
                            {download.fileType.toUpperCase()}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell>
                          <Badge 
                            variant={
                              download.status === 'completed' ? 'completed' : 'pending'
                            }
                          >
                            {download.status}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell>
                          {new Date(download.createdAt).toLocaleDateString()}
                        </Table.Cell>
                        <Table.Cell>
                          <button
                            onClick={() => handleDownload(download)}
                            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                          >
                            Download
                          </button>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              )}
            </Card>
            
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-blue-700">
                  <span className="font-semibold">Free Service Notice:</span> All document downloads are completely free of charge. 
                  You can re-download any document from this history page at any time.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}