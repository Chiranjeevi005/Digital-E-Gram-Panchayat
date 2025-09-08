'use client'

import { useState } from 'react'
import Card from '@/components/Card'
import Button from '@/components/Button'

interface DownloadModalProps {
  serviceName: string
  onClose: () => void
  onDownload: (option: 'instant' | 'processing', fileType: 'pdf' | 'jpeg') => void
}

export default function DownloadModal({
  serviceName,
  onClose,
  onDownload
}: DownloadModalProps) {
  const [selectedOption, setSelectedOption] = useState<'instant' | 'processing'>('instant')
  const [selectedFileType, setSelectedFileType] = useState<'pdf' | 'jpeg'>('pdf')
  const [isProcessing, setIsProcessing] = useState(false)

  const handleDownload = async () => {
    setIsProcessing(true)
    try {
      await onDownload(selectedOption, selectedFileType)
      onClose()
    } catch (error) {
      console.error('Download error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-heading font-semibold text-gray-900">Download Document</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="mb-6">
          <p className="text-neutral-600 mb-4">
            Your application for <span className="font-semibold">{serviceName}</span> has been approved.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-blue-700">
                <span className="font-semibold">Free Service:</span> All document downloads are completely free of charge.
              </p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-medium text-neutral-700 mb-2">Select Format</h4>
              <div className="flex space-x-4">
                <div 
                  className={`border rounded px-3 py-2 cursor-pointer flex-1 text-center ${
                    selectedFileType === 'pdf' 
                      ? 'border-indigo-500 bg-indigo-100' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedFileType('pdf')}
                >
                  <div className="flex items-center justify-center">
                    <input
                      type="radio"
                      checked={selectedFileType === 'pdf'}
                      onChange={() => setSelectedFileType('pdf')}
                      className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 mr-2"
                    />
                    <span className="text-sm font-medium">PDF</span>
                    <span className="text-xs text-neutral-500 ml-1">(Free)</span>
                  </div>
                </div>
                
                <div 
                  className={`border rounded px-3 py-2 cursor-pointer flex-1 text-center ${
                    selectedFileType === 'jpeg' 
                      ? 'border-indigo-500 bg-indigo-100' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedFileType('jpeg')}
                >
                  <div className="flex items-center justify-center">
                    <input
                      type="radio"
                      checked={selectedFileType === 'jpeg'}
                      onChange={() => setSelectedFileType('jpeg')}
                      className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 mr-2"
                    />
                    <span className="text-sm font-medium">JPEG</span>
                    <span className="text-xs text-neutral-500 ml-1">(Free)</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-neutral-700 mb-2">Processing Time</h4>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-green-700">
                    <span className="font-semibold">Instant Download:</span> Your document is ready for immediate download
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleDownload}
            disabled={isProcessing}
          >
            {isProcessing ? 'Downloading...' : 'Download Now'}
          </Button>
        </div>
      </Card>
    </div>
  )
}