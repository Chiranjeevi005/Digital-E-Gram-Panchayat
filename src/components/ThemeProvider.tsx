'use client'

import { ReactNode } from 'react'

export default function ThemeProvider({ children }: { children: ReactNode }) {
  // Always use light mode as per project requirements
  return (
    <div className="">
      {children}
    </div>
  )
}
