"use client"

import { createContext, useContext, useEffect, useState, useRef } from "react"

interface ForwardContextType {
  isLoaded: boolean
}

const ForwardContext = createContext<ForwardContextType>({ isLoaded: false })

export function ForwardProvider({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false)
  const scriptRef = useRef<HTMLScriptElement | null>(null)

  useEffect(() => {
    // Check if Forward is already available globally
    if (typeof window !== 'undefined' && window.Forward) {
      setIsLoaded(true)
      return
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector('script[src*="forward.js"]')
    if (existingScript) {
      existingScript.addEventListener('load', () => setIsLoaded(true))
      return
    }

    // Create and load script only if it doesn't exist
    if (!scriptRef.current) {
      const script = document.createElement('script')
      script.src = 'http://127.0.0.1:4000/forward.js'
      script.async = true
      script.onload = () => setIsLoaded(true)
      
      scriptRef.current = script
      document.body.appendChild(script)

      return () => {
        if (scriptRef.current && scriptRef.current.parentNode) {
          scriptRef.current.parentNode.removeChild(scriptRef.current)
        }
      }
    }
  }, [])

  return (
    <ForwardContext.Provider value={{ isLoaded }}>
      {children}
    </ForwardContext.Provider>
  )
}

export function useForward() {
  const context = useContext(ForwardContext)
  if (!context) {
    throw new Error('useForward must be used within a ForwardProvider')
  }
  return context
}