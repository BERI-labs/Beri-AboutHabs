import { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Message, MessageSource } from '@/types'

/**
 * Map source names to their Habs website URLs.
 */
const SOURCE_URL_MAP: Record<string, string> = {
  'School Overview': 'https://www.habselstree.org.uk/boys/',
  'Vision and Values': 'https://www.habselstree.org.uk/boys/about-us/our-vision/',
  'Admissions': 'https://www.habselstree.org.uk/boys/admissions/admissions-process/',
  'Fees and Financial Support': 'https://www.habselstree.org.uk/boys/admissions/fees/',
  'Prep School (Ages 4-11)': 'https://www.habselstree.org.uk/boys/prep/life-in-our-prep-school/',
  'Senior School (Years 7-11, Ages 11-16)': 'https://www.habselstree.org.uk/boys/senior/inside-the-classroom/',
  'Sixth Form (Years 12-13, Ages 16-18)': 'https://www.habselstree.org.uk/boys/sixth-form/inside-the-classroom/',
  'Sport and Co-Curricular': 'https://www.habselstree.org.uk/boys/senior/beyond-the-classroom/sport/',
  'Pastoral Care and House System': 'https://www.habselstree.org.uk/boys/',
  'Governance and History': 'https://www.habselstree.org.uk/boys/',
  'Contact Information': 'https://www.habselstree.org.uk/boys/',
}

function getSourceUrl(source: MessageSource): string {
  return SOURCE_URL_MAP[source.source] || 'https://www.habselstree.org.uk/boys/'
}

const THINKING_VERBS = [
  'Thinking',
  'Profound-impacting',
  'Accomplishing',
  'Actioning',
  'Actualizing',
  'Baking',
  'Brewing',
  'Calculating',
  'Cerebrating',
  'Churning',
  'Coalescing',
  'Cogitating',
  'Computing',
  'Conjuring',
  'Considering',
  'Caffeinating',
  'Three-body-probleming',
  'Cogito-ergo-summing',
  'Eudaimonia-chasing',
  'Philosophising',
  'Cultivating',
  'Cooking',
  'Crafting',
  'Creating',
  'Crunching',
  'Deliberating',
  'Determining',
  'Doing',
  'Effecting',
  'Finagling',
  'Forging',
  'Forming',
  'Generating',
  'Hatching',
  'Herding',
  'Honking',
  'Hustling',
  'Ideating',
  'Inferring',
  'Manifesting',
  'Marinating',
  'Moseying',
  'Mulling',
  'Mustering',
  'Musing',
  'Noodling',
  'Percolating',
  'Pondering',
  'Processing',
  'Puttering',
  'Reticulating',
  'Ruminating',
  'Schlepping',
  'Shucking',
  'Simmering',
  'Smooshing',
  'Spinning',
  'Stewing',
  'Synthesizing',
  'Transmuting',
  'Vibing',
  'Working',
  'Innovating',
]

function useRotatingVerb(isActive: boolean): string {
  const [verbIndex, setVerbIndex] = useState(0)
  const usedIndices = useRef<Set<number>>(new Set([0, 1]))

  useEffect(() => {
    if (!isActive) return

    // Start at "Thinking" (index 0), then "Profound-impacting" (index 1),
    // then random from remainder
    const timer = setInterval(() => {
      setVerbIndex((prev) => {
        if (prev === 0) return 1
        // Pick a random unused verb, reset pool if exhausted
        const remaining = Array.from({ length: THINKING_VERBS.length }, (_, i) => i)
          .filter((i) => !usedIndices.current.has(i))
        if (remaining.length === 0) {
          usedIndices.current = new Set([0, 1])
          const pool = Array.from({ length: THINKING_VERBS.length }, (_, i) => i)
            .filter((i) => i !== 0 && i !== 1)
          const next = pool[Math.floor(Math.random() * pool.length)]
          usedIndices.current.add(next)
          return next
        }
        const next = remaining[Math.floor(Math.random() * remaining.length)]
        usedIndices.current.add(next)
        return next
      })
    }, 4000)

    return () => clearInterval(timer)
  }, [isActive])

  return THINKING_VERBS[verbIndex]
}

interface Props {
  message: Message
}

/**
 * Individual message bubble component
 */
