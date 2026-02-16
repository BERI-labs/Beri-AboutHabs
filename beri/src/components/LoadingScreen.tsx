import type { LoadingState } from '@/types'

interface Props {
  loadingState: LoadingState
  onRetry?: () => void
}

/**
 * Loading screen shown during app initialisation
 */
export function LoadingScreen({ loadingState, onRetry }: Props) {
  const isError = loadingState.stage === 'error'
  const isDeviceBlocked = isError && loadingState.message === 'Device not supported'
  const logoUrl = `${import.meta.env.BASE_URL}beri-logo.png`

  return (
    <div className="min-h-screen bg-gradient-to-b from-habs-navy to-habs-navy-dark flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          {/* Left column: logo + progress */}
          <div className="text-center md:flex-1">
            {/* Logo */}
            <div className="mb-8">
              <img
                src={logoUrl}
                alt="BERI Logo"
                className="h-64 mx-auto mb-4"
              />
              <p className="text-habs-gold text-sm">
                Bespoke Education Retrieval Infrastructure
              </p>
            </div>

            {/* Loading indicator or error */}
            {isError ? (
              <div className="bg-red-900/30 border border-red-500/50 rounded-xl p-6 mb-6">
                <svg
                  className="w-12 h-12 mx-auto mb-4 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <p className="text-red-300 mb-4">{loadingState.error}</p>
                {onRetry && !isDeviceBlocked && (
                  <button
                    onClick={onRetry}
                    className="px-6 py-2 bg-habs-gold text-habs-navy-dark font-semibold rounded-lg hover:bg-habs-gold-light transition-colors"
                  >
                    Retry
                  </button>
                )}
              </div>
            ) : (
              <div className="mb-6">
                {/* Progress bar */}
                <div className="h-2 bg-habs-navy-light rounded-full overflow-hidden mb-4">
                  <div
                    className="h-full bg-habs-gold transition-all duration-300 ease-out"
                    style={{ width: `${loadingState.progress}%` }}
                  />
                </div>

                {/* Status message */}
                <p className="text-white/80 text-sm">{loadingState.message}</p>

                {/* Loading spinner */}
                <div className="mt-6">
                  <svg
                    className="w-8 h-8 mx-auto text-habs-gold animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                </div>
              </div>
            )}

            {/* Browser requirement note (hide when the issue is device compute, not browser) */}
            {!isDeviceBlocked && (
              <p className="text-white/50 text-xs">
                BERI requires a WebGPU-compatible browser (Microsoft Edge or Chrome 113+)
              </p>
            )}
          </div>

          {/* Right column: How BERI Works (always shown during loading) */}
          <div className="md:flex-1 w-full animate-fade-in">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-habs-gold mb-4">How BERI Works</h2>

              <ul className="space-y-3 text-sm text-white/80">
                <li className="flex gap-3">
                  <span className="mt-0.5 text-habs-gold shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                  </span>
                  <span><strong className="text-white">Ask anything about Habs Boys</strong> &mdash; fees, admissions, subjects, sports, facilities, and more. BERI will find the answer.</span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-0.5 text-habs-gold shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
                  </span>
                  <span><strong className="text-white">100% local</strong> &mdash; everything runs entirely on your device. No servers, no cloud.</span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-0.5 text-habs-gold shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  </span>
                  <span><strong className="text-white">Fully private</strong> &mdash; no user data is transmitted or stored outside your device.</span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-0.5 text-habs-gold shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                  </span>
                  <span><strong className="text-white">Citation-based</strong> &mdash; answers include clickable source links so you can verify the information.</span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-0.5 text-habs-gold shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>
                  </span>
                  <span><strong className="text-white">Fully client-side</strong> &mdash; the AI model, embeddings, and school data all run in your browser.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
