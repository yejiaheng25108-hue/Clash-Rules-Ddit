import { useState } from 'react'

interface ProxyGroup {
  id: number
  name: string
  type: string
  proxies: string[]
  url?: string
  interval?: number
}

const GROUP_TYPES = [
  { value: 'select', label: 'select（手动选择）' },
  { value: 'url-test', label: 'url-test（自动测速）' },
  { value: 'fallback', label: 'fallback（故障转移）' },
  { value: 'load-balance', label: 'load-balance（负载均衡）' },
]

const MOCK_NODES = [
  '🇭🇰 香港 01',
  '🇭🇰 香港 02',
  '🇯🇵 日本 01',
  '🇯🇵 日本 02',
  '🇺🇸 美国 01',
  '🇸🇬 新加坡 01',
  '🇰🇷 韩国 01',
  '🇩🇪 德国 01',
]

let nextId = 1

export default function ProxyGroupEditor() {
  const [name, setName] = useState('')
  const [type, setType] = useState('select')
  const [selectedNodes, setSelectedNodes] = useState<string[]>([])
  const [testUrl, setTestUrl] = useState('http://www.gstatic.com/generate_204')
  const [interval, setInterval] = useState(300)
  const [groups, setGroups] = useState<ProxyGroup[]>([])

  const needsTestConfig = type === 'url-test' || type === 'fallback'

  const toggleNode = (node: string) => {
    setSelectedNodes(prev =>
      prev.includes(node)
        ? prev.filter(n => n !== node)
        : [...prev, node]
    )
  }

  const addGroup = () => {
    if (!name.trim() || selectedNodes.length === 0) return
    const group: ProxyGroup = {
      id: nextId++,
      name: name.trim(),
      type,
      proxies: [...selectedNodes],
    }
    if (needsTestConfig) {
      group.url = testUrl
      group.interval = interval
    }
    setGroups(prev => [...prev, group])
    setName('')
    setSelectedNodes([])
  }

  const removeGroup = (id: number) => {
    setGroups(prev => prev.filter(g => g.id !== id))
  }

  return (
    <div className="space-y-5">
      {/* Group Config */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name */}
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

        {/* Type */}
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
              value={interval}
              onChange={e => setInterval(Number(e.target.value))}
              min={30}
              className="input-base w-24"
            />
          </div>
        </div>
      )}

      {/* Node selection */}
      <div>
        <label className="block text-xs text-text-secondary font-medium mb-2">
          包含节点
          {selectedNodes.length > 0 && (
            <span className="ml-2 text-accent">已选 {selectedNodes.length}</span>
          )}
        </label>
        <div className="flex flex-wrap gap-2">
          {MOCK_NODES.map(node => {
            const isSelected = selectedNodes.includes(node)
            return (
              <button
                key={node}
                onClick={() => toggleNode(node)}
                className={`
                  px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer
                  border
                  ${isSelected
                    ? 'bg-accent/15 border-accent text-accent shadow-sm shadow-accent-glow'
                    : 'bg-bg-input border-border-default text-text-secondary hover:border-accent/40 hover:text-text-primary'
                  }
                `}
              >
                {node}
              </button>
            )
          })}
        </div>
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

      {/* Groups List */}
      {groups.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted font-medium">
              已添加 {groups.length} 个策略组
            </span>
            <button
              onClick={() => setGroups([])}
              className="text-xs text-danger hover:text-danger-hover transition-colors cursor-pointer"
            >
              全部清除
            </button>
          </div>
          <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
            {groups.map(group => (
              <div
                key={group.id}
                className="px-4 py-3 rounded-lg bg-bg-input border border-border-default
                           hover:border-accent/30 transition-all duration-200 group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-text-primary">{group.name}</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-accent/15 text-accent">
                    {group.type}
                  </span>
                  <span className="flex-1" />
                  <span className="text-xs text-text-muted">{group.proxies.length} 个节点</span>
                  <button
                    onClick={() => removeGroup(group.id)}
                    className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-danger
                               transition-all duration-200 cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {group.proxies.map(p => (
                    <span key={p} className="text-xs px-2 py-0.5 rounded bg-bg-card text-text-secondary">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {groups.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-text-muted">
          <svg className="w-10 h-10 mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <span className="text-sm">暂无策略组，请在上方添加</span>
        </div>
      )}
    </div>
  )
}
