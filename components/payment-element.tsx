"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useForward } from "@/app/forward-provider"

interface PaymentElementProps {
  apiKey: string
  clientSecret: string
  amount: number
  pay: (token: string) => Promise<void>
}

// Payment Element styles
const style = {
  base: {
    fontSize: '16px',
    color: '#0A2540',
    '::placeholder': {
      color: '#6B7280',
    },
  },
  invalid: {
    color: '#EF4444',
  },
}

declare global {
  interface Window {
    Forward: {
      createPaymentElement: (options: {
        apiKey: string
        clientSecret: string
        showLabels?: boolean
        googlePayMerchantId?: string
      }) => Promise<{
        mount: (elementId: string, options: any) => () => void
      }>
    }
  }
}

export function PaymentElement({ apiKey, clientSecret, amount, pay }: PaymentElementProps) {
  const { isLoaded } = useForward()
  const [processing, setProcessing] = useState(false)
  const [bankPaymentMethodId, setBankPaymentMethodId] = useState<string | null>(null)
  const [valid, setValid] = useState(false)
  const [tokenize, setTokenize] = useState<() => Promise<void>>(() => Promise.resolve())
  const unmountRef = useRef<(() => void) | undefined>()
  const mountedRef = useRef(false)
  const { toast } = useToast()

  useEffect(() => {
    if (!isLoaded || !window.Forward || mountedRef.current) return

    const mount = async () => {
      try {
        mountedRef.current = true
        const paymentElement = await window.Forward.createPaymentElement({
          apiKey,
          clientSecret,
          showLabels: true,
          googlePayMerchantId: process.env.NEXT_PUBLIC_GOOGLE_PAY_MERCHANT_ID,
        })

        unmountRef.current = paymentElement.mount("payment-form", {
          style,
          onSuccess: ({
            token,
            type,
          }: {
            token: string
            type: "bank" | "card"
          }) => {
            if (type === "bank") {
              setBankPaymentMethodId(token)
              setValid(true)
            } else {
              setProcessing(true)
              pay(token)
                .then(() => {
                  console.log("Payment successful")
                  toast({
                    title: "Payment successful",
                    description: "Your payment has been processed successfully.",
                    variant: "success"
                  })
                })
                .catch((error) => {
                  console.error("Error paying:", error)
                  toast({
                    title: "Payment failed",
                    description: "There was an error processing your payment. Please try again.",
                    variant: "destructive"
                  })
                })
                .finally(() => {
                  setProcessing(false)
                })
            }
          },
          onError: (error: any) => {
            console.error("Payment Element error:", error)
            toast({
              title: "Error",
              description: error.message || "An error occurred with the payment form.",
              variant: "destructive"
            })
          },
          onCancel: () => {
            console.log("User closed Apple Pay or Google Pay modal")
            toast({
              title: "Payment cancelled",
              description: "You cancelled the payment process.",
              variant: "default"
            })
          },
          onChange: (event: any) => {
            console.log("Event from Payment Element:", event)
          },
          onReady: (tokenize: any) => {
            setValid(true)
            setTokenize(() => async () => {
              setProcessing(true)
              try {
                await tokenize()
              } catch (error) {
                console.error("Error tokenizing:", error)
                toast({
                  title: "Error",
                  description: "Failed to process payment method. Please try again.",
                  variant: "destructive"
                })
              }
            })
          },
          _manualBank: true,
        })
      } catch (error) {
        console.error("Error mounting Payment Element:", error)
        toast({
          title: "Error",
          description: "Failed to initialize payment form. Please try again.",
          variant: "destructive"
        })
        mountedRef.current = false
      }
    }

    mount()

    return () => {
      if (unmountRef.current) {
        unmountRef.current()
        mountedRef.current = false
      }
    }
  }, [apiKey, clientSecret, isLoaded, pay, toast])

  if (!isLoaded) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div id="payment-form" className="mb-6 min-h-[200px]" />
      <Button
        className="w-full bg-[#008273] hover:bg-[#006B5F]"
        onClick={async () => {
          if (bankPaymentMethodId) {
            setProcessing(true)
            try {
              await pay(bankPaymentMethodId)
              toast({
                title: "Payment successful",
                description: "Your payment has been processed successfully.",
                variant: "success"
              })
            } catch (error) {
              console.error("Payment error:", error)
              toast({
                title: "Payment failed",
                description: "There was an error processing your payment. Please try again.",
                variant: "destructive"
              })
            } finally {
              setProcessing(false)
            }
          } else {
            await tokenize()
          }
        }}
        disabled={!valid || processing}
      >
        {processing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          `Pay $${amount.toFixed(2)}`
        )}
      </Button>
    </Card>
  )
}