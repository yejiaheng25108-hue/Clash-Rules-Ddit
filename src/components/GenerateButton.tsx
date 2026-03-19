import { useState } from 'react'
import yaml from 'js-yaml'
import { useConfig } from '../ConfigContext'

export default function GenerateButton() {
  const { config, editedRules, editedGroups } = useConfig()
  const [downloaded, setDownloaded] = useState(false)

  const handleGenerate = () => {
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
    a.download = 'clash-config.yaml'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    setDownloaded(true)
    setTimeout(() => setDownloaded(false), 3000)
  }

  const hasContent = editedRules.length > 0 || editedGroups.length > 0

  return (
    <button
      id="deploy-changes-btn"
      onClick={handleGenerate}
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
  )
}
