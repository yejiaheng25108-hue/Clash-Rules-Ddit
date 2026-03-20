import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

export type LogAction =
  | 'add-rule'
  | 'remove-rule'
  | 'sort-dedup'
  | 'clear-rules'
  | 'add-group'
  | 'remove-group'
  | 'clear-groups'
  | 'pin-rule'
  | 'unpin-rule'
  | 'undo-rules'
  | 'undo-groups'

export interface LogEntry {
  id: number
  timestamp: Date
  action: LogAction
  detail: string
}

interface LogContextValue {
  logs: LogEntry[]
  addLog: (action: LogAction, detail: string) => void
  clearLogs: () => void
}

let nextLogId = 1

const LogContext = createContext<LogContextValue | null>(null)

export function LogProvider({ children }: { children: ReactNode }) {
  const [logs, setLogs] = useState<LogEntry[]>([])

  const addLog = useCallback((action: LogAction, detail: string) => {
    setLogs(prev => [
      { id: nextLogId++, timestamp: new Date(), action, detail },
      ...prev,
    ])
  }, [])

  const clearLogs = useCallback(() => {
    setLogs([])
  }, [])

  return (
    <LogContext.Provider value={{ logs, addLog, clearLogs }}>
      {children}
    </LogContext.Provider>
  )
}

export function useLog() {
  const ctx = useContext(LogContext)
  if (!ctx) throw new Error('useLog must be used within LogProvider')
  return ctx
}
