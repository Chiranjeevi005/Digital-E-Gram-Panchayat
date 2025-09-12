'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'
import Card from '@/components/Card'
import { DocumentTextIcon } from '@heroicons/react/24/outline'

export default function TestDocument() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex flex-1">
          <div className="hidden md:block w-64">
            <div className="h-full bg-white border-r border-gray-200 animate-pulse"></div>
          </div>
          <div className="flex-1 p-6">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow p-6 animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-4 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    router.push('/auth/signin')
    return null
  }

  const handleGenerateTestDocument = async () => {
    setLoading(true)
    try {
      // In a real implementation, this would generate an actual document
      // For now, we'll just simulate the process
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Show success message or redirect to downloads
      alert('Test document generated successfully! In a real application, this would be available in your download history.')
    } catch (error) {
      console.error('Error generating test document:', error)
      alert('Failed to generate test document. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex flex-1">
        <div className="hidden md:block w-64">
          <Sidebar role="Citizens" />
        </div>
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-heading font-bold text-gray-900">Test Document Generation</h1>
              <p className="text-gray-600 mt-2">
                Generate a sample document to test the download functionality
              </p>
            </div>

            <Card>
              <div className="text-center py-12">
                <div className="mx-auto bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                  <DocumentTextIcon className="h-8 w-8 text-indigo-600" />
                </div>
                
                <h2 className="text-xl font-heading font-semibold text-gray-900 mb-2">Generate Test Document</h2>
                <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                  This will generate a sample document to test the download functionality. 
                  In a real application, this would create an actual PDF or other document format 
                  that you could download from your download history.
                </p>
                
                <button
                  onClick={handleGenerateTestDocument}
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-md text-sm font-medium hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {loading ? 'Generating...' : 'Generate Test Document'}
                </button>
                
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="text-lg font-heading font-semibold text-gray-900 mb-4">How It Works</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-indigo-600 font-bold text-lg mb-2">1</div>
                      <h4 className="font-medium text-gray-900 mb-2">Generate</h4>
                      <p className="text-sm text-gray-600">Click the button to generate a sample document</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-indigo-600 font-bold text-lg mb-2">2</div>
                      <h4 className="font-medium text-gray-900 mb-2">Process</h4>
                      <p className="text-sm text-gray-600">The system creates the document instantly</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-indigo-600 font-bold text-lg mb-2">3</div>
                      <h4 className="font-medium text-gray-900 mb-2">Download</h4>
                      <p className="text-sm text-gray-600">Access your document from download history</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}