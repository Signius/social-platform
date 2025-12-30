'use client'

import { Component, ReactNode } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'
import { logger } from '@/lib/utils/logger'

interface Props {
  children: ReactNode
  section?: string
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

/**
 * Lightweight error boundary for sections of the page
 * Doesn't break the entire page, just shows an error in the section
 */
export class SectionErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    const section = this.props.section || 'Unknown section'
    
    logger.error(`Error in ${section}`, {
      action: 'section_error',
      resource: section,
      metadata: {
        errorMessage: error.message,
        componentStack: errorInfo.componentStack,
      },
    }, error)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading {this.props.section || 'content'}</AlertTitle>
          <AlertDescription className="mt-2 space-y-2">
            <p>Something went wrong while loading this section.</p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <p className="text-xs font-mono mt-1">
                {this.state.error.message}
              </p>
            )}
            <Button
              onClick={() => {
                this.setState({ hasError: false, error: undefined })
              }}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      )
    }

    return this.props.children
  }
}

