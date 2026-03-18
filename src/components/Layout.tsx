import { type ReactNode } from 'react'

export type PageView = 'import' | 'editor' | 'groups' | 'settings' | 'console'

interface LayoutProps {
  children: ReactNode
  headerAction?: ReactNode
  sidebarPanel?: ReactNode
  pageTitle: string
  pageDescription: string
}

export default function Layout({ 
  children,
  headerAction,
  sidebarPanel,
  pageTitle,
  pageDescription
}: LayoutProps) {
  
  const navItems = [
    { section: '平台管理', items: [
      { id: 'import', label: '配置导入', icon: '📥' },
      { id: 'editor', label: '规则编辑', icon: '📜' },
      { id: 'groups', label: '策略组管理', icon: '🗂️' },
    ]}
  ] as const

  return (
    <div className="flex h-screen bg-bg-primary overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[260px] bg-bg-sidebar flex flex-col shrink-0 text-text-sidebar">
        {/* Logo */}
        <div className="p-6">
          <div className="flex items-center gap-3 text-accent font-black text-xl tracking-tight">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <rect x="2" y="4" width="4" height="16" rx="1" />
              <rect x="10" y="8" width="4" height="12" rx="1" />
              <rect x="18" y="2" width="4" height="18" rx="1" />
            </svg>
            CLASH 规则
          </div>
          <div className="text-[11px] text-text-sidebar/60 mt-1 font-mono">
            v2.4.0 稳定版核心
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-8 overflow-y-auto mt-2">
          {navItems.map(group => (
            <div key={group.section}>
              <h3 className="text-[10px] font-bold text-text-sidebar/50 mb-3 ml-2 tracking-wider">
                {group.section}
              </h3>
              <ul className="space-y-1">
                {group.items.map(item => {
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => {
                          const el = document.getElementById(`section-${item.id}`)
                          el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                        }}
                        className={`
                          w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                          transition-all duration-200 cursor-pointer text-text-sidebar
                          hover:bg-bg-sidebar-hover hover:text-white
                        `}
                      >
                        <span className="text-base opacity-70">
                          {item.icon}
                        </span>
                        {item.label}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Embedded Sidebar Logs */}
        {sidebarPanel && (
          <div className="flex-1 min-h-0 px-4 mt-6 mb-4 flex flex-col">
            {sidebarPanel}
          </div>
        )}

        {/* User Profile */}
        <div className="p-4 border-t border-text-sidebar/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#fcd34d] flex items-center justify-center shrink-0 shadow-inner">
              <span className="text-[#92400e] font-bold text-lg">管</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-white truncate">系统管理员</div>
              <div className="text-[11px] text-accent truncate">已连接: 127.0.0.1</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Header */}
        <header className="h-[72px] shrink-0 border-b border-border-default bg-white/50 backdrop-blur flex items-center px-8 z-10">
          
          <div className="flex flex-col">
            <h1 className="text-xl font-extrabold text-text-primary tracking-tight leading-tight">
              {pageTitle}
            </h1>
            <p className="text-[11px] text-text-secondary mt-0.5">
              {pageDescription}
            </p>
          </div>

          <div className="flex-1" />

          {/* Actions */}
          <div className="flex items-center gap-5">
            <a 
              href="https://github.com/yejiaheng25108-hue/Clash-Rules-Ddit" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-text-muted hover:text-accent transition-colors cursor-pointer relative block"
              title="访问项目 GitHub 主页"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </a>
            
            {headerAction}
          </div>
        </header>

        {/* Scrollable Page Content */}
        <div className="flex-1 overflow-y-auto min-h-0 bg-bg-primary">
          <div className="max-w-6xl mx-auto w-full px-4 md:px-8 pt-6 md:pt-8 pb-12">
            {/* Content Injection */}
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
