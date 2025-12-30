/**
 * Structured logging utility for consistent logging across the application
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export type LogContext = {
  userId?: string
  action?: string
  resource?: string
  resourceId?: string
  duration?: number
  metadata?: Record<string, any>
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private minLevel: LogLevel = this.isDevelopment ? LogLevel.DEBUG : LogLevel.INFO

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR]
    return levels.indexOf(level) >= levels.indexOf(this.minLevel)
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString()
    const contextStr = context ? ` | ${JSON.stringify(context)}` : ''
    return `[${timestamp}] [${level}] ${message}${contextStr}`
  }

  private log(level: LogLevel, message: string, context?: LogContext, error?: Error) {
    if (!this.shouldLog(level)) return

    const formattedMessage = this.formatMessage(level, message, context)

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(formattedMessage)
        break
      case LogLevel.INFO:
        console.info(formattedMessage)
        break
      case LogLevel.WARN:
        console.warn(formattedMessage)
        if (error) console.warn(error)
        break
      case LogLevel.ERROR:
        console.error(formattedMessage)
        if (error) console.error(error)
        break
    }
  }

  debug(message: string, context?: LogContext) {
    this.log(LogLevel.DEBUG, message, context)
  }

  info(message: string, context?: LogContext) {
    this.log(LogLevel.INFO, message, context)
  }

  warn(message: string, context?: LogContext, error?: Error) {
    this.log(LogLevel.WARN, message, context, error)
  }

  error(message: string, context?: LogContext, error?: Error) {
    this.log(LogLevel.ERROR, message, context, error)
  }

  // Convenience methods for common actions
  authEvent(action: string, userId?: string, success: boolean = true, metadata?: Record<string, any>) {
    this.info(`Auth: ${action}`, {
      userId,
      action,
      resource: 'auth',
      metadata: { success, ...metadata },
    })
  }

  apiRequest(method: string, path: string, userId?: string, statusCode?: number, duration?: number) {
    this.info(`API: ${method} ${path}`, {
      userId,
      action: 'api_request',
      metadata: { method, path, statusCode, duration },
    })
  }

  databaseQuery(operation: string, table: string, duration?: number, success: boolean = true) {
    this.debug(`DB: ${operation} on ${table}`, {
      action: 'database_query',
      resource: table,
      duration,
      metadata: { operation, success },
    })
  }

  securityEvent(event: string, userId?: string, metadata?: Record<string, any>) {
    this.warn(`Security: ${event}`, {
      userId,
      action: 'security_event',
      metadata,
    })
  }

  performanceMetric(action: string, duration: number, metadata?: Record<string, any>) {
    if (duration > 1000) {
      this.warn(`Performance: ${action} took ${duration}ms`, {
        action,
        duration,
        metadata,
      })
    } else {
      this.debug(`Performance: ${action} took ${duration}ms`, {
        action,
        duration,
        metadata,
      })
    }
  }
}

// Export singleton instance
export const logger = new Logger()

// Helper function to measure execution time
export async function measureTime<T>(
  fn: () => Promise<T>,
  action: string,
  context?: LogContext
): Promise<T> {
  const start = Date.now()
  try {
    const result = await fn()
    const duration = Date.now() - start
    logger.performanceMetric(action, duration, context?.metadata)
    return result
  } catch (error) {
    const duration = Date.now() - start
    logger.error(`${action} failed after ${duration}ms`, context, error as Error)
    throw error
  }
}

