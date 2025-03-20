"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Toast, ToastVariant } from "@/hooks/use-toast"

interface ToastProps {
  toast: Toast
  onDismiss: (id: string) => void
}

export function ToastComponent({ toast, onDismiss }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 10)

    return () => clearTimeout(timer)
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    setTimeout(() => {
      onDismiss(toast.id)
    }, 300)
  }

  const getVariantStyles = (variant: ToastVariant) => {
    switch (variant) {
      case "destructive":
        return "bg-red-100 border-red-400 text-red-800"
      case "success":
        return "bg-green-100 border-green-400 text-green-800"
      default:
        return "bg-white border-gray-200 text-gray-800 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
    }
  }

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 max-w-md transform transition-all duration-300 ease-in-out",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
        getVariantStyles(toast.variant || "default"),
        "rounded-lg border shadow-lg p-4"
      )}
    >
      <div className="flex items-start">
        <div className="flex-1">
          {toast.title && (
            <h3 className="font-medium text-sm">{toast.title}</h3>
          )}
          {toast.description && (
            <div className="mt-1 text-sm">{toast.description}</div>
          )}
        </div>
        <button
          onClick={handleDismiss}
          className="ml-4 inline-flex flex-shrink-0 justify-center items-center h-5 w-5 rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}