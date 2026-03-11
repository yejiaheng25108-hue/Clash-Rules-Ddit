import { useState } from 'react'
import ConfigImport from './components/ConfigImport'
import RuleEditor from './components/RuleEditor'
import ProxyGroupEditor from './components/ProxyGroupEditor'
import GenerateButton from './components/GenerateButton'

type EditorTab = 'rules' | 'groups'

function App() {
  const [editorTab, setEditorTab] = useState<EditorTab>('rules')

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Title */}
        <header className="text-center mb-2">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[#818cf8] via-[#a78bfa] to-[#c4b5fd] bg-clip-text text-transparent">
            Clash 规则管理器
          </h1>
          <p className="text-sm text-text-muted mt-1">
            导入配置 · 编辑规则 · 管理策略组 · 一键生成
          </p>
        </header>

        {/* Section 1: Config Import */}
        <ConfigImport />

        {/* Section 2: Rule / Group Editor */}
        <section className="glass-card p-6">
          {/* Editor Tabs */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse-dot" />
            <h2 className="text-lg font-semibold text-text-primary">编辑器</h2>
          </div>

          <div className="flex gap-1 p-1 rounded-xl bg-bg-input mb-6">
            <button
              id="tab-rules"
              onClick={() => setEditorTab('rules')}
              className={`
                flex-1 py-2.5 px-4 rounded-lg text-sm font-medium
                transition-all duration-200 cursor-pointer
                ${editorTab === 'rules'
                  ? 'bg-accent text-white shadow-lg shadow-accent-glow'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-card-hover'
                }
              `}
            >
              📜 规则编辑
            </button>
            <button
              id="tab-groups"
              onClick={() => setEditorTab('groups')}
              className={`
                flex-1 py-2.5 px-4 rounded-lg text-sm font-medium
                transition-all duration-200 cursor-pointer
                ${editorTab === 'groups'
                  ? 'bg-accent text-white shadow-lg shadow-accent-glow'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-card-hover'
                }
              `}
            >
              🗂️ 策略组编辑
            </button>
          </div>

          {/* Editor Content */}
          {editorTab === 'rules' ? <RuleEditor /> : <ProxyGroupEditor />}
        </section>

        {/* Section 3: Generate */}
        <GenerateButton />

        {/* Footer */}
        <footer className="text-center text-xs text-text-muted pb-4">
          Clash Rules Manager · UI Only
        </footer>
      </div>
    </div>
  )
}

export default App
