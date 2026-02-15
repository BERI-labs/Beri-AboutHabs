import { useEffect, useRef } from 'react'

const STORAGE_KEY = 'beri-seen-how-it-works'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export function hasSeenHowItWorks(): boolean {
  return localStorage.getItem(STORAGE_KEY) === 'true'
}

export function markHowItWorksSeen(): void {
  localStorage.setItem(STORAGE_KEY, 'true')
}

export function HowBeriWorks({ isOpen, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null)

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    window.addEventListener('mousedown', handler)
    return () => window.removeEventListener('mousedown', handler)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in">
      <div
        ref={panelRef}
        className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6 animate-slide-up"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-habs-navy">How BERI Works</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M5 5l10 10M15 5L5 15" />
            </svg>
          </button>
        </div>

        <ul className="space-y-3 text-sm text-gray-700">
          <li className="flex gap-3">
            <span className="mt-0.5 text-habs-gold">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
            </span>
            <span><strong>100% local</strong> &mdash; everything runs entirely on your device. No servers, no cloud.</span>
          </li>
          <li className="flex gap-3">
            <span className="mt-0.5 text-habs-gold">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </span>
            <span><strong>Fully private</strong> &mdash; no user data is transmitted or stored outside your device.</span>
          </li>
          <li className="flex gap-3">
            <span className="mt-0.5 text-habs-gold">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            </span>
            <span><strong>Citation-based responses</strong> &mdash; answers include clickable source links so you can verify the information.</span>
          </li>
          <li className="flex gap-3">
            <span className="mt-0.5 text-habs-gold">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            </span>
            <span><strong>Thinks before answering</strong> &mdash; BERI reasons through retrieved information before composing a response.</span>
          </li>
          <li className="flex gap-3">
            <span className="mt-0.5 text-habs-gold">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>
            </span>
            <span><strong>Fully client-side</strong> &mdash; the AI model, embeddings, and school data all run in your browser.</span>
          </li>
        </ul>

        <button
          onClick={onClose}
          className="mt-5 w-full py-2 rounded-lg bg-habs-navy text-white text-sm font-medium hover:bg-habs-navy-light transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  )
}
