import React from 'react'
import Badge from './Badge'

interface StatusTrackerProps {
  status: 'pending' | 'in-progress' | 'approved' | 'rejected'
}

export default function StatusTracker({ status }: StatusTrackerProps) {
  const statuses = [
    { id: 'pending', name: 'Pending', description: 'Application submitted' },
    { id: 'in-progress', name: 'In Progress', description: 'Being reviewed' },
    { id: 'approved', name: 'Approved', description: 'Application approved' },
    { id: 'rejected', name: 'Rejected', description: 'Application rejected' },
  ]

  const currentIndex = statuses.findIndex(s => s.id === status)

  return (
    <div className="w-full">
      <div className="flex justify-between">
        {statuses.map((step, index) => {
          const isCompleted = index < currentIndex
          const isCurrent = index === currentIndex
          
          return (
            <div key={step.id} className="flex flex-col items-center w-1/4">
              <div className="flex flex-col items-center">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                    isCompleted 
                      ? 'bg-green-500 text-white' 
                      : isCurrent 
                        ? 'bg-indigo-600 text-white border-2 border-indigo-400' 
                        : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {isCompleted ? (
                    <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 12">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5.917 5.724 10.5 15 1.5"/>
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <span className={`text-xs font-medium text-center ${
                  isCurrent ? 'text-indigo-600' : 'text-gray-500'
                }`}>
                  {step.name}
                </span>
              </div>
              {index < statuses.length - 1 && (
                <div 
                  className={`flex-auto h-1 mt-4 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                ></div>
              )}
            </div>
          )
        })}
      </div>
      <div className="mt-6 text-center">
        <Badge variant={status}>
          {statuses[currentIndex].name}
        </Badge>
        <p className="mt-2 text-sm text-gray-600">
          {statuses[currentIndex].description}
        </p>
      </div>
    </div>
  )
}