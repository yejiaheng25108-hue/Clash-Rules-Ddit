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
}

function formatTime(date: Date) {
  return date.toLocaleTimeString('zh-CN', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export default function LogPanel() {
  const { logs, clearLogs } = useLog()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <section className="glass-card p-6">
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
