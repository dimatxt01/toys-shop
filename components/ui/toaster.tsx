"use client"

import { useToast } from "@/hooks/use-toast"
import { ToastComponent } from "@/components/ui/toast"

export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <>
      {toasts.map((toast) => (
        <ToastComponent key={toast.id} toast={toast} onDismiss={dismiss} />
      ))}
    </>
  )
}