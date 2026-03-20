import { useState } from 'react'
import { useLog, type LogAction } from '../LogContext'

const ACTION_LABELS: Record<LogAction, { icon: string; label: string; color: string }> = {
  'add-rule': { icon: '＋', label: '添加规则', color: 'text-[#34d399]' },
  'remove-rule': { icon: '−', label: '删除规则', color: 'text-[#f87171]' },
  'sort-dedup': { icon: '⇅', label: '排序去重', color: 'text-[#818cf8]' },
  'clear-rules': { icon: '✕', label: '清空规则', color: 'text-[#fb923c]' },
  'add-group': { icon: '＋', label: '添加策略组', color: 'text-[#34d399]' },
  'remove-group': { icon: '−', label: '删除策略组', color: 'text-[#f87171]' },
  'clear-groups': { icon: '✕', label: '清空策略组', color: 'text-[#fb923c]' },
  'pin-rule': { icon: '📌', label: '固定规则', color: 'text-[#60a5fa]' },
  'unpin-rule': { icon: '📍', label: '取消固定', color: 'text-[#9ca3af]' },
  'undo-rules': { icon: '↶', label: '撤回操作', color: 'text-[#a78bfa]' },
}

function formatTime(date: Date) {
  return date.toLocaleTimeString('zh-CN', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

interface LogPanelProps {
  embedded?: boolean
  sidebar?: boolean
}

export default function LogPanel({ embedded, sidebar }: LogPanelProps = {}) {
  const { logs, clearLogs } = useLog()
  const [collapsed, setCollapsed] = useState(false)

  if (sidebar) {
    return (
      <div className="flex flex-col h-full bg-black/20 rounded-lg border border-white/5 overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 border-b border-white/5 bg-black/20 shrink-0">
          <span className="text-[10px] font-mono text-white/50 tracking-wider">系统日志</span>
          {logs.length > 0 && (
            <button
              onClick={clearLogs}
              className="text-white/40 hover:text-white transition-colors cursor-pointer p-1"
              title="清空日志"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-2 console-scrollbar font-mono text-[10px] leading-relaxed break-all">
          {logs.length > 0 ? (
            <div className="space-y-1.5">
              {logs.map(log => {
                const meta = ACTION_LABELS[log.action]
                return (
                  <div key={log.id} className="flex flex-col gap-0.5 py-1 hover:bg-white/5 px-1.5 rounded">
                    <div className="flex items-center gap-2">
                      <span className="text-white/30 shrink-0 select-none text-[9px] leading-none">
                        [{formatTime(log.timestamp)}]
                      </span>
                      <span className={`${meta.color} font-bold shrink-0 text-[9px] leading-none select-none`}>
                        {log.action.toUpperCase()}
                      </span>
                    </div>
                    <span className="text-white/70 whitespace-pre-wrap ml-1 leading-normal">
                      {log.detail}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-white/30 text-[10px]">
              等待操作...
            </div>
          )}
        </div>
      </div>
    )
  }

  if (embedded) {
    return (
      <section className={`bg-bg-console overflow-hidden flex flex-col transition-all duration-300
                          ${collapsed ? 'h-11' : 'h-52'}`}>
        <div 
          className="flex items-center gap-3 px-4 py-2 border-b border-white/10 bg-white/5 cursor-pointer hover:bg-white/10 transition-colors"
          onClick={() => setCollapsed(!collapsed)}
        >
          <div className="flex gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-danger"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-success"></div>
          </div>
          <span className="text-xs font-mono text-white/50 ml-2 tracking-widest font-semibold flex items-center gap-2">
            系统日志
            <svg 
              className={`w-3.5 h-3.5 transition-transform duration-200 ${collapsed ? '' : 'rotate-180'}`} 
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
          </span>
          <span className="flex-1" />
          
          <div className="flex items-center gap-4" onClick={e => e.stopPropagation()}>
            <span className="text-[11px] text-white/40 font-mono">
              {logs.length > 0 ? `${logs.length} 条记录` : '暂无日志'}
            </span>
            {logs.length > 0 && (
              <button
                onClick={clearLogs}
                className="text-white/40 hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-white/5 hover:bg-white/10"
                title="清空日志"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                清空
              </button>
            )}
          </div>
        </div>
        
        {!collapsed && (
          <div className="flex-1 overflow-y-auto p-3 console-scrollbar font-mono text-xs leading-relaxed max-h-full">
            {logs.length > 0 ? (
              <div className="space-y-1">
                {logs.map(log => {
                  const meta = ACTION_LABELS[log.action]
                  return (
                    <div key={log.id} className="flex items-start gap-3 py-0.5 hover:bg-white/5 px-2 rounded">
                      <span className="text-white/40 shrink-0 select-none">
                        [{formatTime(log.timestamp)}]
                      </span>
                      <span className={`${meta.color} font-bold shrink-0 w-20 select-none`}>
                        [{log.action.toUpperCase()}]
                      </span>
                      <span className="text-white/80 whitespace-pre-wrap break-all">
                        {log.detail}
                      </span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-white/30 text-[11px]">
                [系统] 等待操作...
              </div>
            )}
          </div>
        )}
      </section>
    )
  }

  return (
    <section className="ui-card p-6 mt-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-0">
        <div className="w-2 h-2 rounded-full bg-[#f59e0b] animate-pulse-dot" />
        <h2 className="text-lg font-semibold text-text-primary">操作日志</h2>
        <span className="text-xs text-text-muted ml-1">
          {logs.length > 0 ? `${logs.length} 条记录` : '暂无记录'}
        </span>
        <span className="flex-1" />
        {logs.length > 0 && (
          <button
            onClick={clearLogs}
            className="text-xs text-danger hover:text-danger-hover transition-colors cursor-pointer"
          >
            清空日志
          </button>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-xs text-text-muted hover:text-text-primary transition-colors cursor-pointer
                     flex items-center gap-1"
        >
          <svg
            className={`w-3.5 h-3.5 transition-transform duration-200 ${collapsed ? '' : 'rotate-180'}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
          {collapsed ? '展开' : '收起'}
        </button>
      </div>

      {/* Log List */}
      {!collapsed && (
        <div className="mt-4">
          {logs.length > 0 ? (
            <div className="space-y-1.5 max-h-[240px] overflow-y-auto pr-1">
              {logs.map(log => {
                const meta = ACTION_LABELS[log.action]
                return (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 px-3 py-2 rounded-lg bg-bg-input
                               border border-border-default transition-all duration-200
                               hover:border-accent/20"
                  >
                    {/* Time */}
                    <span className="text-[11px] font-mono text-text-muted shrink-0 pt-0.5">
                      {formatTime(log.timestamp)}
                    </span>
                    {/* Action badge */}
                    <span className={`text-xs font-medium px-2 py-0.5 rounded shrink-0
                                     bg-bg-card ${meta.color}`}>
                      <span className="mr-1">{meta.icon}</span>
                      {meta.label}
                    </span>
                    {/* Detail */}
                    <span className="text-sm text-text-secondary flex-1 break-all leading-relaxed">
                      {log.detail}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-text-muted">
              <svg className="w-8 h-8 mb-2 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="text-sm">操作记录将在此处显示</span>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
