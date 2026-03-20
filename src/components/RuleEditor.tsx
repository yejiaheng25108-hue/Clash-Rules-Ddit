import { useState, useMemo } from 'react'
import { useConfig } from '../ConfigContext'
import { useLog } from '../LogContext'
import type { ClashRule } from '../types'

const RULE_TYPES = [
  'DOMAIN',
  'DOMAIN-SUFFIX',
  'DOMAIN-KEYWORD',
  'IP-CIDR',
  'GEOIP',
  'MATCH',
]

const BUILTIN_PROXIES = ['DIRECT', 'REJECT']

let nextId = 100000

export default function RuleEditor() {
  const { config, editedRules, setEditedRules, editedGroups, rulesHistory, pushRulesHistory, undoRules } = useConfig()
  const { addLog } = useLog()
  const [target, setTarget] = useState('')
  const [ruleType, setRuleType] = useState('DOMAIN-SUFFIX')
  const [proxy, setProxy] = useState('DIRECT')
  const [search, setSearch] = useState('')

  // Alias for clarity
  const rules = editedRules

  // Build proxy options from parsed config
  const proxyOptions = useMemo(() => {
    const names = [
      ...BUILTIN_PROXIES,
      ...editedGroups.map(g => g.name),
      ...(config?.proxyNames ?? []),
    ]
    return [...new Set(names)]
  }, [config, editedGroups])



  // Filtered rules based on search
  const filteredRules = useMemo(() => {
    if (!search.trim()) return rules
    const q = search.toLowerCase()
    return rules.filter(
      r =>
        r.target.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q) ||
        r.proxy.toLowerCase().includes(q)
    )
  }, [rules, search])

  const addRule = () => {
    if (!target.trim() && ruleType !== 'MATCH') return
    const newRule: ClashRule = {
      id: nextId++,
      target: ruleType === 'MATCH' ? '' : target.trim(),
      type: ruleType,
      proxy,
      raw: `${ruleType},${target.trim()},${proxy}`,
      isCustom: true,
    }
    // Add custom rule to the top
    pushRulesHistory(rules)
    setEditedRules([newRule, ...rules])
    addLog('add-rule', `添加规则: ${ruleType},${ruleType === 'MATCH' ? '' : target.trim()},${proxy}`)
    if (ruleType !== 'MATCH') setTarget('')
  }

  const removeRule = (id: number) => {
    const rule = rules.find(r => r.id === id)
    if (rule) {
      addLog('remove-rule', `删除规则: ${rule.type},${rule.target || '(MATCH)'},${rule.proxy}`)
    }
    pushRulesHistory(rules)
    setEditedRules(rules.filter(r => r.id !== id))
  }

  const togglePin = (id: number) => {
    const index = rules.findIndex(r => r.id === id)
    if (index > -1) {
      const rule = rules[index]
      const isPinned = !rule.isPinned
      
      let newRules = [...rules]
      newRules.splice(index, 1)
      const updatedRule = { ...rule, isPinned }
      
      if (isPinned) {
        newRules.unshift(updatedRule)
        addLog('pin-rule', `固定规则在最上方: ${rule.type},${rule.target || '(MATCH)'},${rule.proxy}`)
      } else {
        const lastPinnedIndex = (() => {
          for (let i = newRules.length - 1; i >= 0; i--) {
            if (newRules[i].isPinned) return i
          }
          return -1
        })()
        newRules.splice(lastPinnedIndex + 1, 0, updatedRule)
        addLog('unpin-rule', `取消固定规则: ${rule.type},${rule.target || '(MATCH)'},${rule.proxy}`)
      }
      pushRulesHistory(rules)
      setEditedRules(newRules)
    }
  }

  const sortAndDedupRules = () => {
    const beforeCount = rules.length

    // 1. 确定排序优先级 (0 最高，4 最低)
    const getCategory = (r: ClashRule) => {
      if (r.isPinned) return -1
      if (r.isCustom) return 0 // 用户自定义规则
      if (r.type === 'MATCH') return 4 // 兜底规则
      if (r.type.includes('IP') || r.type.includes('GEO')) return 3 // IP与地理位置
      if (r.proxy === 'DIRECT' || r.proxy === 'REJECT') return 2 // 国内直连规则
      return 1 // 国外代理规则
    }

    // 2. 排序
    const sorted = [...rules].sort((a, b) => {
      const catA = getCategory(a)
      const catB = getCategory(b)
      if (catA !== catB) return catA - catB

      const typeCompare = a.type.localeCompare(b.type)
      if (typeCompare !== 0) return typeCompare

      return (a.target || '').localeCompare(b.target || '')
    })

    // 3. 去重 (保留第一次出现的 type+target)
    const seen = new Set<string>()
    const deduped: ClashRule[] = []
    const removedRules: string[] = []

    for (const r of sorted) {
      const key = `${r.type}:${r.target}`
      if (!seen.has(key)) {
        seen.add(key)
        deduped.push(r)
      } else {
        removedRules.push(`${r.type},${r.target || '(MATCH)'},${r.proxy}`)
      }
    }

    const removedCount = beforeCount - deduped.length
    let detail = `排序去重完成: ${beforeCount} → ${deduped.length} 条规则`
    if (removedCount > 0) {
      detail += `，删除 ${removedCount} 条重复: ${removedRules.join('; ')}`
    }
    addLog('sort-dedup', detail)

    pushRulesHistory(rules)
    setEditedRules(deduped)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') addRule()
  }

  return (
    <div className="ui-card p-6 space-y-6">
      {/* Input Row */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto] gap-3 items-end">
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
            {proxyOptions.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
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

      {/* Search + Stats */}
      {rules.length > 0 && (
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              id="rule-search-input"
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="搜索规则（域名、类型、代理）..."
              className="input-base !pl-10 py-2 text-sm"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary
                           transition-colors cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <span className="text-xs text-text-muted whitespace-nowrap">
            {search ? `${filteredRules.length} / ${rules.length}` : `${rules.length} 条`}
          </span>
          <button
            onClick={() => {
              if (rulesHistory.length === 0) return
              addLog('undo-rules', `撤回操作`)
              undoRules()
            }}
            disabled={rulesHistory.length === 0}
            className="text-xs text-blue-500 hover:text-blue-400 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
          >
            撤回
          </button>
          <button
            onClick={sortAndDedupRules}
            className="text-xs text-accent hover:text-accent-hover transition-colors cursor-pointer whitespace-nowrap"
          >
            排序去重
          </button>
          <button
            onClick={() => {
              addLog('clear-rules', `清空全部规则: 共 ${rules.length} 条`)
              pushRulesHistory(rules)
              setEditedRules([])
            }}
            className="text-xs text-danger hover:text-danger-hover transition-colors cursor-pointer whitespace-nowrap"
          >
            全部清除
          </button>
        </div>
      )}

      {/* Rules List */}
      {filteredRules.length > 0 && (
        <div className="border border-border-default rounded-lg overflow-hidden flex flex-col max-h-[360px]">
          <div className="overflow-y-auto flex-1">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="sticky top-0 bg-bg-card-hover border-b border-border-default z-10">
                <tr className="text-xs text-text-muted font-medium">
                  <th className="px-4 py-3 font-medium">类型</th>
                  <th className="px-4 py-3 font-medium">目标</th>
                  <th className="px-4 py-3 font-medium">策略</th>
                  <th className="px-4 py-3 font-medium w-16 text-center">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default">
              {filteredRules.map(rule => (
                <tr key={rule.id} className="hover:bg-bg-card-hover/50 transition-colors group">
                  <td className="px-4 py-3 w-[20%]">
                    <span className="text-xs px-2 py-1 rounded bg-bg-input border border-border-default font-mono text-text-secondary">
                      {rule.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 w-[45%] font-mono text-sm text-text-primary">
                    <div className="flex items-center gap-2">
                      <span className="truncate" title={rule.target || '(MATCH)'}>{rule.target || '(MATCH)'}</span>
                      {rule.isCustom && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent/10 text-accent shrink-0">
                          自定义
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 w-[20%] font-medium text-sm text-accent">
                    {rule.proxy}
                  </td>
                  <td className="px-4 py-3 w-[15%] text-center">
                    <div className="flex items-center justify-center gap-2 transition-all duration-200">
                      <button
                        onClick={() => togglePin(rule.id)}
                        className={`p-1 cursor-pointer hover:text-accent transition-colors ${rule.isPinned ? 'text-accent' : 'text-text-muted'}`}
                        title={rule.isPinned ? '取消固定' : '固定规则'}
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path d="M16,12V4H17V2H7V4H8V12L6,14V16H11.2V22H12.8V16H18V14L16,12Z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => removeRule(rule.id)}
                        className="text-text-muted hover:text-danger p-1 cursor-pointer transition-colors"
                        title="删除规则"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Search no results */}
      {rules.length > 0 && search && filteredRules.length === 0 && (
        <div className="flex flex-col items-center justify-center py-6 text-text-muted">
          <span className="text-sm">未找到匹配 "<span className="text-accent">{search}</span>" 的规则</span>
        </div>
      )}

      {/* Empty State */}
      {rules.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-text-muted">
          <svg className="w-10 h-10 mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="text-sm">
            {config ? '已导入配置，可在上方添加新规则' : '暂无规则，请先导入配置或手动添加'}
          </span>
        </div>
      )}
    </div>
  )
}
