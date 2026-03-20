import { useState } from 'react'
import { createPortal } from 'react-dom'
import yaml from 'js-yaml'
import { useConfig } from '../ConfigContext'

export default function ExportSelectedButton() {
  const { editedRules, editedGroups } = useConfig()
  const [downloaded, setDownloaded] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [filename, setFilename] = useState('selected-rules')

  const selectedRules = editedRules.filter(r => r.isSelected)
  const selectedGroups = editedGroups.filter(g => g.isSelected)
  const hasContent = selectedRules.length > 0 || selectedGroups.length > 0

  const doExport = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const baseConfig: Record<string, any> = {}

    if (selectedGroups.length > 0) {
      baseConfig['proxy-groups'] = selectedGroups.map(g => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const group: Record<string, any> = {
          name: g.name,
          type: g.type,
          proxies: g.proxies,
        }
        if (g.url) group.url = g.url
        if (g.interval) group.interval = g.interval
        return group
      })
    }

    if (selectedRules.length > 0) {
      baseConfig['rules'] = selectedRules.map(r => {
        if (r.type === 'MATCH') return `MATCH,${r.proxy}`
        return `${r.type},${r.target},${r.proxy}`
      })
    }

    const yamlText = yaml.dump(baseConfig, {
      indent: 2,
      lineWidth: -1,
      noRefs: true,
      quotingType: '"',
      forceQuotes: false,
    })

    const blob = new Blob([yamlText], { type: 'text/yaml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const finalName = filename.endsWith('.yaml') || filename.endsWith('.yml') ? filename : `${filename}.yaml`
    a.download = finalName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    setShowModal(false)
    setDownloaded(true)
    setTimeout(() => setDownloaded(false), 3000)
  }

  return (
    <>
      <div className="mt-4">
        <button
          onClick={() => setShowModal(true)}
          disabled={!hasContent}
          className={`
            w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
            transition-all duration-200 cursor-pointer text-text-sidebar border
            ${hasContent
              ? 'border-accent/30 bg-accent/10 hover:bg-accent hover:text-white hover:border-accent text-accent'
              : 'border-white/5 bg-white/5 opacity-50 cursor-not-allowed text-text-muted text-white/50'
            }
          `}
        >
          {downloaded ? (
            <>
              <svg className="w-5 h-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              已打包
            </>
          ) : (
            <>
              <svg className="w-5 h-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              打包选中项
            </>
          )}
        </button>
      </div>

      {showModal && createPortal(
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-bg-card border border-border-default rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-5 animate-in fade-in zoom-in duration-200"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-text-primary">打包选中的规则和策略组</h3>
            <div className="text-xs text-text-muted mb-2">
              将包含 {selectedRules.length} 条规则和 {selectedGroups.length} 个策略组
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">导出文件名</label>
              <div className="relative">
                <input
                  type="text"
                  value={filename}
                  onChange={e => setFilename(e.target.value)}
                  className="input-base w-full pr-14 py-2.5 text-sm bg-bg-primary font-mono focus:ring-accent"
                  autoFocus
                  placeholder="selected-rules"
                  onKeyDown={e => e.key === 'Enter' && filename.trim() && doExport()}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-sm select-none font-mono">
                  .yaml
                </span>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-black/5 rounded-lg transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={doExport}
                disabled={!filename.trim()}
                className="px-6 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-bold rounded-lg transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                确认打包
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
