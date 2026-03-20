import { useState, useMemo } from 'react'
import { useConfig, type ProxyGroupEdited } from '../ConfigContext'
import { useLog } from '../LogContext'

const GROUP_TYPES = [
  { value: 'select', label: 'select（手动选择）' },
  { value: 'url-test', label: 'url-test（自动测速）' },
  { value: 'fallback', label: 'fallback（故障转移）' },
  { value: 'load-balance', label: 'load-balance（负载均衡）' },
]

let nextId = 100000

export default function ProxyGroupEditor() {
  const { config, editedGroups, setEditedGroups } = useConfig()
  const { addLog } = useLog()
  const [name, setName] = useState('')
  const [type, setType] = useState('select')
  const [selectedNodes, setSelectedNodes] = useState<string[]>([])
  const [testUrl, setTestUrl] = useState('http://www.gstatic.com/generate_204')
  const [testInterval, setTestInterval] = useState(300)
  const [search, setSearch] = useState('')
  const [nodeSearch, setNodeSearch] = useState('')

  const groups = editedGroups

  // Available nodes from parsed config
  const availableNodes = useMemo(() => {
    if (!config) return []
    return config.proxyNames
  }, [config])

  // Filtered nodes for selection
  const filteredNodes = useMemo(() => {
    if (!nodeSearch.trim()) return availableNodes
    const q = nodeSearch.toLowerCase()
    return availableNodes.filter(n => n.toLowerCase().includes(q))
  }, [availableNodes, nodeSearch])

  const needsTestConfig = type === 'url-test' || type === 'fallback'



  // Filtered groups for display
  const filteredGroups = useMemo(() => {
    if (!search.trim()) return groups
    const q = search.toLowerCase()
    return groups.filter(
      g =>
        g.name.toLowerCase().includes(q) ||
        g.type.toLowerCase().includes(q) ||
        g.proxies.some(p => p.toLowerCase().includes(q))
    )
  }, [groups, search])

  const toggleNode = (node: string) => {
    setSelectedNodes(prev =>
      prev.includes(node)
        ? prev.filter(n => n !== node)
        : [...prev, node]
    )
  }

  const selectAll = () => {
    // Select all currently visible (filtered) nodes
    const toAdd = filteredNodes.filter(n => !selectedNodes.includes(n))
    setSelectedNodes(prev => [...prev, ...toAdd])
  }

  const clearSelection = () => {
    setSelectedNodes([])
  }

  const addGroup = () => {
    if (!name.trim() || selectedNodes.length === 0) return
    const group: ProxyGroupEdited = {
      id: nextId++,
      name: name.trim(),
      type,
      proxies: [...selectedNodes],
    }
    if (needsTestConfig) {
      group.url = testUrl
      group.interval = testInterval
    }
    setEditedGroups([...groups, group])
    addLog('add-group', `添加策略组: ${name.trim()} (${type}), 包含 ${selectedNodes.length} 个节点`)
    setName('')
    setSelectedNodes([])
  }

  const removeGroup = (id: number) => {
    const group = groups.find(g => g.id === id)
    if (group) {
      addLog('remove-group', `删除策略组: ${group.name} (${group.type})`)
    }
    setEditedGroups(groups.filter(g => g.id !== id))
  }

  return (
    <div className="ui-card p-6 space-y-6">
      {/* Group Config */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-text-secondary font-medium mb-1.5">
            策略组名称
          </label>
          <input
            id="group-name-input"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="例：手动选择 / 自动测速"
            className="input-base"
          />
        </div>
        <div>
          <label className="block text-xs text-text-secondary font-medium mb-1.5">
            策略组类型
          </label>
          <select
            id="group-type-select"
            value={type}
            onChange={e => setType(e.target.value)}
            className="select-base"
          >
            {GROUP_TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Test config (conditional) */}
      {needsTestConfig && (
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 p-4 rounded-xl bg-bg-input border border-border-default">
          <div>
            <label className="block text-xs text-text-secondary font-medium mb-1.5">
              测试 URL
            </label>
            <input
              id="test-url-input"
              type="url"
              value={testUrl}
              onChange={e => setTestUrl(e.target.value)}
              className="input-base"
            />
          </div>
          <div>
            <label className="block text-xs text-text-secondary font-medium mb-1.5">
              间隔（秒）
            </label>
            <input
              id="test-interval-input"
              type="number"
              value={testInterval}
              onChange={e => setTestInterval(Number(e.target.value))}
              min={30}
              className="input-base w-24"
            />
          </div>
        </div>
      )}

      {/* Node selection */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-text-secondary font-medium">
            包含节点
            {selectedNodes.length > 0 && (
              <span className="ml-2 text-accent">已选 {selectedNodes.length}</span>
            )}
          </label>
          {availableNodes.length > 0 && (
            <div className="flex gap-3">
              <button
                onClick={selectAll}
                className="text-xs text-accent hover:text-accent-hover transition-colors cursor-pointer"
              >
                全选
              </button>
              <button
                onClick={clearSelection}
                className="text-xs text-text-muted hover:text-text-primary transition-colors cursor-pointer"
              >
                清空
              </button>
            </div>
          )}
        </div>

        {/* Node search */}
        {availableNodes.length > 5 && (
          <div className="relative mb-2">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              id="node-search-input"
              type="text"
              value={nodeSearch}
              onChange={e => setNodeSearch(e.target.value)}
              placeholder="搜索节点..."
              className="input-base !pl-10 py-1.5 text-sm"
            />
            {nodeSearch && (
              <button
                onClick={() => setNodeSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary
                           transition-colors cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}

        {availableNodes.length > 0 ? (
          <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto pr-1">
            {filteredNodes.map(node => {
              const isSelected = selectedNodes.includes(node)
              return (
                <button
                  key={node}
                  onClick={() => toggleNode(node)}
                  className={`
                    px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer
                    border
                    ${isSelected
                      ? 'bg-accent border-accent text-white shadow-sm shadow-accent/20'
                      : 'bg-bg-input border-border-default text-text-secondary hover:border-accent/40 hover:text-text-primary'
                    }
                  `}
                >
                  {node}
                </button>
              )
            })}
            {nodeSearch && filteredNodes.length === 0 && (
              <span className="text-xs text-text-muted py-2">未找到匹配的节点</span>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-bg-input border border-border-default">
            <svg className="w-4 h-4 text-text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-text-muted">
              请先在上方导入配置，节点列表将自动加载。
            </p>
          </div>
        )}
      </div>

      {/* Add Button */}
      <div className="flex justify-end">
        <button
          id="add-group-btn"
          onClick={addGroup}
          disabled={!name.trim() || selectedNodes.length === 0}
          className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-medium
                     rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-accent-glow
                     active:scale-[0.97] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed
                     disabled:hover:shadow-none disabled:hover:bg-accent"
        >
          + 添加策略组
        </button>
      </div>

      {/* Search bar for groups list */}
      {groups.length > 0 && (
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              id="group-search-input"
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="搜索策略组（名称、类型、节点）..."
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
            {search ? `${filteredGroups.length} / ${groups.length}` : `${groups.length} 个`}
          </span>
          <button
            onClick={() => {
              addLog('clear-groups', `清空全部策略组: 共 ${groups.length} 个`)
              setEditedGroups([])
            }}
            className="text-xs text-danger hover:text-danger-hover transition-colors cursor-pointer whitespace-nowrap"
          >
            全部清除
          </button>
        </div>
      )}

      {/* Groups List */}
      {filteredGroups.length > 0 && (
        <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
          {filteredGroups.map(group => (
            <div
              key={group.id}
              className="px-4 py-3 rounded-lg bg-bg-input border border-border-default
                         hover:border-accent/30 transition-all duration-200 group"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-text-primary">{group.name}</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded border border-border-default bg-bg-card text-text-secondary">
                  {group.type}
                </span>
                <span className="flex-1" />
                <span className="text-xs text-text-muted">{group.proxies.length} 个节点</span>
                <button
                  onClick={() => removeGroup(group.id)}
                  className="text-text-muted hover:text-danger transition-all duration-200 cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {group.proxies.slice(0, 10).map(p => (
                  <span key={p} className="text-xs px-2 py-0.5 rounded bg-bg-card text-text-secondary">
                    {p}
                  </span>
                ))}
                {group.proxies.length > 10 && (
                  <span className="text-xs px-2 py-0.5 rounded bg-bg-card text-text-muted">
                    +{group.proxies.length - 10} 更多
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Search no results */}
      {groups.length > 0 && search && filteredGroups.length === 0 && (
        <div className="flex flex-col items-center justify-center py-6 text-text-muted">
          <span className="text-sm">未找到匹配 "<span className="text-accent">{search}</span>" 的策略组</span>
        </div>
      )}

      {/* Empty State */}
      {groups.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-text-muted">
          <svg className="w-10 h-10 mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <span className="text-sm">
            {config ? '已导入配置，可在上方创建新策略组' : '暂无策略组，请先导入配置或手动添加'}
          </span>
        </div>
      )}
    </div>
  )
}
