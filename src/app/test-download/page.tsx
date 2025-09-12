'use client'

import { useState } from 'react'
import { generatePDF, generateJPG, downloadBlob } from '@/lib/documentGenerator'

export default function TestDownloadPage() {
  const [isGenerating, setIsGenerating] = useState(false)
  
  const testData = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1234567890',
    address: '123 Main St, City, State 12345',
    serviceType: 'Residence Certificate',
    purpose: 'Employment Verification',
    date: new Date().toISOString()
  }

  const handleTestDownload = async (fileType: 'pdf' | 'jpeg') => {
    setIsGenerating(true)
    try {
      let blob: Blob
      if (fileType === 'pdf') {
        blob = await generatePDF(testData, 'Test Service', 'John Doe')
      } else {
        blob = await generateJPG(testData, 'Test Service', 'John Doe')
      }
      
      const filename = `test_document_${new Date().getTime()}.${fileType}`
      downloadBlob(blob, filename)
    } catch (error) {
      console.error('Error generating document:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Document Download Test</h1>
        
        <div className="space-y-4">
          <button
            onClick={() => handleTestDownload('pdf')}
            disabled={isGenerating}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-300 ease-in-out disabled:opacity-50"
          >
            {isGenerating ? 'Generating PDF...' : 'Download Test PDF'}
          </button>
          
          <button
            onClick={() => handleTestDownload('jpeg')}
            disabled={isGenerating}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition duration-300 ease-in-out disabled:opacity-50"
          >
            {isGenerating ? 'Generating JPG...' : 'Download Test JPG'}
          </button>
        </div>
        
        <div className="mt-8 p-4 bg-blue-50 rounded-md">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">Test Data</h2>
          <pre className="text-sm text-gray-700 bg-white p-2 rounded overflow-x-auto">
            {JSON.stringify(testData, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}