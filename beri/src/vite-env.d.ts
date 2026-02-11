/// <reference types="vite/client" />

// WebGPU types
interface Navigator {
  gpu?: GPU
}

interface GPU {
  requestAdapter(): Promise<GPUAdapter | null>
}

interface GPUAdapter {
  // Minimal interface for compatibility check
}

// JSON module declaration
declare module '*.json' {
  const value: unknown
  export default value
}
