import { SUGGESTED_QUESTIONS } from '@/lib/constants'

interface Props {
  onSelect: (question: string) => void
  disabled?: boolean
}

/**
 * Suggested question buttons for the welcome screen
 */
export function SuggestedQuestions({ onSelect, disabled = false }: Props) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-500 mb-3">Try asking:</p>
      <div className="flex flex-wrap gap-2">
        {SUGGESTED_QUESTIONS.map((question, index) => (
          <button
            key={index}
            onClick={() => onSelect(question)}
            disabled={disabled}
            className={`
              px-4 py-2 text-sm text-left rounded-lg border transition-all
              ${
                disabled
                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                  : 'bg-white text-habs-navy border-habs-navy/20 hover:border-habs-navy hover:bg-habs-navy/5 active:bg-habs-navy/10'
              }
            `}
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  )
}
