"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useForward } from "@/app/forward-provider"

interface PaymentElementProps {
  apiKey: string
  clientSecret: string
  paymentMethodIntentId: string
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
      }) => Promise<{
        mount: (elementId: string, options: any) => () => void
      }>
    }
  }
}

export function PaymentElementV2({ apiKey, clientSecret, paymentMethodIntentId }: PaymentElementProps) {
  const router = useRouter()
  const { isLoaded } = useForward()
  const [processing, setProcessing] = useState(false)
  const [valid, setValid] = useState(false)
  const [tokenize, setTokenize] = useState<() => Promise<void>>(() => Promise.resolve())
  const unmountRef = useRef<(() => void) | undefined>()
  const mountedRef = useRef(false)
  const { toast } = useToast();

  const searchParams = useSearchParams()
  const partnerId = searchParams?.get("partner")
  const accountId = searchParams?.get("account")

  const fetchPaymentMethod = async (token: string) => {
    try {
      const response = await fetch(`/api/payment_method_intent/${paymentMethodIntentId}?partner_id=${partnerId}&account_id=${accountId}&secret=${clientSecret}`)
      if (!response.ok) {
        throw new Error('Failed to fetch payment method details')
      }
      const data = await response.json()
      console.log('Payment method details:', data)

      // Store the complete payment method data with payment method ID
      const storedTokens = JSON.parse(localStorage.getItem('payment_tokens') || '[]')
      storedTokens.push({
        id: data.payment_method.id,
        status: data.status,
        account_id: data.account_id,
        created_at: data.created_at,
        payment_method: data.payment_method,
        validate: data.validate,
        bill_to: data.bill_to,
        latest_validation_response: data.latest_validation_response
      })
      localStorage.setItem('payment_tokens', JSON.stringify(storedTokens))

      // Show success message
      toast({
        title: "Success",
        description: "Payment method stored successfully",
        variant: "success"
      })

      // Navigate back to payment methods page
      router.push(`/payment-methods?partner=${partnerId}&account=${accountId}`)
    } catch (error) {
      console.error('Error fetching payment method:', error)
      toast({
        title: "Error",
        description: "Failed to store payment method details",
        variant: "destructive"
      })
      setProcessing(false)
    }
  }

  useEffect(() => {
    if (!isLoaded || !window.Forward || mountedRef.current) return

    const mount = async () => {
      try {
        mountedRef.current = true
        const paymentElement = await window.Forward.createPaymentElement({
          apiKey,
          clientSecret,
          showLabels: true,
        })

        unmountRef.current = paymentElement.mount("payment-form", {
          style,
          onSuccess: async ({
            token,
            type,
          }: {
            token: string
            type: "bank" | "card"
          }) => {
            // Fetch payment method details after successful tokenization
            await fetchPaymentMethod(token)
          },
          onError: (error: any) => {
            console.error("Payment Element error:", error)
            toast({
              title: "Error",
              description: error.message || "An error occurred with the payment form.",
              variant: "destructive"
            })
            setProcessing(false)
          },
          onCancel: () => {
            console.log("User closed Apple Pay or Google Pay modal")
            toast({
              title: "Payment cancelled",
              description: "You cancelled the payment process.",
              variant: "default"
            })
            setProcessing(false)
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
                setProcessing(false)
              }
            })
          }
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
  }, [apiKey, clientSecret, isLoaded, paymentMethodIntentId, toast, router, partnerId, accountId])

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
        onClick={tokenize}
        disabled={!valid || processing}
      >
        {processing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          "Save Payment Method"
        )}
      </Button>
    </Card>
  )
}