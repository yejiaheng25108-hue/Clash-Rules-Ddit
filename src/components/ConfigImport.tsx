import { useState } from 'react'

type ImportMode = 'paste' | 'url' | 'file'

export default function ConfigImport() {
  const [mode, setMode] = useState<ImportMode>('paste')
  const [pasteText, setPasteText] = useState('')
  const [subUrl, setSubUrl] = useState('')
  const [fileName, setFileName] = useState('')

  const tabs: { key: ImportMode; icon: string; label: string }[] = [
    { key: 'paste', icon: '📋', label: '粘贴文本' },
    { key: 'url', icon: '🔗', label: '订阅链接' },
    { key: 'file', icon: '📁', label: '导入文件' },
  ]

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) setFileName(file.name)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setFileName(file.name)
  }

  return (
    <section className="glass-card p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-2 h-2 rounded-full bg-accent animate-pulse-dot" />
        <h2 className="text-lg font-semibold text-text-primary">配置导入</h2>
        <span className="text-xs text-text-muted ml-auto">
          选择一种方式导入 Clash 配置
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-bg-input mb-5">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setMode(tab.key)}
            className={`
              flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg
              text-sm font-medium transition-all duration-200 cursor-pointer
              ${mode === tab.key
                ? 'bg-accent text-white shadow-lg shadow-accent-glow'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-card-hover'
              }
            `}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="min-h-[160px]">
        {/* Paste Mode */}
        {mode === 'paste' && (
          <div className="space-y-4">
            <textarea
              id="config-paste-textarea"
              value={pasteText}
              onChange={e => setPasteText(e.target.value)}
              placeholder="在此粘贴 Clash YAML 配置内容..."
              className="input-base min-h-[140px] resize-y font-mono text-[13px] leading-relaxed"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-muted">
                {pasteText ? `${pasteText.split('\n').length} 行` : '等待粘贴...'}
              </span>
              <button
                id="import-paste-btn"
                className="px-5 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium
                           rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-accent-glow
                           active:scale-[0.97] cursor-pointer"
              >
                导入配置
              </button>
            </div>
          </div>
        )}

        {/* URL Mode */}
        {mode === 'url' && (
          <div className="space-y-4">
            <div className="flex gap-3">
              <input
                id="sub-url-input"
                type="url"
                value={subUrl}
                onChange={e => setSubUrl(e.target.value)}
                placeholder="https://example.com/subscribe?token=..."
                className="input-base flex-1"
              />
              <button
                id="fetch-sub-btn"
                className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-medium
                           rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-accent-glow
                           active:scale-[0.97] whitespace-nowrap cursor-pointer"
              >
                获取配置
              </button>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-bg-input border border-border-default">
              <svg className="w-4 h-4 text-text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs text-text-muted">
                填入 Clash 订阅链接后点击获取，系统将自动拉取并解析配置文件。
              </p>
            </div>
          </div>
        )}

        {/* File Mode */}
        {mode === 'file' && (
          <div className="space-y-4">
            <label
              htmlFor="file-upload"
              onDragOver={e => e.preventDefault()}
              onDrop={handleFileDrop}
              className="flex flex-col items-center justify-center gap-3 min-h-[140px]
                         border-2 border-dashed border-border-default rounded-xl
                         hover:border-accent hover:bg-accent-glow/5
                         transition-all duration-300 cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-full bg-bg-input flex items-center justify-center
                              group-hover:bg-accent/10 transition-colors duration-300">
                <svg className="w-6 h-6 text-text-muted group-hover:text-accent transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
              </div>
              {fileName ? (
                <span className="text-sm text-accent font-medium">{fileName}</span>
              ) : (
                <>
                  <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                    拖放文件到此处 或 <span className="text-accent font-medium">点击选择</span>
                  </span>
                  <span className="text-xs text-text-muted">.yaml / .yml 格式</span>
                </>
              )}
              <input
                id="file-upload"
                type="file"
                accept=".yaml,.yml"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
            {fileName && (
              <div className="flex justify-end">
                <button
                  id="import-file-btn"
                  className="px-5 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium
                             rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-accent-glow
                             active:scale-[0.97] cursor-pointer"
                >
                  导入配置
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
