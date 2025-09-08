'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'

export default function TestSessionPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [sessionInfo, setSessionInfo] = useState<any>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (session?.user) {
      setSessionInfo(session)
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex justify-center items-center h-screen">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 w-full">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-heading font-bold text-gray-900 mb-6">Session Test</h1>
          
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-heading font-semibold text-gray-900 mb-4">Session Information</h2>
            {sessionInfo ? (
              <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
                {JSON.stringify(sessionInfo, null, 2)}
              </pre>
            ) : (
              <p>No session information available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}