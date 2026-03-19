import { useState } from 'react'
import { createPortal } from 'react-dom'
import yaml from 'js-yaml'
import { useConfig } from '../ConfigContext'

export default function GenerateButton() {
  const { config, editedRules, editedGroups } = useConfig()
  const [downloaded, setDownloaded] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [filename, setFilename] = useState('clash-config')

  const doGenerate = () => {
    // Build the output config object
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let baseConfig: Record<string, any> = {}

    // If we have an imported config, parse it as the base
    if (config?.rawText) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const parsed = yaml.load(config.rawText) as Record<string, any>
        if (parsed && typeof parsed === 'object') {
          baseConfig = { ...parsed }
        }
      } catch {
        // If parse fails, just start fresh
      }
    }

    // Ensure basic fields
    if (!baseConfig['port']) baseConfig['port'] = 7890
    if (!baseConfig['socks-port']) baseConfig['socks-port'] = 7891
    if (!baseConfig['allow-lan']) baseConfig['allow-lan'] = false
    if (!baseConfig['mode']) baseConfig['mode'] = 'Rule'

    // Override proxy-groups with edited groups
    if (editedGroups.length > 0) {
      baseConfig['proxy-groups'] = editedGroups.map(g => {
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

    // Override rules with edited rules
    if (editedRules.length > 0) {
      baseConfig['rules'] = editedRules.map(r => {
        if (r.type === 'MATCH') return `MATCH,${r.proxy}`
        return `${r.type},${r.target},${r.proxy}`
      })
    }

    // Generate YAML
    const yamlText = yaml.dump(baseConfig, {
      indent: 2,
      lineWidth: -1,
      noRefs: true,
      quotingType: '"',
      forceQuotes: false,
    })

    // Download as file
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

  const hasContent = editedRules.length > 0 || editedGroups.length > 0

  return (
    <>
      <button
        id="deploy-changes-btn"
        onClick={() => setShowModal(true)}
        disabled={!hasContent}
        className={`
          px-6 py-2 rounded-full text-sm font-bold text-white cursor-pointer
          transition-all duration-300 active:scale-[0.97]
          flex items-center gap-2 shadow-sm
          ${hasContent
            ? 'bg-accent hover:bg-accent-hover shadow-accent-glow hover:shadow-md'
            : 'bg-text-muted/50 text-white/70 cursor-not-allowed shadow-none'
          }
        `}
      >
        {downloaded ? (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            已下载
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
               <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v13.5m0 0l-7.5-7.5m7.5 7.5l7.5-7.5" />
            </svg>
            下载配置
          </>
        )}
      </button>

      {/* Filename Modal */}
      {showModal && createPortal(
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-bg-card border border-border-default rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-5 animate-in fade-in zoom-in duration-200"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-text-primary">保存配置文件</h3>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">配置文件名称</label>
              <div className="relative">
                <input
                  type="text"
                  value={filename}
                  onChange={e => setFilename(e.target.value)}
                  className="input-base w-full pr-14 py-2.5 text-sm bg-bg-primary font-mono focus:ring-accent"
                  autoFocus
                  placeholder="clash-config"
                  onKeyDown={e => e.key === 'Enter' && filename.trim() && doGenerate()}
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
                onClick={doGenerate}
                disabled={!filename.trim()}
                className="px-6 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-bold rounded-lg transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v13.5m0 0l-7.5-7.5m7.5 7.5l7.5-7.5" />
                </svg>
                确认下载
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
