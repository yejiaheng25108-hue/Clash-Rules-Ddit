import { useState, useMemo } from 'react'
import { useConfig } from '../ConfigContext'
import { parseClashYaml } from '../utils/parser'
import { useLog } from '../LogContext'
import type { ClashRule } from '../types'

const RULE_TYPES = [
  'DOMAIN',
  'DOMAIN-SUFFIX',
  'DOMAIN-KEYWORD',
  'IP-CIDR',
  'IP-CIDR6',
  'GEOIP',
  'DST-PORT',
  'SRC-PORT',
  'SRC-IP-CIDR',
  'PROCESS-NAME',
  'MATCH',
]

const BUILTIN_PROXIES = ['DIRECT', 'REJECT']

let nextId = 100000

export default function RuleEditor() {
  const { config, editedRules, setEditedRules, editedGroups, setEditedGroups, rulesHistory, pushRulesHistory, undoRules, pushGroupsHistory } = useConfig()
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

  const toggleSelectRule = (id: number) => {
    setEditedRules(rules.map(r => 
      r.id === id ? { ...r, isSelected: !r.isSelected } : r
    ))
  }

  const toggleSelectAllRules = () => {
    const allSelected = filteredRules.length > 0 && filteredRules.every(r => r.isSelected)
    setEditedRules(rules.map(r => {
      if (filteredRules.find(fr => fr.id === r.id)) {
        return { ...r, isSelected: !allSelected }
      }
      return r
    }))
  }

  const handleYamlImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string
        const parsed = parseClashYaml(text)
        
        let importedRuleCount = 0
        let importedGroupCount = 0

        if (parsed.rules.length > 0) {
          pushRulesHistory(rules)
          const importedRules = parsed.rules.map((r) => ({
            ...r,
            id: nextId++,
            isPinned: true
          }))
          setEditedRules([...importedRules, ...rules])
          importedRuleCount = parsed.rules.length
        }

        if (parsed.proxyGroups && parsed.proxyGroups.length > 0) {
          pushGroupsHistory(editedGroups)
          const importedGroups = parsed.proxyGroups.map(g => ({
            ...g,
            id: nextId++
          }))
          setEditedGroups([...editedGroups, ...importedGroups])
          importedGroupCount = parsed.proxyGroups.length
        }

        if (importedRuleCount > 0 || importedGroupCount > 0) {
          const msg = [
            importedRuleCount > 0 ? `${importedRuleCount} 条规则` : '',
            importedGroupCount > 0 ? `${importedGroupCount} 个策略组` : ''
          ].filter(Boolean).join(' 和 ')
          addLog('add-rule', `从 ${file.name} 导入了 ${msg}`)
        } else {
          addLog('error', `文件中未找到任何规则或策略组: ${file.name}`)
        }
      } catch (err) {
        addLog('clear-rules', `YAML 解析失败: ${err instanceof Error ? err.message : String(err)}`)
      }
    }
    reader.readAsText(file)
    e.target.value = ''
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

  const sortRules = () => {
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

    addLog('sort-rules', `规则排序完成: 共 ${sorted.length} 条`)
    pushRulesHistory(rules)
    setEditedRules(sorted)
  }

  const dedupRules = () => {
    const beforeCount = rules.length
    const seen = new Set<string>()
    const deduped: ClashRule[] = []
    const removedRules: string[] = []

    for (const r of rules) {
      const key = `${r.type}:${r.target}`
      if (!seen.has(key)) {
        seen.add(key)
        deduped.push(r)
      } else {
        removedRules.push(`${r.type},${r.target || '(MATCH)'},${r.proxy}`)
      }
    }

    const removedCount = beforeCount - deduped.length
    if (removedCount > 0) {
      addLog('dedup-rules', `去重完成: 删除了 ${removedCount} 条重复规则`)
      pushRulesHistory(rules)
      setEditedRules(deduped)
    } else {
      addLog('dedup-rules', `未发现重复规则`)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') addRule()
  }

  return (
    <div className="ui-card p-6 space-y-6">
      {/* YAML Import Container */}
      <div className="flex flex-col gap-2 rounded-xl border-2 border-dashed border-border-default/80 bg-bg-card/30 p-4 text-center hover:border-accent/40 hover:bg-bg-input/50 transition-all cursor-pointer relative group">
        <input 
          type="file" 
          accept=".yaml,.yml,text/yaml" 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleYamlImport}
          title="点击或拖拽 YAML 文件导入规则"
        />
        <svg className="w-6 h-6 mx-auto text-text-muted group-hover:text-accent transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <div className="space-y-1">
          <p className="text-sm font-medium text-text-secondary group-hover:text-text-primary">
            快速导入本地 .yaml 规则
          </p>
          <p className="text-[11px] text-text-muted">
            解析出的规则将默认固定在最上方
          </p>
        </div>
      </div>

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
      {(rules.length > 0 || rulesHistory.length > 0) && (
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
            onClick={sortRules}
            className="text-xs text-accent hover:text-accent-hover transition-colors cursor-pointer whitespace-nowrap"
          >
            排序
          </button>
          <button
            onClick={dedupRules}
            className="text-xs text-accent hover:text-accent-hover transition-colors cursor-pointer whitespace-nowrap"
          >
            去重
          </button>
          <button
            onClick={() => {
              const selectedRules = rules.filter(r => r.isSelected)
              if (selectedRules.length === 0) return
              addLog('clear-rules', `清除选定规则: 共 ${selectedRules.length} 条`)
              pushRulesHistory(rules)
              setEditedRules(rules.filter(r => !r.isSelected))
            }}
            disabled={!rules.some(r => r.isSelected)}
            className="text-xs text-danger hover:text-danger-hover transition-colors cursor-pointer whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
          >
            清除选定
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
                  <th className="px-4 py-3 font-medium w-10">
                    <input
                      type="checkbox"
                      checked={filteredRules.length > 0 && filteredRules.every(r => r.isSelected)}
                      onChange={toggleSelectAllRules}
                      className="w-4 h-4 rounded border-border-default bg-bg-card text-accent focus:ring-accent/50 cursor-pointer"
                    />
                  </th>
                  <th className="px-4 py-3 font-medium">类型</th>
                  <th className="px-4 py-3 font-medium">目标</th>
                  <th className="px-4 py-3 font-medium">策略</th>
                  <th className="px-4 py-3 font-medium w-16 text-center">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default">
              {filteredRules.map(rule => (
                <tr 
                  key={rule.id} 
                  onClick={() => toggleSelectRule(rule.id)}
                  className={`transition-colors group cursor-pointer ${rule.isSelected ? 'bg-accent/5' : 'hover:bg-bg-card-hover/50'}`}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={!!rule.isSelected}
                      readOnly
                      className="w-4 h-4 rounded border-border-default bg-bg-card text-accent focus:ring-accent/50 cursor-pointer pointer-events-none"
                    />
                  </td>
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
                        onClick={(e) => { e.stopPropagation(); togglePin(rule.id) }}
                        className={`p-1 cursor-pointer hover:text-accent transition-colors ${rule.isPinned ? 'text-accent' : 'text-text-muted'}`}
                        title={rule.isPinned ? '取消固定' : '固定规则'}
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path d="M16,12V4H17V2H7V4H8V12L6,14V16H11.2V22H12.8V16H18V14L16,12Z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeRule(rule.id) }}
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
