"use client"

import { Suspense, useEffect, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { CartProvider, useCart } from "@/components/cart-context"
import { PaymentElement } from "@/components/payment-element"
import { useToast } from "@/hooks/use-toast"

interface PaymentState {
  id?: string
  status?: string
  amount?: number
}

const partnerApiKeys: Record<string, string> = JSON.parse(
  process.env.NEXT_PUBLIC_PARTNER_API_KEYS || "{}"
);

function CheckoutPageContent() {
  const searchParams = useSearchParams()
  const partnerId = searchParams?.get("partner")
  const accountId = searchParams?.get("account")
  const paymentMethodIntentSecret = searchParams?.get("secret")
  const pmId = searchParams?.get("payment_method_id");
  const { items, totalPrice, clearCart } = useCart()
  const { toast } = useToast()

  // Payment state
  const [paymentIntentId, setPaymentIntentId] = useState("")
  const [paymentIntent, setPaymentIntent] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<any>(null);
  const [loading, setLoading] = useState(false)
  const [payment, setPayment] = useState<PaymentState>({})

  const apiKey = partnerApiKeys[partnerId ?? ''];

  const pay = async (token: string, intentId?: string) => {
    try {
      setLoading(true)
      const response = await fetch('/api/pay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_intent_id: intentId || paymentIntentId,
          payment_method_id: token,
          partner_id: partnerId,
          account_id: accountId
        }),
      })

      if (!response.ok) {
        throw new Error('Payment failed')
      }

      const data = await response.json()
      setPayment(data)
      clearCart()
    } catch (error) {
      console.error('Payment error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const createPaymentIntent = async () => {
    setLoading(true)
    try {
      let pmTypes;
      
      // If using stored payment method
      if (pmId) {
        const pm = await fetch(`/api/payment_method/${pmId}?partner_id=${partnerId}&account_id=${accountId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!pm.ok) {
          throw new Error('Failed to fetch payment method')
        }

        const data = await pm.json();
        setPaymentMethod(data);
        pmTypes = [data.payment_method_type];
      } 
      // If using new payment method
      else {
        let match = paymentMethodIntentSecret?.match(/pmi_[a-zA-Z0-9]+/);
        let pmiId = match?.[0];
  
        const pmiResponse = await fetch(
          `/api/payment_method_intent/${pmiId}?secret=${paymentMethodIntentSecret}&partner_id=${partnerId}&account_id=${accountId}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
  
        if (!pmiResponse.ok) {
          throw new Error('Failed to fetch payment method intent')
        }
  
        const data = await pmiResponse.json();
        console.log('PMI data:', data);
        pmTypes = data.payment_method_types;
      }

      // Create payment intent 
      const response = await fetch('/api/payment_intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          partner_id: partnerId,
          account_id: accountId,
          amount: totalPrice + 1, // Add $1 processing fee
          split: true,
          payment_method_types: pmTypes || ['card'], // Default to card if not provided
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create payment intent')
      }

      const intent = await response.json()
      setPaymentIntentId(intent.id)
      setPaymentIntent(intent)
      
      // If using stored payment method, process payment immediately
      if (pmId) {
        console.log('Processing payment with stored payment method')
        await pay(pmId, intent.id) // Pass the intent ID directly
      }

    } catch (error) {
      console.error('Error creating payment intent:', error)
      toast({
        title: "Error",
        description: "Failed to initialize payment. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  if (!partnerId || !accountId) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Missing Information</h1>
            <p className="mb-6">Please select a partner and account to proceed with checkout.</p>
            <Button asChild>
              <Link href="/">Return to Home</Link>
            </Button>
          </div>
        </main>
        <SiteFooter />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-[#F7FAFF]">
          <div className="container px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" asChild>
                  <Link href="/shop">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Shop
                  </Link>
                </Button>
                <h1 className="text-3xl font-bold tracking-tighter text-[#008273]">
                  Complete Your Payment
                </h1>
              </div>

              {payment.id ? (
                <Card className="border-2 shadow-lg">
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl text-green-600">Payment Successful!</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment ID:</span>
                      <span className="font-medium">{payment.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="font-medium">{payment.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="font-medium">${Number((payment.amount || 0 / 100 || 0).toFixed(2)) / 100}</span>
                    </div>
                    <Button 
                      asChild 
                      className="w-full mt-4 bg-[#008273] hover:bg-[#006B5F]"
                    >
                      <Link href="/">Return to Home</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-2">
                    {paymentIntent && paymentMethodIntentSecret && !pmId ? (
                      <PaymentElement
                        apiKey={apiKey}
                        clientSecret={paymentMethodIntentSecret}
                        amount={totalPrice + 1} // Add $1 processing fee
                        pay={pay}
                      />
                    ) : (
                      <Card className="p-6">
                        <Button
                          className="w-full bg-[#008273] hover:bg-[#006B5F]"
                          onClick={createPaymentIntent}
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              {pmId ? "Processing Payment..." : "Initializing Payment..."}
                            </>
                          ) : (
                            pmId ? "Pay Now" : "Proceed to Payment"
                          )}
                        </Button>
                      </Card>
                    )}
                  </div>

                  <div>
                    <Card>
                      <CardHeader>
                        <CardTitle>Order Summary</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {items.map((item) => (
                          <div key={item.id} className="flex justify-between">
                            <span className="text-sm">
                              {item.name} <span className="text-muted-foreground">x{item.quantity}</span>
                            </span>
                            <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}

                        <div className="border-t pt-4 mt-4">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span>${totalPrice.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between mt-2">
                            <span className="text-muted-foreground">Processing Fee</span>
                            <span>$1.00</span>
                          </div>
                          <div className="flex justify-between mt-4 font-bold">
                            <span>Total</span>
                            <span className="text-[#008273]">${(totalPrice + 1).toFixed(2)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <CartProvider>
      <Suspense fallback={<div>Loading...</div>}>
        <CheckoutPageContent />
      </Suspense>
    </CartProvider>
  )
}