export function MessageBubble({ message }: Props) {
  const isUser = message.role === 'user'
  const [showContext, setShowContext] = useState(false)
  const [showThinking, setShowThinking] = useState(false)
  const [showNudge, setShowNudge] = useState(false)
  const verb = useRotatingVerb(message.isThinking ?? false)

  // Show a nudge after 3s of thinking if user hasn't opened the panel
  useEffect(() => {
    if (!message.isThinking || showThinking) {
      setShowNudge(false)
      return
    }
    const timer = setTimeout(() => setShowNudge(true), 3000)
    return () => clearTimeout(timer)
  }, [message.isThinking, showThinking])
  const formattedTime = message.timestamp.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}
    >
      <div
        className={`
          max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3 shadow-md
          ${
            isUser
              ? 'bg-habs-navy text-white rounded-br-md'
              : 'bg-white text-gray-800 rounded-bl-md border border-gray-100'
          }
        `}
      >
        {/* Thinking trace (collapsible — clickable at any time) */}
        {!isUser && (message.thinking || message.isThinking) && (
          <div className="mb-3">
            <button
              onClick={() => setShowThinking(!showThinking)}
              className="text-xs font-semibold text-purple-500 hover:text-purple-600 transition-colors flex items-center gap-1.5"
            >
              {message.isThinking ? (
                <span className="inline-block w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              ) : (
                <svg
                  className={`w-3 h-3 transition-transform ${showThinking ? 'rotate-90' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
              {message.isThinking ? `${verb}...` : `${verb} — click to view`}
            </button>

            {/* Nudge to click the thinking button */}
            {showNudge && !showThinking && (
              <p className="mt-1.5 text-xs text-purple-400 animate-nudge">
                ^ Tap to see BERI&apos;s reasoning
              </p>
            )}

            {showThinking && message.thinking && (
              <div className="mt-2 p-3 bg-purple-50 border border-purple-200 rounded-lg text-xs text-purple-900 whitespace-pre-wrap">
                {message.thinking}
                {message.isThinking && (
                  <span className="inline-block w-1.5 h-3 ml-0.5 bg-purple-400 animate-pulse" />
                )}
              </div>
            )}
          </div>
        )}

        {/* Message content */}
        {isUser ? (
          <div className="whitespace-pre-wrap break-words">
            {message.content}
          </div>
        ) : (
          <div className="break-words prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-headings:my-2 prose-headings:text-habs-navy">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
            {message.isStreaming && !message.isThinking && (
              <span className="inline-block w-2 h-4 ml-1 bg-habs-gold animate-pulse" />
            )}
          </div>
        )}

        {/* Sources (for assistant messages) — clickable links to Habs website */}
        {!isUser && message.sources && message.sources.length > 0 && !message.isStreaming && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs font-semibold text-gray-500 mb-2">Sources:</p>
            <ul className="space-y-1">
              {message.sources.map((source, index) => (
                <li
                  key={index}
                  className="text-xs flex items-start gap-1"
                >
                  <span className="text-habs-gold">•</span>
                  <a
                    href={getSourceUrl(source)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-habs-navy/70 hover:text-habs-navy underline decoration-habs-gold/40 hover:decoration-habs-gold transition-colors"
                  >
                    {source.source} — {source.section}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Context chunks toggle (for assistant messages) */}
        {!isUser && message.contextChunks && message.contextChunks.length > 0 && !message.isStreaming && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <button
              onClick={() => setShowContext(!showContext)}
              className="text-xs font-semibold text-habs-navy/60 hover:text-habs-navy transition-colors flex items-center gap-1"
            >
              <svg
                className={`w-3 h-3 transition-transform ${showContext ? 'rotate-90' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              View context used ({message.contextChunks.length} chunks)
            </button>

            {showContext && (
              <div className="mt-2 space-y-3">
                {message.contextChunks.map((chunk, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-habs-navy">
                        {chunk.source} — {chunk.section}
                      </span>
                      <span className="text-xs text-gray-400">
                        {(chunk.score * 100).toFixed(0)}% match
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 whitespace-pre-wrap">
                      {chunk.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Timestamp */}
        <p
          className={`text-xs mt-2 ${
            isUser ? 'text-white/60' : 'text-gray-400'
          }`}
        >
          {formattedTime}
        </p>
      </div>
    </div>
  )
}
