'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/context/AuthContext'
import { SocketProvider } from '@/context/SocketContext'
import { NotificationProvider } from '@/context/NotificationContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { LanguageProvider } from '@/context/LanguageContext'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 minutes — data stays fresh
      gcTime: 10 * 60 * 1000,         // 10 minutes in cache after unmount
      refetchOnWindowFocus: false,
      refetchOnMount: false,           // Don't re-fetch if data is fresh
      retry: 1,                        // Only retry once on failure
    },
  },
})

export function Providers({ children }: { children: React.ReactNode }) {
 return (
 <QueryClientProvider client={queryClient}>
 <ThemeProvider>
 <LanguageProvider>
 <AuthProvider>
 <SocketProvider>
 <NotificationProvider>
 {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#ffffff',
              color: '#0F172A',
              borderRadius: '12px',
              padding: '12px 16px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 8px 24px rgba(15,23,42,0.12)',
              fontSize: '14px',
              fontWeight: '500',
            },
            success: {
              iconTheme: { primary: '#14B8A6', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#fff' },
            },
          }}
        />
 </NotificationProvider>
 </SocketProvider>
 </AuthProvider>
 </LanguageProvider>
 </ThemeProvider>
 </QueryClientProvider>
 )
}