'use client'

import { Component, ReactNode } from 'react'

interface Props {
 children: ReactNode
 fallback?: ReactNode
}

interface State {
 hasError: boolean
 error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
 constructor(props: Props) {
 super(props)
 this.state = { hasError: false }
 }

 static getDerivedStateFromError(error: Error): State {
 return { hasError: true, error }
 }

 componentDidCatch(error: Error, errorInfo: any) {
 console.error('ErrorBoundary caught an error:', error, errorInfo)
 }

 render() {
 if (this.state.hasError) {
 return (
 this.props.fallback || (
 <div className="min-h-[200px] flex items-center justify-center">
 <div className="text-center">
 <div className="text-6xl mb-4">😅</div>
 <h3 className="text-xl font-semibold text-white mb-2">Something went wrong</h3>
 <p className="text-gray-600 text-sm">{this.state.error?.message || 'Please try again later'}</p>
 </div>
 </div>
 )
 )
 }

 return this.props.children
 }
}