import { useEffect, useRef } from 'react'
import type { Message } from '@/types'
import { MessageBubble } from './MessageBubble'
import { SuggestedQuestions } from './SuggestedQuestions'

interface Props {
  messages: Message[]
  onSuggestedQuestion: (question: string) => void
  isStreaming: boolean
}

/**
 * Container for chat messages with auto-scroll
 */
export function ChatContainer({ messages, onSuggestedQuestion, isStreaming }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const isEmpty = messages.length === 0

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
      {isEmpty ? (
        // Welcome screen
        <div className="h-full flex flex-col items-center justify-center text-center px-4">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-habs-navy mb-2">
              Welcome to BERI
            </h2>
            <p className="text-gray-600 max-w-md">
              I can help you learn about Haberdashers' School. Ask me
              about admissions, school life, the curriculum, extracurricular
              activities, and more.
            </p>
          </div>
          <SuggestedQuestions
            onSelect={onSuggestedQuestion}
            disabled={isStreaming}
          />
        </div>
      ) : (
        // Message list
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              showSourceHint={
                message.role === 'assistant' &&
                message === messages.find((m) => m.role === 'assistant')
              }
            />
          ))}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  )
}
