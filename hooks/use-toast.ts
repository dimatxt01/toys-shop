"use client"

import { useState, useCallback } from 'react'

export type ToastVariant = 'default' | 'destructive' | 'success'

export interface Toast {
  id: string
  title?: string
  description?: string
  variant?: ToastVariant
}

export interface ToastOptions {
  title?: string
  description?: string
  variant?: ToastVariant
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback(({ title, description, variant = 'default' }: ToastOptions) => {
    const id = Math.random().toString(36).substring(2, 9)
    
    setToasts((prevToasts) => [
      ...prevToasts,
      { id, title, description, variant },
    ])

    // Auto dismiss after 5 seconds
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
    }, 5000)

    return id
  }, [])

  const dismiss = useCallback((toastId: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== toastId))
  }, [])

  return {
    toast,
    dismiss,
    toasts,
  }
}