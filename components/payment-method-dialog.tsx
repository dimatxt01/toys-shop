"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CreditCard, Building2, CreditCardIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

interface StoredPaymentMethod {
  id: string
  payment_method: {
    payment_method_type: "card" | "bank"
    card?: {
      last_four_digits: string
      brand: string
      exp_month: string
      exp_year: string
    }
    bank?: {
      masked_account: string
    }
  }
}

interface PaymentMethodDialogProps {
  isOpen: boolean
  onClose: () => void
  onSelectPaymentMethod: (method: "card" | "bank") => Promise<void>
  isLoading: boolean
  partnerId?: string
  accountId?: string
}

export function PaymentMethodDialog({
  isOpen,
  onClose,
  onSelectPaymentMethod,
  isLoading,
  partnerId,
  accountId
}: PaymentMethodDialogProps) {
  const router = useRouter()
  const [selectedStoredMethod, setSelectedStoredMethod] = useState<string>("")
  const storedMethods = JSON.parse(localStorage.getItem('payment_tokens') || '[]') as StoredPaymentMethod[]

  const handleStoredMethodSelect = () => {
    if (selectedStoredMethod && partnerId && accountId) {
      // Close the dialog
      onClose()
      
      // Redirect to checkout with the selected payment method
      router.push(`/checkout?partner=${partnerId}&account=${accountId}&payment_method_id=${selectedStoredMethod}&use_stored_method=true`)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-[#008273]">
            Choose Payment Method
          </DialogTitle>
          <DialogDescription className="text-center">
            Select how you would like to pay for your order
          </DialogDescription>
        </DialogHeader>

        {storedMethods.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-3">Saved Payment Methods</h3>
            <Card>
              <CardContent className="pt-6">
                <RadioGroup value={selectedStoredMethod} onValueChange={setSelectedStoredMethod}>
                  {storedMethods.map((method) => (
                    <div key={method.id} className="flex items-center space-x-3 mb-3">
                      <RadioGroupItem value={method.id} id={method.id} />
                      <Label htmlFor={method.id} className="flex items-center gap-2">
                        {method.payment_method.payment_method_type === "card" ? (
                          <>
                            <CreditCardIcon className="h-4 w-4" />
                            {method.payment_method.card?.brand.toUpperCase()} •••• {method.payment_method.card?.last_four_digits}
                          </>
                        ) : (
                          <>
                            <Building2 className="h-4 w-4" />
                            Bank Account •••• {method.payment_method.bank?.masked_account}
                          </>
                        )}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                <Button
                  className="w-full mt-4 bg-[#008273] hover:bg-[#006B5F]"
                  onClick={handleStoredMethodSelect}
                  disabled={!selectedStoredMethod}
                >
                  Pay with Selected Method
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="relative">
          {storedMethods.length > 0 && (
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
          )}
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or pay with new method
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 py-4">
          <Button
            variant="outline"
            className="flex flex-col h-32 items-center justify-center gap-2 border-2 hover:border-[#008273] hover:bg-[#F7FAFF]"
            onClick={() => onSelectPaymentMethod("card")}
            disabled={isLoading}
          >
            <CreditCard className="h-8 w-8 text-[#008273]" />
            <span className="font-medium">Credit Card</span>
          </Button>
          
          <Button
            variant="outline"
            className="flex flex-col h-32 items-center justify-center gap-2 border-2 hover:border-[#008273] hover:bg-[#F7FAFF]"
            onClick={() => onSelectPaymentMethod("bank")}
            disabled={isLoading}
          >
            <Building2 className="h-8 w-8 text-[#008273]" />
            <span className="font-medium">Bank Transfer</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}