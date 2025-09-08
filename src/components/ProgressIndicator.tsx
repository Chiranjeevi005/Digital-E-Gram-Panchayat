import React from 'react'

interface ProgressIndicatorProps {
  steps: string[]
  currentStep: number
}

export default function ProgressIndicator({ steps, currentStep }: ProgressIndicatorProps) {
  return (
    <div className="mb-8">
      <ol className="flex items-center w-full text-sm font-medium text-center text-gray-500 sm:text-base">
        {steps.map((step, index) => {
          const stepNumber = index + 1
          const isCompleted = stepNumber < currentStep
          const isCurrent = stepNumber === currentStep
          
          return (
            <li 
              key={index} 
              className={`flex md:w-full items-center ${
                index !== steps.length - 1 ? 'sm:after:content-[\'\'] sm:after:w-full sm:after:h-0.5 sm:after:bg-gray-200 sm:after:inline-block sm:after:mx-6 xl:after:mx-10' : ''
              }`}
            >
              <span 
                className={`flex items-center after:content-[\'/\'] sm:after:hidden ${
                  isCompleted 
                    ? 'text-indigo-600' 
                    : isCurrent 
                      ? 'text-indigo-600' 
                      : 'text-gray-500'
                }`}
              >
                <span 
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    isCompleted 
                      ? 'bg-indigo-600 text-white' 
                      : isCurrent 
                        ? 'bg-indigo-100 text-indigo-600 border-2 border-indigo-600' 
                        : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {isCompleted ? (
                    <svg className="w-3.5 h-3.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 12">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5.917 5.724 10.5 15 1.5"/>
                    </svg>
                  ) : (
                    stepNumber
                  )}
                </span>
                <span className="ml-2 hidden sm:inline">{step}</span>
              </span>
            </li>
          )
        })}
      </ol>
      <div className="mt-4 sm:hidden">
        <p className="text-sm font-medium text-gray-900">
          Step {currentStep} of {steps.length}: {steps[currentStep - 1]}
        </p>
      </div>
    </div>
  )
}