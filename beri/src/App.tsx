import { useState, useCallback, useEffect } from 'react'
import type { Message, LoadingState, MessageSource, ContextChunk } from '@/types'
import { initStorage, loadChunksFromJSON, hasChunks } from '@/lib/storage'
import { initEmbeddings, embed } from '@/lib/embeddings'
import { checkWebGPU, initLLM, generate, warmUp } from '@/lib/llm'
import { retrieveContext, formatContext, extractSources, isGarbageResponse, FALLBACK_MESSAGE } from '@/lib/retrieval'
import { getFAQResponse } from '@/lib/faq'
import { detectDevice } from '@/lib/device'
import { LoadingScreen } from '@/components/LoadingScreen'
import { Header } from '@/components/Header'
import { ChatContainer } from '@/components/ChatContainer'
import { InputArea } from '@/components/InputArea'
import { HowBeriWorks } from '@/components/HowBeriWorks'

function App() {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    stage: 'checking',
    progress: 0,
    message: 'Checking browser compatibility...',
  })
  const [messages, setMessages] = useState<Message[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [showHowItWorks, setShowHowItWorks] = useState(false)
  const [thinkingEnabled, setThinkingEnabled] = useState(false)
  const isReady = loadingState.stage === 'ready'

  // Initialisation sequence
  useEffect(() => {
    let cancelled = false

    async function initialise() {
      try {
        // Step 0: Detect device capabilities
        const device = detectDevice()
        console.log('Device detection:', device)

        if (device.tier === 'blocked') {
          setLoadingState({
            stage: 'error',
            progress: 0,
            message: 'Device not supported',
            error:
              "BERI doesn't currently work on phones or low-compute devices (less than 8 GB RAM). Try it on a more powerful laptop or computer!",
          })
          return
        }

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

        // Step 3: Load embeddings + LLM in parallel for faster init
        let embProg = 0
        let llmProg = 0
        let chunkProg = 0

        const updateProgress = (msg: string) => {
          if (cancelled) return
          // Embeddings: 24% weight, LLM: 40% weight, Chunks: 16% weight
          const combined = 10 + (embProg / 100) * 24 + (llmProg / 100) * 40 + (chunkProg / 100) * 16
          setLoadingState({
            stage: 'loading',
            progress: Math.min(90, Math.round(combined)),
            message: msg,
          })
        }

        setLoadingState({
          stage: 'loading',
          progress: 10,
          message: 'Loading models in parallel...',
        })

        // Start LLM download in background
        const llmPromise = initLLM((progress, message) => {
          llmProg = progress
          updateProgress(message)
        })
        llmPromise.catch(() => {}) // Prevent unhandled rejection warning

        // Load embeddings concurrently
        await initEmbeddings((progress, message) => {
          embProg = progress
          updateProgress(message)
        })

        if (cancelled) return

        // Load chunks while LLM may still be downloading
        const chunksLoaded = await hasChunks()
        if (!chunksLoaded) {
          await loadChunksFromJSON(embed, (current, total) => {
            if (!cancelled) {
              chunkProg = (current / total) * 100
              updateProgress(`Embedding content ${current}/${total}...`)
            }
          })
        }

        if (cancelled) return

        // Wait for LLM to finish (may already be done)
        await llmPromise

        if (cancelled) return

        // Step 4: Warm-up inference — pre-compile WebGPU shaders
        setLoadingState({
          stage: 'loading',
          progress: 92,
          message: 'Warming up GPU...',
        })

        await warmUp()

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

      // ── Retrieve chunks (shared by layers 2-3) ──────────────────────
      const chunks = await retrieveContext(content)
      const sources: MessageSource[] = extractSources(chunks)
      const contextChunks: ContextChunk[] = chunks.slice(0, 2).map((chunk) => ({
        content: chunk.content,
        source: chunk.metadata.source,
        section: chunk.metadata.section,
        score: chunk.score,
      }))

      // ── Layer 2: LLM generation ──────────────────────────────────
      const context = formatContext(chunks)
      console.log('Layer 2: LLM generation, chunks:', chunks.length, 'context:', context.length, 'chars')

      // Streaming accumulator (local, not React state — flushed at throttled intervals)
      const stream = {
        raw: '',
        thinking: '',
        answer: '',
        inThinkBlock: false,
        thinkDone: false,
      }

      const THROTTLE_MS = 80

      const flushToState = () => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessage.id
              ? {
                  ...msg,
                  content: stream.answer,
                  thinking: stream.thinking || undefined,
                  isThinking: stream.inThinkBlock,
                }
              : msg
          )
        )
      }

      // Render markdown at ~12 fps instead of per-token
      const throttleTimer = window.setInterval(flushToState, THROTTLE_MS)

      await generate(context, content, (token) => {
        stream.raw += token

        // Parse <think>...</think> blocks
        if (!stream.thinkDone) {
          if (!stream.inThinkBlock && stream.raw.includes('<think>')) {
            stream.inThinkBlock = true
          }

          if (stream.inThinkBlock) {
            const thinkStart = stream.raw.indexOf('<think>') + 7
            const thinkEnd = stream.raw.indexOf('</think>')
            if (thinkEnd !== -1) {
              stream.thinking = stream.raw.substring(thinkStart, thinkEnd).trim()
              stream.answer = stream.raw.substring(thinkEnd + 8).trim()
              stream.inThinkBlock = false
              stream.thinkDone = true
            } else {
              stream.thinking = stream.raw.substring(thinkStart).trim()
            }
            return
          }
        }

        // After thinking (or no thinking), accumulate answer
        if (stream.thinkDone) {
          const thinkEnd = stream.raw.indexOf('</think>')
          stream.answer = stream.raw.substring(thinkEnd + 8).trim()
        } else {
          stream.answer = stream.raw.trim()
        }
      }, thinkingEnabled)

      // Stop throttled rendering and do final flush
      clearInterval(throttleTimer)

      // ── Layer 3: Garbage detection ──────────────────────────────────
      if (isGarbageResponse(stream.answer)) {
        console.log('Layer 3: garbage detected, using fallback')
        stream.answer = FALLBACK_MESSAGE
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessage.id
            ? {
                ...msg,
                content: stream.answer,
                thinking: stream.thinking || undefined,
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
  }, [isStreaming, thinkingEnabled])

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
        thinkingEnabled={thinkingEnabled}
        onToggleThinking={() => setThinkingEnabled((prev) => !prev)}
      />
    </div>
  )
}

export default App
