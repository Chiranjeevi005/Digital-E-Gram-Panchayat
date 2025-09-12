'use client'

import { SessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'
import { NotificationProvider } from '@/contexts/NotificationContext'
import ToastContainer from '@/components/Toast'

export default function ClientLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <SessionProvider>
      <NotificationProvider>
        {children}
        <ToastContainer />
      </NotificationProvider>
    </SessionProvider>
  )
}