import { createContext, useContext, useState, type ReactNode } from 'react'
import type { ClashConfig } from './types'

interface ConfigContextValue {
  config: ClashConfig | null
  setConfig: (config: ClashConfig | null) => void
  importStatus: ImportStatus
  setImportStatus: (status: ImportStatus) => void
}

export type ImportStatus =
  | { state: 'idle' }
  | { state: 'loading'; message: string }
  | { state: 'success'; proxyCount: number; groupCount: number; ruleCount: number }
  | { state: 'error'; message: string }

const ConfigContext = createContext<ConfigContextValue | null>(null)

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<ClashConfig | null>(null)
  const [importStatus, setImportStatus] = useState<ImportStatus>({ state: 'idle' })

  return (
    <ConfigContext.Provider value={{ config, setConfig, importStatus, setImportStatus }}>
      {children}
    </ConfigContext.Provider>
  )
}

export function useConfig() {
  const ctx = useContext(ConfigContext)
  if (!ctx) throw new Error('useConfig must be used within ConfigProvider')
  return ctx
}
