import { useState, useCallback, type KeyboardEvent, type ChangeEvent } from 'react'

interface Props {
  onSend: (message: string) => void
  disabled?: boolean
  isLoading?: boolean
}

/**
 * Chat input area with send button
 */
export function InputArea({ onSend, disabled = false, isLoading = false }: Props) {
  const [input, setInput] = useState('')

  const handleSubmit = useCallback(() => {
    const trimmed = input.trim()
    if (trimmed && !disabled) {
      onSend(trimmed)
      setInput('')
    }
  }, [input, disabled, onSend])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSubmit()
      }
    },
    [handleSubmit]
  )

  const handleChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
  }, [])

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <div className="max-w-3xl mx-auto flex gap-3">
        <textarea
          value={input}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Ask about Haberdashers' School..."
          disabled={disabled}
          rows={1}
          className={`
            flex-1 resize-none rounded-xl border px-4 py-3 text-gray-800
            placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-habs-navy/30
            ${
              disabled
                ? 'bg-gray-100 border-gray-200 cursor-not-allowed'
                : 'bg-white border-gray-300 hover:border-gray-400'
            }
          `}
          style={{ minHeight: '48px', maxHeight: '120px' }}
        />
        <button
          onClick={handleSubmit}
          disabled={disabled || !input.trim()}
          className={`
            px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center min-w-[100px]
            ${
              disabled || !input.trim()
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-habs-navy text-white hover:bg-habs-navy-light active:bg-habs-navy-dark'
            }
          `}
        >
          {isLoading ? (
            <svg
              className="w-5 h-5 animate-spin"
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
          ) : (
            'Send'
          )}
        </button>
      </div>
      <p className="text-center text-xs text-gray-400 mt-2">
        Press Enter to send, Shift+Enter for new line
      </p>
    </div>
  )
}
