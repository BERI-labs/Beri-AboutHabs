import { useState, useCallback, useEffect } from 'react'
import type { Message, LoadingState, MessageSource, ContextChunk } from '@/types'
import { initStorage, loadChunksFromJSON, hasChunks } from '@/lib/storage'
import { initEmbeddings, embed } from '@/lib/embeddings'
import { checkWebGPU, initLLM, generate } from '@/lib/llm'
import { retrieveContext, formatContext, extractSources, tryDirectAnswer, isGarbageResponse, FALLBACK_MESSAGE } from '@/lib/retrieval'
import { getFAQResponse } from '@/lib/faq'
import { LoadingScreen } from '@/components/LoadingScreen'
import { Header } from '@/components/Header'
import { ChatContainer } from '@/components/ChatContainer'
import { InputArea } from '@/components/InputArea'
import { HowBeriWorks, hasSeenHowItWorks, markHowItWorksSeen } from '@/components/HowBeriWorks'

function App() {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    stage: 'checking',
    progress: 0,
    message: 'Checking browser compatibility...',
  })
  const [messages, setMessages] = useState<Message[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [showHowItWorks, setShowHowItWorks] = useState(false)

  const isReady = loadingState.stage === 'ready'

  // Show "How BERI Works" on first visit once the app is ready
  useEffect(() => {
    if (isReady && !hasSeenHowItWorks()) {
      setShowHowItWorks(true)
      markHowItWorksSeen()
    }
  }, [isReady])

  // Initialisation sequence
  useEffect(() => {
    let cancelled = false

    async function initialise() {
      try {
        // Step 1: Check WebGPU
        setLoadingState({
          stage: 'checking',
          progress: 5,
          message: 'Checking WebGPU support...',
        })

        const hasWebGPU = await checkWebGPU()
        if (!hasWebGPU) {
          setLoadingState({
            stage: 'error',
            progress: 0,
            message: 'WebGPU not available',
            error:
              'WebGPU is required but not available in your browser. Please use Microsoft Edge or Chrome 113+ with WebGPU enabled.',
          })
          return
        }

        if (cancelled) return

        // Step 2: Init storage
        setLoadingState({
          stage: 'storage',
          progress: 10,
          message: 'Initialising storage...',
        })

        await initStorage()

        if (cancelled) return

        // Step 3: Init embeddings FIRST (needed for chunk embedding generation)
        setLoadingState({
          stage: 'embeddings',
          progress: 15,
          message: 'Loading embedding model...',
        })

        await initEmbeddings((progress, message) => {
          if (!cancelled) {
            setLoadingState({
              stage: 'embeddings',
              progress: 15 + Math.round(progress * 0.25), // 15-40%
              message,
            })
          }
        })

        if (cancelled) return

        // Step 4: Load chunks with real embeddings
        const chunksLoaded = await hasChunks()
        if (!chunksLoaded) {
          setLoadingState({
            stage: 'chunks',
            progress: 40,
            message: 'Generating content embeddings...',
          })

          await loadChunksFromJSON(embed, (current, total) => {
            if (!cancelled) {
              const chunkProgress = 40 + Math.round((current / total) * 20) // 40-60%
              setLoadingState({
                stage: 'chunks',
                progress: chunkProgress,
                message: `Embedding content ${current}/${total}...`,
              })
            }
          })
        }

        if (cancelled) return

        // Step 5: Init LLM
        setLoadingState({
          stage: 'llm',
          progress: 60,
          message: 'Loading language model...',
        })

        await initLLM((progress, message) => {
          if (!cancelled) {
            setLoadingState({
              stage: 'llm',
              progress: 60 + Math.round(progress * 0.4), // 60-100%
              message,
            })
          }
        })

        if (cancelled) return

        // Ready!
        setLoadingState({
          stage: 'ready',
          progress: 100,
          message: 'Ready to chat!',
        })
      } catch (error) {
        if (!cancelled) {
          console.error('Initialisation error:', error)
          const errorMessage =
            error instanceof Error
              ? error.message
              : typeof error === 'string'
                ? error
                : JSON.stringify(error) || 'An unexpected error occurred during initialisation.'
          console.error('Full init error:', error)
          setLoadingState({
            stage: 'error',
            progress: 0,
            message: 'Failed to initialise',
            error: errorMessage,
          })
        }
      }
    }

    initialise()

    return () => {
      cancelled = true
    }
  }, [])

  // Handle retry after error
  const handleRetry = useCallback(() => {
    window.location.reload()
  }, [])

  // Handle sending a message
  const handleSend = useCallback(async (content: string) => {
    if (isStreaming) return

    // Create user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    }

    // Create placeholder assistant message
    const assistantMessage: Message = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    }

    setMessages((prev) => [...prev, userMessage, assistantMessage])
    setIsStreaming(true)

    try {
      // ── Layer 1: FAQ cache (instant, 0ms) ───────────────────────────
      const faqResponse = getFAQResponse(content)
      if (faqResponse) {
        console.log('Layer 1: FAQ cache hit')
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessage.id
              ? {
                  ...msg,
                  content: faqResponse.answer,
                  sources: faqResponse.sources,
                  isStreaming: false,
                }
              : msg
          )
        )
        return
      }

      // ── Retrieve chunks (shared by layers 2-4) ─────────────────────
      const chunks = await retrieveContext(content)
      const sources: MessageSource[] = extractSources(chunks)
      const contextChunks: ContextChunk[] = chunks.slice(0, 2).map((chunk) => ({
        content: chunk.content,
        source: chunk.metadata.source,
        section: chunk.metadata.section,
        score: chunk.score,
      }))

      // ── Layer 2: Direct chunk answer (high confidence, ~100ms) ──────
      const directAnswer = tryDirectAnswer(chunks)
      if (directAnswer) {
        console.log('Layer 2: direct chunk answer')
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessage.id
              ? {
                  ...msg,
                  content: directAnswer.answer,
                  sources: directAnswer.sources,
                  contextChunks,
                  isStreaming: false,
                }
              : msg
          )
        )
        return
      }

      // ── Layer 3: LLM generation (slow path) ────────────────────────
      const context = formatContext(chunks)
      console.log('Layer 3: LLM generation, chunks:', chunks.length, 'context:', context.length, 'chars')

      let rawStream = ''
      let thinkingContent = ''
      let answerContent = ''
      let inThinkBlock = false
      let thinkDone = false

      await generate(context, content, (token) => {
        rawStream += token

        // Parse <think>...</think> blocks from the stream
        if (!thinkDone) {
          // Check if we've entered a think block
          if (!inThinkBlock && rawStream.includes('<think>')) {
            inThinkBlock = true
          }

          if (inThinkBlock) {
            // Extract thinking content so far
            const thinkStart = rawStream.indexOf('<think>') + 7
            const thinkEnd = rawStream.indexOf('</think>')
            if (thinkEnd !== -1) {
              // Think block complete
              thinkingContent = rawStream.substring(thinkStart, thinkEnd).trim()
              answerContent = rawStream.substring(thinkEnd + 8).trim()
              inThinkBlock = false
              thinkDone = true
            } else {
              // Still thinking
              thinkingContent = rawStream.substring(thinkStart).trim()
            }

            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessage.id
                  ? { ...msg, thinking: thinkingContent, isThinking: !thinkDone, content: answerContent }
                  : msg
              )
            )
            return
          }
        }

        // After thinking (or if no thinking), accumulate answer
        if (thinkDone) {
          const thinkEnd = rawStream.indexOf('</think>')
          answerContent = rawStream.substring(thinkEnd + 8).trim()
        } else {
          answerContent = rawStream.trim()
        }

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessage.id
              ? { ...msg, content: answerContent, isThinking: false }
              : msg
          )
        )
      })

      // ── Layer 4: Garbage detection ──────────────────────────────────
      if (isGarbageResponse(answerContent)) {
        console.log('Layer 4: garbage detected, using fallback')
        answerContent = FALLBACK_MESSAGE
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessage.id
            ? {
                ...msg,
                content: answerContent,
                thinking: thinkingContent || undefined,
                isThinking: false,
                sources,
                contextChunks,
                isStreaming: false,
              }
            : msg
        )
      )
    } catch (error) {
      console.error('Generation error:', error)
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessage.id
            ? {
                ...msg,
                content:
                  'Sorry, I encountered an error while generating a response. Please try again.',
                isStreaming: false,
              }
            : msg
        )
      )
    } finally {
      setIsStreaming(false)
    }
  }, [isStreaming])

  // Show loading screen until ready
  if (!isReady) {
    return <LoadingScreen loadingState={loadingState} onRetry={handleRetry} />
  }

  // Main chat interface
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header isReady={isReady} onHowItWorks={() => setShowHowItWorks(true)} />
      <HowBeriWorks isOpen={showHowItWorks} onClose={() => setShowHowItWorks(false)} />
      <ChatContainer
        messages={messages}
        onSuggestedQuestion={handleSend}
        isStreaming={isStreaming}
      />
      <InputArea
        onSend={handleSend}
        disabled={isStreaming}
        isLoading={isStreaming}
      />
    </div>
  )
}

export default App
