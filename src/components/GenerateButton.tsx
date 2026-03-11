export default function GenerateButton() {
  return (
    <section className="glass-card p-6">
      <button
        id="generate-download-btn"
        className="w-full py-4 rounded-xl text-base font-semibold text-white cursor-pointer
                   bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#a78bfa]
                   hover:from-[#818cf8] hover:via-[#a78bfa] hover:to-[#c4b5fd]
                   shadow-lg shadow-accent-glow hover:shadow-xl hover:shadow-[rgba(139,92,246,0.3)]
                   transition-all duration-300 active:scale-[0.98]
                   relative overflow-hidden group"
      >
        {/* Shimmer effect */}
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full
                        transition-transform duration-700
                        bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <span className="relative flex items-center justify-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          生成并下载配置
        </span>
      </button>

      <p className="text-center text-xs text-text-muted mt-3">
        合并规则与策略组后生成完整 Clash 配置文件
      </p>
    </section>
  )
}
