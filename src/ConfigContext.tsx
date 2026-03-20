import { createContext, useContext, useState, type ReactNode } from 'react'
import type { ClashConfig, ClashRule } from './types'

interface ProxyGroupEdited {
  id: number
  name: string
  type: string
  proxies: string[]
  url?: string
  interval?: number
  isSelected?: boolean
}

interface ConfigContextValue {
  config: ClashConfig | null
  setConfig: (config: ClashConfig | null) => void
  importStatus: ImportStatus
  setImportStatus: (status: ImportStatus) => void
  // Edited data for generate
  editedRules: ClashRule[]
  setEditedRules: (rules: ClashRule[]) => void
  rulesHistory: ClashRule[][]
  pushRulesHistory: (rules: ClashRule[]) => void
  undoRules: () => void
  editedGroups: ProxyGroupEdited[]
  setEditedGroups: (groups: ProxyGroupEdited[]) => void
  groupsHistory: ProxyGroupEdited[][]
  pushGroupsHistory: (groups: ProxyGroupEdited[]) => void
  undoGroups: () => void
}

export type ImportStatus =
  | { state: 'idle' }
  | { state: 'loading'; message: string }
  | { state: 'success'; proxyCount: number; groupCount: number; ruleCount: number }
  | { state: 'error'; message: string }

export type { ProxyGroupEdited }

const ConfigContext = createContext<ConfigContextValue | null>(null)

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<ClashConfig | null>(null)
  const [importStatus, setImportStatus] = useState<ImportStatus>({ state: 'idle' })
  const [editedRules, setEditedRules] = useState<ClashRule[]>([])
  const [editedGroups, setEditedGroups] = useState<ProxyGroupEdited[]>([])
  const [rulesHistory, setRulesHistory] = useState<ClashRule[][]>([])
  const [groupsHistory, setGroupsHistory] = useState<ProxyGroupEdited[][]>([])

  const pushRulesHistory = (rules: ClashRule[]) => {
    setRulesHistory(prev => [...prev.slice(-19), rules])
  }

  const undoRules = () => {
    if (rulesHistory.length > 0) {
      const prev = rulesHistory[rulesHistory.length - 1]
      setRulesHistory(h => h.slice(0, -1))
      setEditedRules(prev)
    }
  }

  const pushGroupsHistory = (groups: ProxyGroupEdited[]) => {
    setGroupsHistory(prev => [...prev.slice(-19), groups])
  }

  const undoGroups = () => {
    if (groupsHistory.length > 0) {
      const prev = groupsHistory[groupsHistory.length - 1]
      setGroupsHistory(h => h.slice(0, -1))
      setEditedGroups(prev)
    }
  }

  return (
    <ConfigContext.Provider value={{
      config, setConfig,
      importStatus, setImportStatus,
      editedRules, setEditedRules,
      rulesHistory, pushRulesHistory, undoRules,
      editedGroups, setEditedGroups,
      groupsHistory, pushGroupsHistory, undoGroups,
    }}>
      {children}
    </ConfigContext.Provider>
  )
}

export function useConfig() {
  const ctx = useContext(ConfigContext)
  if (!ctx) throw new Error('useConfig must be used within ConfigProvider')
  return ctx
}
