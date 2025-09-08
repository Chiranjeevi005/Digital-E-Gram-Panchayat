'use client'

import React from 'react'

interface FileViewerProps {
  fileData: { url: string; publicId: string } | null
  fieldName: string
  label: string
}

export default function FileViewer({ fileData, fieldName, label }: FileViewerProps) {
  if (!fileData || !fileData.url) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500 text-sm">{label}: No file uploaded</p>
      </div>
    )
  }

  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200">
      <h4 className="text-sm font-medium text-gray-900 mb-2">{label}</h4>
      
      {fileData.url.endsWith('.pdf') ? (
        <div className="flex items-center p-3 bg-gray-50 rounded">
          <svg className="w-8 h-8 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="text-sm font-medium text-gray-900">PDF Document</p>
            <a 
              href={fileData.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              View Document
            </a>
          </div>
        </div>
      ) : (
        <div className="mt-2">
          <img 
            src={fileData.url} 
            alt={label} 
            className="max-h-60 rounded border shadow-sm"
          />
          <a 
            href={fileData.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block mt-2 text-blue-600 hover:text-blue-800 text-sm"
          >
            View Full Size
          </a>
        </div>
      )}
    </div>
  )
}