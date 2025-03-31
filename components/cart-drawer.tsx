"use client"

import { useState } from "react"
import Image from "next/image"
import { useSearchParams, useRouter } from "next/navigation"
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Minus, Plus, Trash2, ShoppingBag, Loader2 } from "lucide-react"
import { useCart } from "@/components/cart-context"
import { PaymentMethodDialog } from "@/components/payment-method-dialog"
import { useToast } from "@/hooks/use-toast"
import { envData } from "@/environment"

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
  accountId: string
}

export function CartDrawer({ isOpen, onClose, accountId }: CartDrawerProps) {
  const router = useRouter()
  const { items, removeItem, updateQuantity, totalItems, totalPrice, clearCart } = useCart()
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const searchParams = useSearchParams()
  const partnerId = searchParams?.get("partner")
  const { toast } = useToast()

  const handleCheckout = () => {
    if (!accountId) {
      toast({
        title: "Account required",
        description: "Please select an account before proceeding to checkout.",
        variant: "destructive"
      })
      return
    }

    if (items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before checking out.",
        variant: "destructive"
      })
      return
    }
    
    setIsPaymentDialogOpen(true)
  }

  const handleSelectPaymentMethod = async (method: "card" | "bank") => {
    if (!partnerId || !accountId) {
      toast({
        title: "Missing information",
        description: "Please ensure both partner and account are selected.",
        variant: "destructive"
      })
      return
    }
    
    setIsProcessing(true)
    
    try {
      // Step 1: Create payment method intent
      const paymentMethodResponse = await fetch('/api/payment_method_intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          partner_id: partnerId,
          account_id: accountId,
          payment_method_types: [method]
        }),
      })
      
      if (!paymentMethodResponse.ok) {
        throw new Error('Failed to create payment method intent')
      }
      
      const paymentMethodData = await paymentMethodResponse.json()
      console.log('Payment method intent API response:', paymentMethodData)

      // Close dialogs
      setIsPaymentDialogOpen(false)
      onClose()
      
      // Redirect to checkout page with payment method intent data
      router.push(`/checkout?partner=${partnerId}&account=${accountId}&secret=${paymentMethodData.client_secret}`)
      
    } catch (error) {
      console.error('Error processing payment:', error)
      toast({
        title: "Payment failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent className="w-full sm:max-w-md flex flex-col">
          <SheetHeader>
            <SheetTitle className="text-[#008273] flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Your Cart ({totalItems} {totalItems === 1 ? 'item' : 'items'})
            </SheetTitle>
          </SheetHeader>
          
          <div className="flex-1 overflow-y-auto py-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Your cart is empty</p>
                <SheetClose asChild>
                  <Button className="mt-4 bg-[#008273] hover:bg-[#006B5F]">
                    Continue Shopping
                  </Button>
                </SheetClose>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 pb-4 border-b">
                    <div className="h-16 w-16 relative rounded overflow-hidden flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{item.name}</h4>
                      <p className="text-[#008273] font-bold">${item.price.toFixed(2)}</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      
                      <span className="w-8 text-center">{item.quantity}</span>
                      
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {items.length > 0 && (
            <SheetFooter className="flex-col gap-4 sm:flex-col">
              <div className="flex justify-between items-center py-2 border-t border-b">
                <span className="font-medium">Total:</span>
                <span className="font-bold text-lg text-[#008273]">
                  ${totalPrice.toFixed(2)}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  onClick={() => clearCart()}
                >
                  Clear Cart
                </Button>
                
                <Button
                  className="bg-[#008273] hover:bg-[#006B5F]"
                  onClick={handleCheckout}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Checkout"
                  )}
                </Button>
              </div>
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>
      
      <PaymentMethodDialog
        isOpen={isPaymentDialogOpen}
        onClose={() => setIsPaymentDialogOpen(false)}
        onSelectPaymentMethod={handleSelectPaymentMethod}
        isLoading={isProcessing}
        partnerId={partnerId ?? undefined}
        accountId={accountId}
      />
    </>
  )
}