'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Card from '@/components/Card'
import Button from '@/components/Button'
import { generatePDF, generateJPG, downloadBlob, showNotification } from '@/lib/documentGenerator'
import { showDownloadCompletedNotification, showDownloadErrorNotification } from '@/lib/notificationUtils'

export default function TestDocumentPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isGenerating, setIsGenerating] = useState(false)

  // Sample application data for testing
  const sampleData = {
    fullName: "John Doe",
    aadharNumber: "1234-5678-9012",
    address: "123 Main Street, Village Name, District",
    phoneNumber: "9876543210",
    email: "john.doe@example.com",
    serviceType: "Birth Certificate",
    purpose: "Personal Records",
    additionalNotes: "Urgent requirement for passport application"
  }

  const handleGeneratePDF = async () => {
    setIsGenerating(true)
    try {
      const blob = await generatePDF(sampleData, "Birth Certificate Application", "John Doe")
      // Updated filename to only include service name without applicant name
      downloadBlob(blob, "GramPanchayat_Birth_Certificate_Application.pdf")
      
      // Show success notification
      await showDownloadCompletedNotification("Birth Certificate Application", "pdf")
    } catch (error) {
      console.error("Error generating PDF:", error)
      
      // Show error notification
      await showDownloadErrorNotification()
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerateJPG = async () => {
    setIsGenerating(true)
    try {
      const blob = await generateJPG(sampleData, "Birth Certificate Application", "John Doe")
      // Updated filename to only include service name without applicant name
      downloadBlob(blob, "GramPanchayat_Birth_Certificate_Application.jpg")
      
      // Show success notification
      await showDownloadCompletedNotification("Birth Certificate Application", "jpg")
    } catch (error) {
      console.error("Error generating JPG:", error)
      
      // Show error notification
      await showDownloadErrorNotification()
    } finally {
      setIsGenerating(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex justify-center items-center h-screen">Loading...</div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    router.push('/auth/signin')
    return null
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-100">
      <Navbar />
      
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-heading font-bold text-neutral-900">Test Document Generation</h1>
        </div>
      </div>

      <main className="flex-grow max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 w-full">
        <div className="px-4 py-6 sm:px-0">
          <Card>
            <div className="mb-6">
              <h2 className="text-xl font-heading font-bold text-neutral-900 mb-4">Test Document Generation</h2>
              <p className="text-neutral-600">
                This page allows you to test the document generation functionality for PDF and JPG formats.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-neutral-50 rounded-lg p-6">
                <h3 className="font-heading font-semibold text-neutral-900 mb-4">Sample Data</h3>
                <div className="space-y-2">
                  {Object.entries(sampleData).map(([key, value]) => (
                    <div key={key} className="flex">
                      <span className="text-sm text-neutral-600 capitalize w-1/3">
                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                      </span>
                      <span className="text-neutral-900 text-sm">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-neutral-50 rounded-lg p-6">
                <h3 className="font-heading font-semibold text-neutral-900 mb-4">Generate Documents</h3>
                <p className="text-neutral-600 text-sm mb-4">
                  Click the buttons below to generate and download sample documents in PDF or JPG format.
                </p>
                
                <div className="flex flex-col space-y-4">
                  <Button
                    variant="primary"
                    onClick={handleGeneratePDF}
                    disabled={isGenerating}
                  >
                    {isGenerating ? 'Generating...' : 'Generate PDF'}
                  </Button>
                  
                  <Button
                    variant="secondary"
                    onClick={handleGenerateJPG}
                    disabled={isGenerating}
                  >
                    {isGenerating ? 'Generating...' : 'Generate JPG'}
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="font-medium text-blue-800">Note</h3>
                  <p className="text-blue-700 text-sm mt-1">
                    This is a test page to verify document generation functionality. In the actual application, 
                    documents will be generated from real application data and will follow the same format.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}