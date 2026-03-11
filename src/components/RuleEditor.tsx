import { useState } from 'react'

interface Rule {
  id: number
  target: string
  type: string
  proxy: string
}

const RULE_TYPES = [
  'DOMAIN',
  'DOMAIN-SUFFIX',
  'DOMAIN-KEYWORD',
  'IP-CIDR',
  'GEOIP',
  'MATCH',
]

const MOCK_PROXIES = [
  'DIRECT',
  'REJECT',
  '🇭🇰 香港节点',
  '🇯🇵 日本节点',
  '🇺🇸 美国节点',
  '🇸🇬 新加坡节点',
  '🚀 自动选择',
  '♻️ 故障转移',
]

let nextId = 1

export default function RuleEditor() {
  const [target, setTarget] = useState('')
  const [ruleType, setRuleType] = useState('DOMAIN-SUFFIX')
  const [proxy, setProxy] = useState('DIRECT')
  const [rules, setRules] = useState<Rule[]>([])

  const addRule = () => {
    if (!target.trim()) return
    setRules(prev => [
      ...prev,
      { id: nextId++, target: target.trim(), type: ruleType, proxy },
    ])
    setTarget('')
  }

  const removeRule = (id: number) => {
    setRules(prev => prev.filter(r => r.id !== id))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') addRule()
  }

  return (
    <div className="space-y-5">
      {/* Input Row */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto] gap-3 items-end">
        {/* Target */}
        <div>
          <label className="block text-xs text-text-secondary font-medium mb-1.5">
            目标地址
          </label>
          <input
            id="rule-target-input"
            type="text"
            value={target}
            onChange={e => setTarget(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="example.com / 10.0.0.0/8 / CN"
            className="input-base"
          />
        </div>

        {/* Rule Type */}
        <div>
          <label className="block text-xs text-text-secondary font-medium mb-1.5">
            规则类型
          </label>
          <select
            id="rule-type-select"
            value={ruleType}
            onChange={e => setRuleType(e.target.value)}
            className="select-base"
          >
            {RULE_TYPES.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Proxy */}
        <div>
          <label className="block text-xs text-text-secondary font-medium mb-1.5">
            代理节点
          </label>
          <select
            id="rule-proxy-select"
            value={proxy}
            onChange={e => setProxy(e.target.value)}
            className="select-base"
          >
            {MOCK_PROXIES.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Add Button */}
        <button
          id="add-rule-btn"
          onClick={addRule}
          className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-medium
                     rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-accent-glow
                     active:scale-[0.97] cursor-pointer whitespace-nowrap"
        >
          + 添加规则
        </button>
      </div>

      {/* Rules List */}
      {rules.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted font-medium">
              已添加 {rules.length} 条规则
            </span>
            <button
              onClick={() => setRules([])}
              className="text-xs text-danger hover:text-danger-hover transition-colors cursor-pointer"
            >
              全部清除
            </button>
          </div>
          <div className="space-y-1.5 max-h-[240px] overflow-y-auto pr-1">
            {rules.map(rule => (
              <div
                key={rule.id}
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-bg-input
                           border border-border-default hover:border-accent/30
                           transition-all duration-200 group"
              >
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-accent/15 text-accent font-medium">
                  {rule.type}
                </span>
                <span className="text-sm text-text-primary font-mono flex-1 truncate">
                  {rule.target}
                </span>
                <span className="text-xs text-text-secondary">→</span>
                <span className="text-sm text-accent-hover font-medium">
                  {rule.proxy}
                </span>
                <button
                  onClick={() => removeRule(rule.id)}
                  className="ml-2 opacity-0 group-hover:opacity-100 text-text-muted hover:text-danger
                             transition-all duration-200 cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {rules.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-text-muted">
          <svg className="w-10 h-10 mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="text-sm">暂无规则，请在上方添加</span>
        </div>
      )}
    </div>
  )
}
