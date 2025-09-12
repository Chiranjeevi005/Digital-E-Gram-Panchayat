'use client'

import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

export default function ForbiddenPage() {
  const router = useRouter()
  const { data: session } = useSession()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center">
        <div className="text-6xl font-bold text-red-600 mb-4">403</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Access Forbidden</h1>
        <p className="text-gray-600 mb-8">
          You don&apos;t have permission to access this page.
        </p>
        <div className="space-y-4">
          {session ? (
            <button
              onClick={() => router.back()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Go Back
            </button>
          ) : (
            <button
              onClick={() => router.push('/auth/signin')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign In
            </button>
          )}
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Home Page
          </button>
        </div>
      </div>
    </div>
  )
}