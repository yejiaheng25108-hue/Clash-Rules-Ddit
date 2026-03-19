import { useState } from 'react'
import { useConfig } from '../ConfigContext'
import { parseClashYaml, fetchSubscription } from '../utils/parser'

type ImportMode = 'paste' | 'url' | 'file'

export default function ConfigImport() {
  const { setConfig, importStatus, setImportStatus, setEditedRules, setEditedGroups, config } = useConfig()
  const [mode, setMode] = useState<ImportMode>('paste')
  const [pasteText, setPasteText] = useState('')
  const [subUrl, setSubUrl] = useState('')
  const [fileName, setFileName] = useState('')
  const [fileContent, setFileContent] = useState('')

  /** Core import handler: parses text and updates context */
  const doImport = (text: string, source: string) => {
    try {
      const config = parseClashYaml(text)
      setConfig(config)
      setEditedRules(config.rules)
      setEditedGroups(
        config.proxyGroups.map((g, i) => ({
          id: i + 1,
          name: g.name,
          type: g.type,
          proxies: g.proxies,
          url: g.url,
          interval: g.interval,
        }))
      )
      setImportStatus({
        state: 'success',
        proxyCount: config.proxyNames.length,
        groupCount: config.proxyGroups.length,
        ruleCount: config.rules.length,
      })
    } catch (e) {
      setImportStatus({
        state: 'error',
        message: `${source}失败: ${e instanceof Error ? e.message : String(e)}`,
      })
    }
  }

  /** Paste import */
  const handlePasteImport = () => {
    if (!pasteText.trim()) return
    doImport(pasteText, '文本解析')
  }

  /** URL import */
  const handleUrlImport = async () => {
    if (!subUrl.trim()) return
    setImportStatus({ state: 'loading', message: '正在获取订阅...' })
    try {
      const text = await fetchSubscription(subUrl.trim())
      doImport(text, '订阅获取')
    } catch (e) {
      setImportStatus({
        state: 'error',
        message: `订阅获取失败: ${e instanceof Error ? e.message : String(e)}`,
      })
    }
  }

  /** File read */
  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) readFile(file)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) readFile(file)
  }

  const readFile = (file: File) => {
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = () => {
      const text = reader.result as string
      setFileContent(text)
    }
    reader.readAsText(file)
  }

  const handleFileImport = () => {
    if (!fileContent) return
    doImport(fileContent, '文件解析')
  }

  return (
    <div className="space-y-6">
      <div className="flex bg-bg-card-hover rounded-lg p-1 w-full md:w-80 border border-border-default mx-auto shadow-sm">
        <button 
          onClick={() => setMode('paste')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${mode === 'paste' ? 'bg-white shadow-sm text-accent' : 'text-text-secondary hover:text-text-primary'}`}
        >粘贴文本</button>
        <button 
          onClick={() => setMode('url')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${mode === 'url' ? 'bg-white shadow-sm text-accent' : 'text-text-secondary hover:text-text-primary'}`}
        >远程链接</button>
        <button 
          onClick={() => setMode('file')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${mode === 'file' ? 'bg-white shadow-sm text-accent' : 'text-text-secondary hover:text-text-primary'}`}
        >本地文件</button>
      </div>

      {/* Input Areas based on Mode */}
      <div className="ui-card p-6">
        {mode === 'paste' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-text-primary">粘贴配置内容</h3>
            </div>
            <textarea
              value={pasteText}
              onChange={e => setPasteText(e.target.value)}
              placeholder="在此粘贴原生的 YAML 规则..."
              className="input-base min-h-[160px] resize-y font-mono text-[13px] leading-relaxed bg-[#fafafa]"
            />
            <div className="flex items-center justify-end">
              <button
                onClick={handlePasteImport}
                disabled={!pasteText.trim()}
                className="px-6 py-2.5 bg-[#1e293b] hover:bg-[#0f172a] text-white text-sm font-bold
                           rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
                           flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                解析导入
              </button>
            </div>
          </div>
        )}

        {mode === 'url' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-text-primary">订阅设置</h3>
              {config ? (
                <span className="text-[10px] font-bold px-2 py-1 bg-success/15 text-success rounded-md tracking-wider">
                  已生效
                </span>
              ) : null}
            </div>

            <div className="bg-accent/10 border-l-[3px] border-accent/60 rounded-r-lg p-3 text-xs leading-relaxed text-text-secondary">
              <span className="font-bold text-accent mr-1">⚠️ 格式说明：</span>
              为了保护您的节点隐私，本工具不使用第三方服务器转换订阅。此处<strong className="text-text-primary font-bold">仅支持且强制要求原生 Clash 格式</strong>的订阅链接。如果您拥有的是通用订阅，请先将其导入您的主流代理客户端中，随后导出扩展名为 .yaml 的配置文件，再切至“本地文件”进行解析导入。
            </div>
            
            <div className="flex gap-3 items-center mt-2">
              <div className="relative flex-1">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
                <input
                  type="url"
                  value={subUrl}
                  onChange={e => setSubUrl(e.target.value)}
                  placeholder="https://provider.com/subscribe?token=xyz123..."
                  className="input-base !pl-11 py-3 text-[13px] bg-[#fafafa]"
                  onKeyDown={e => e.key === 'Enter' && handleUrlImport()}
                />
              </div>
              <button
                onClick={handleUrlImport}
                disabled={!subUrl.trim() || importStatus.state === 'loading'}
                className="px-6 py-3 bg-[#1e293b] hover:bg-[#0f172a] text-white text-sm font-bold
                           rounded-xl transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
                           flex items-center gap-2 shrink-0 shadow-sm"
              >
                {importStatus.state === 'loading' ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                )}
                一键更新
              </button>
            </div>
          </div>
        )}

        {mode === 'file' && (
          <div className="space-y-4">
             <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-text-primary">上传配置文件</h3>
            </div>
            <label
              htmlFor="file-upload"
              onDragOver={e => e.preventDefault()}
              onDrop={handleFileDrop}
              className="flex flex-col items-center justify-center gap-3 min-h-[160px]
                         border-2 border-dashed border-border-input rounded-xl bg-[#fafafa]
                         hover:border-accent
                         transition-colors cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-full bg-white border border-border-default shadow-sm flex items-center justify-center
                              group-hover:border-accent/30 transition-colors">
                <svg className="w-5 h-5 text-text-muted group-hover:text-accent transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
              </div>
              {fileName ? (
                <span className="text-sm text-text-primary font-bold">{fileName}</span>
              ) : (
                <>
                  <span className="text-sm font-medium text-text-secondary group-hover:text-text-primary transition-colors">
                    将文件拖放至此 或 <span className="text-accent">点击浏览选择</span>
                  </span>
                  <span className="text-xs text-text-muted">支持 .yaml 与 .yml 格式</span>
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
                  onClick={handleFileImport}
                  className="px-6 py-2.5 bg-[#1e293b] hover:bg-[#0f172a] text-white text-sm font-bold
                           rounded-lg transition-colors cursor-pointer flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  解析文件
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Global Status Banner overlaid if success/error */}
      {importStatus.state === 'success' && (
        <div className="p-4 rounded-xl bg-success/10 border border-success/20 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-success flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-bold text-success mb-0.5">配置已成功导入</h4>
            <p className="text-xs text-success/80">
              载入 {importStatus.ruleCount} 条规则, {importStatus.groupCount} 个策略组, 以及 {importStatus.proxyCount} 个节点.
            </p>
          </div>
        </div>
      )}

      {importStatus.state === 'error' && (
        <div className="p-4 rounded-xl bg-danger/10 border border-danger/20 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-danger flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-bold text-danger mb-0.5">导入失败</h4>
            <p className="text-xs text-danger/80">{importStatus.message}</p>
          </div>
        </div>
      )}
    </div>
  )
}
