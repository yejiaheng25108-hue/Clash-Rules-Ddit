import { ConfigProvider } from './ConfigContext'
import { LogProvider } from './LogContext'
import Layout from './components/Layout'
import ConfigImport from './components/ConfigImport'
import RuleEditor from './components/RuleEditor'
import ProxyGroupEditor from './components/ProxyGroupEditor'
import GenerateButton from './components/GenerateButton'
import LogPanel from './components/LogPanel'

function App() {
  return (
    <ConfigProvider>
      <LogProvider>
        <Layout 
          headerAction={<GenerateButton />}
          sidebarPanel={<LogPanel sidebar />}
          pageTitle="配置中心"
          pageDescription="在此一站式管理您的 Clash 导入配置、编辑规则、以及策略组设置。"
        >
          <div className="space-y-12">
            <section id="section-import">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse-dot" />
                <h2 className="text-xl font-bold text-text-primary">快速导入配置</h2>
              </div>
              <ConfigImport />
            </section>

            <section id="section-editor">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse-dot" />
                <h2 className="text-xl font-bold text-text-primary">编辑代理规则</h2>
              </div>
              <RuleEditor />
            </section>

            <section id="section-groups" className="pb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-2 rounded-full bg-[#8b5cf6] animate-pulse-dot" />
                <h2 className="text-xl font-bold text-text-primary">管理策略组</h2>
              </div>
              <ProxyGroupEditor />
            </section>
          </div>
        </Layout>
      </LogProvider>
    </ConfigProvider>
  )
}

export default App
