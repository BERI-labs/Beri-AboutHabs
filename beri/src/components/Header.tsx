interface Props {
  isReady: boolean
  onHowItWorks: () => void
}

/**
 * Application header with logo (left) and "How BERI Works" icon (right).
 * Both elements are pulled toward the centre via max-w + mx-auto.
 */
export function Header({ isReady, onHowItWorks }: Props) {
  const logoUrl = `${import.meta.env.BASE_URL}beri-logo.png`

  return (
    <header className="bg-habs-navy border-b border-habs-navy-light px-4 py-3">
      <div className="max-w-3xl mx-auto flex items-center justify-between">
        {/* Logo — left */}
        <div className="flex items-center gap-3">
          <img
            src={logoUrl}
            alt="BERI Logo"
            className="h-10"
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
          {/* Status dot */}
          <div
            className={`w-2 h-2 rounded-full ${
              isReady ? 'bg-green-400' : 'bg-yellow-400 animate-pulse'
            }`}
            title={isReady ? 'Ready' : 'Loading...'}
          />
        </div>

        {/* How BERI Works — right */}
        <button
          onClick={onHowItWorks}
          className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors text-sm"
          aria-label="How BERI Works"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          How BERI Works
        </button>
      </div>
    </header>
  )
}
