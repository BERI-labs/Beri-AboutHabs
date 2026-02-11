/**
 * Application constants and configuration
 */

// Model identifiers
export const EMBEDDING_MODEL = 'Xenova/all-MiniLM-L6-v2'
// Using 4-bit quantized model for faster inference with broad WebGPU compatibility
export const LLM_MODEL = 'SmolLM2-360M-Instruct-q4f32_1-MLC'

// Retrieval settings
export const TOP_K_CHUNKS = 2
export const SIMILARITY_THRESHOLD = 0.2

// Generation settings
export const MAX_TOKENS = 200
export const TEMPERATURE = 0.3

// LLM context settings (smaller = faster prefill)
export const CONTEXT_WINDOW_SIZE = 1024

// IndexedDB settings
export const DB_NAME = 'beri-abouthabs-db'
export const DB_VERSION = 1
export const CHUNKS_STORE = 'chunks'

// Suggested questions for the welcome screen
export const SUGGESTED_QUESTIONS = [
  'When are the open days?',
  'How do I apply to Haberdashers\'?',
  'What subjects are offered at GCSE?',
  'What extracurricular activities are available?',
]

// System prompt
export const SYSTEM_PROMPT = `You are BERI (Bespoke Education Retrieval Infrastructure), a helpful assistant for learning about Haberdashers' School.

Your role is to answer questions about the school using ONLY the provided context. You must:

1. Answer based solely on the information provided in the context
2. Always cite your sources by mentioning the source name and section
3. If the answer is not in the provided context, say "I couldn't find this information in the school content. Please check the school website or contact the admissions team."
4. Use clear, accessible language appropriate for prospective parents and students
5. Be concise but thorough
6. Never make up or assume information that isn't in the context
7. Use UK British spelling and grammar
8. Be accurate
9. Don't answer random questions that are not related to the school information

Remember: You can only provide information that is explicitly stated in the provided content, and to use the context and only the context that is provided.`
