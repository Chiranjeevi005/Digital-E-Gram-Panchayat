import React from 'react'

interface ProgressBarProps {
  value?: number
  max?: number
  currentStep?: number
  totalSteps?: number
  className?: string
  showPercentage?: boolean
}

export default function ProgressBar({ 
  value, 
  max, 
  currentStep, 
  totalSteps, 
  className = '', 
  showPercentage = false 
}: ProgressBarProps) {
  // Calculate percentage based on value/max or currentStep/totalSteps
  let percentage: number;
  if (value !== undefined && max !== undefined) {
    percentage = Math.round((value / max) * 100)
  } else if (currentStep !== undefined && totalSteps !== undefined) {
    percentage = Math.round((currentStep / totalSteps) * 100)
  } else {
    percentage = 0
  }
  
  return (
    <div className={className}>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2.5 rounded-full" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      {showPercentage && (
        <div className="text-right text-xs text-gray-500 mt-1">
          {percentage}%
        </div>
      )}
    </div>
  )
}