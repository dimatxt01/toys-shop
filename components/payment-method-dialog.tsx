"use client"

import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CreditCard, Building2 } from "lucide-react"

interface PaymentMethodDialogProps {
  isOpen: boolean
  onClose: () => void
  onSelectPaymentMethod: (method: "card" | "bank") => Promise<void>
  isLoading: boolean
}

export function PaymentMethodDialog({
  isOpen,
  onClose,
  onSelectPaymentMethod,
  isLoading
}: PaymentMethodDialogProps) {
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
        {isLoading && (
          <div className="text-center text-sm text-muted-foreground">
            Processing your payment method...
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}