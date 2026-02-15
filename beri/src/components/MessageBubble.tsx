import { useState, useEffect, useRef } from 'react'
import type { Message } from '@/types'

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
  'Kwisatz-haderaching',
  'Caffeinating',
  'Shai-huluding',
  'Three-body-probleming',
  'Murderbot-dairying',
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
  const verb = useRotatingVerb(message.isThinking ?? false)
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
              className="text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors flex items-center gap-1.5"
            >
              {message.isThinking ? (
                <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
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

            {showThinking && message.thinking && (
              <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 whitespace-pre-wrap max-h-48 overflow-y-auto">
                {message.thinking}
                {message.isThinking && (
                  <span className="inline-block w-1.5 h-3 ml-0.5 bg-amber-500 animate-pulse" />
                )}
              </div>
            )}
          </div>
        )}

        {/* Message content */}
        <div className="whitespace-pre-wrap break-words">
          {message.content}
          {message.isStreaming && !message.isThinking && (
            <span className="inline-block w-2 h-4 ml-1 bg-habs-gold animate-pulse" />
          )}
        </div>

        {/* Sources (for assistant messages) */}
        {!isUser && message.sources && message.sources.length > 0 && !message.isStreaming && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs font-semibold text-gray-500 mb-2">Sources:</p>
            <ul className="space-y-1">
              {message.sources.map((source, index) => (
                <li
                  key={index}
                  className="text-xs text-habs-navy/70 flex items-start gap-1"
                >
                  <span className="text-habs-gold">•</span>
                  <span>
                    {source.source} — {source.section}
                  </span>
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
