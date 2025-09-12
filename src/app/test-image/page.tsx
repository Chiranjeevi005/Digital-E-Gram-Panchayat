'use client'

import Image from 'next/image'
import Link from 'next/link'

export default function TestImagePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-6">Image Test Page</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Next.js Image Component</h2>
        <div className="w-32 h-32 border-2 border-dashed border-gray-300 flex items-center justify-center">
          <Image
            src="/navbar-logo.png"
            alt="Test Logo"
            width={100}
            height={100}
            className="object-contain"
          />
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">HTML img Tag</h2>
        <div className="w-32 h-32 border-2 border-dashed border-gray-300 flex items-center justify-center">
          <img
            src="/navbar-logo.png"
            alt="Test Logo"
            width={100}
            height={100}
            className="object-contain"
          />
        </div>
      </div>
      
      <Link 
        href="/" 
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
      >
        Back to Home
      </Link>
    </div>
  )
}