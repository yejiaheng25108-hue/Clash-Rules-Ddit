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
    <section className="glass-card p-6">
      <button
        id="generate-download-btn"
        onClick={handleGenerate}
        disabled={!hasContent}
        className={`
          w-full py-4 rounded-xl text-base font-semibold text-white cursor-pointer
          transition-all duration-300 active:scale-[0.98]
          relative overflow-hidden group
          ${hasContent
            ? 'bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#a78bfa] hover:from-[#818cf8] hover:via-[#a78bfa] hover:to-[#c4b5fd] shadow-lg shadow-accent-glow hover:shadow-xl hover:shadow-[rgba(139,92,246,0.3)]'
            : 'bg-gradient-to-r from-[#374151] to-[#4b5563] opacity-50 cursor-not-allowed'
          }
        `}
      >
        {/* Shimmer effect */}
        {hasContent && (
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full
                          transition-transform duration-700
                          bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        )}
        <span className="relative flex items-center justify-center gap-2">
          {downloaded ? (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              下载成功！
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              生成并下载配置
            </>
          )}
        </span>
      </button>

      <div className="flex items-center justify-center gap-4 mt-3">
        {hasContent ? (
          <p className="text-xs text-text-muted">
            将合并 <span className="text-text-primary font-medium">{editedRules.length}</span> 条规则 +{' '}
            <span className="text-text-primary font-medium">{editedGroups.length}</span> 个策略组，生成完整 Clash 配置
          </p>
        ) : (
          <p className="text-xs text-text-muted">
            请先添加规则或策略组后再生成配置
          </p>
        )}
      </div>
    </section>
  )
}
