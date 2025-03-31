"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Loader2, 
  CreditCard, 
  Trash2, 
  Building2, 
  CheckCircle, 
  XCircle, 
  ChevronLeft, 
  ChevronRight,
  Building,
  Users
} from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { PaymentElementV2 } from "@/components/payment-element-v2"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { envData } from "@/environment"

interface StoredPaymentMethod {
  id: string
  status: string
  account_id: string
  created_at: string
  payment_method: {
    payment_method_type: "card" | "bank"
    card?: {
      last_four_digits: string
      brand: string
      exp_month: string
      exp_year: string
    },
    bank?: {
      masked_account: string,
      masked_routing: string,
      name: string,
      owner_type: string,
      account_id: string,
      subtype: string
    }
  }
  validate: boolean
  bill_to: "merchant" | "partner"
  latest_validation_response: {
    status: string
    message: string
    auth_code?: string
  }
}

type BillTo = "merchant" | "partner"

const partnerApiKeys: Record<string, string> = JSON.parse(
  process.env.NEXT_PUBLIC_PARTNER_API_KEYS || "{}"
)

function PaymentMethodsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [partner, setPartner] = useState<string>("")
  const [selectedAccount, setSelectedAccount] = useState<string>("")
  const { toast } = useToast()

  const [storedMethods, setStoredMethods] = useState<StoredPaymentMethod[]>([])
  const [loading, setLoading] = useState(false)
  const [validate, setValidate] = useState(true)
  const [billTo, setBillTo] = useState<BillTo>("merchant")
  const [showMethodDialog, setShowMethodDialog] = useState(false)
  const [selectedMethodType, setSelectedMethodType] = useState<"card" | "bank" | null>(null)
  const [paymentMethodIntent, setPaymentMethodIntent] = useState<any>(null)
  
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 3

  const totalPages = Math.ceil(storedMethods.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentMethods = storedMethods.slice(startIndex, endIndex)

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1))
  }

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
  }

  useEffect(() => {
    const methods = JSON.parse(localStorage.getItem('payment_tokens') || '[]')
    setStoredMethods(methods)
  }, [])

  const handlePartnerChange = (selectedPartner: string) => {
    setPartner(selectedPartner)
    setSelectedAccount("")
    const partnerData = envData.data[selectedPartner]
    if (partnerData) {
      router.push(`/payment-methods?partner=${partnerData.id}`)
    }
  }

  const handleAccountChange = (accountId: string) => {
    setSelectedAccount(accountId)
    const partnerData = envData.data[partner]
    if (partnerData) {
      router.push(`/payment-methods?partner=${partnerData.id}&account=${accountId}`)
    }
  }

  const handleMethodTypeSelect = async (type: "card" | "bank") => {
    setSelectedMethodType(type)
    setShowMethodDialog(false)
    
    setLoading(true)
    try {
      const response = await fetch('/api/payment_method_intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          partner_id: envData.data[partner].id,
          account_id: selectedAccount,
          payment_method_types: [type],
          validate: validate,
          bill_to: billTo
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create payment method intent')
      }

      const data = await response.json()
      console.log('Payment method intent created:', data)
      setPaymentMethodIntent(data)
    } catch (error) {
      console.error('Error creating payment method intent:', error)
      toast({
        title: "Error",
        description: "Failed to initialize payment method form. Please try again.",
        variant: "destructive"
      })
      setSelectedMethodType(null)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteMethod = (id: string) => {
    const updatedMethods = storedMethods.filter(m => m.id !== id)
    localStorage.setItem('payment_tokens', JSON.stringify(updatedMethods))
    setStoredMethods(updatedMethods)
    toast({
      title: "Success",
      description: "Payment method deleted successfully",
      variant: "success"
    })
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-[#F7FAFF]">
          <div className="container px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col gap-6 mb-8">
                <div className="flex flex-col gap-2">
                  <h1 className="text-3xl font-bold tracking-tighter text-[#008273]">
                    Payment Methods
                  </h1>
                  <p className="text-muted-foreground">
                    Manage your stored payment methods and add new ones
                  </p>
                </div>

                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-[#008273]">
                      <Users className="h-5 w-5" />
                      Account Selection
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="partner" className="text-sm font-medium">
                          Partner
                        </Label>
                        <Select value={partner} onValueChange={handlePartnerChange}>
                          <SelectTrigger 
                            id="partner"
                            className="w-full border-2 h-12"
                          >
                            <div className="flex items-center gap-2">
                              <Building className="h-4 w-4 text-[#008273]" />
                              <SelectValue placeholder="Choose a partner..." />
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            {Object.keys(envData.data).map((partnerName) => (
                              <SelectItem 
                                key={partnerName} 
                                value={partnerName}
                                className="cursor-pointer"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="h-4 w-4" />
                                  {partnerName}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {!partner && (
                          <p className="text-sm text-muted-foreground">
                            Select a partner to view available accounts
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="account" className="text-sm font-medium">
                          Account
                        </Label>
                        <Select 
                          value={selectedAccount} 
                          onValueChange={handleAccountChange}
                          disabled={!partner}
                        >
                          <SelectTrigger 
                            id="account"
                            className="w-full border-2 h-12"
                          >
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-[#008273]" />
                              <SelectValue placeholder="Choose an account..." />
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(envData.data).map(([partnerName, partnerData]) => (
                              <SelectGroup key={partnerName}>
                                <SelectLabel className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                                  {partnerName}
                                </SelectLabel>
                                {partnerName === partner && partnerData.accounts.map((account) => (
                                  <SelectItem 
                                    key={account.id} 
                                    value={account.id}
                                    disabled={partnerName !== partner}
                                    className="cursor-pointer"
                                  >
                                    <div className="flex items-center gap-2">
                                      <div className="h-4 w-4" />
                                      {account.id}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            ))}
                          </SelectContent>
                        </Select>
                        {partner && !selectedAccount && (
                          <p className="text-sm text-muted-foreground">
                            Select an account to manage payment methods
                          </p>
                        )}
                      </div>
                    </div>

                    {partner && selectedAccount && (
                      <div className="mt-6 pt-6 border-t">
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center gap-2">
                            <Switch
                              id="validate"
                              checked={validate}
                              onCheckedChange={setValidate}
                            />
                            <Label htmlFor="validate">Validate payment method</Label>
                          </div>

                          {(
                            <div className="flex items-center gap-2">
                              <Switch
                                id="bill-to"
                                checked={billTo === "partner"}
                                onCheckedChange={(checked) => setBillTo(checked ? "partner" : "merchant")}
                              />
                              <Label htmlFor="bill-to">Partner pays validation fee</Label>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="mb-8">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Stored Payment Methods</CardTitle>
                      {storedMethods.length > 0 && (
                        <p className="text-sm text-muted-foreground">
                          Showing {startIndex + 1}-{Math.min(endIndex, storedMethods.length)} of {storedMethods.length}
                        </p>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {storedMethods.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">
                        No payment methods stored yet
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {currentMethods.map((method) => (
                          <div
                            key={method.id}
                            className="flex flex-col p-4 border rounded-lg space-y-3"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                {method.payment_method.payment_method_type === "card" ? (
                                  <CreditCard className="h-5 w-5 text-[#008273]" />
                                ) : (
                                  <Building2 className="h-5 w-5 text-[#008273]" />
                                )}
                                <div>
                                  <p className="font-medium">
                                    {method.payment_method.payment_method_type === "card" ? (
                                      <>
                                        {method.payment_method.card?.brand.toUpperCase()} •••• {method.payment_method.card?.last_four_digits}
                                        <span className="text-sm text-muted-foreground ml-2">
                                          (Expires {method.payment_method.card?.exp_month}/{method.payment_method.card?.exp_year})
                                        </span>
                                      </>
                                    ) : (
                                      `Bank Account ${method.payment_method?.bank?.masked_account}`
                                    )}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    Added {new Date(method.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                onClick={() => handleDeleteMethod(method.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">Validation Status</p>
                                <div className="flex items-center gap-1 mt-1">
                                  {method.latest_validation_response?.status === "succeeded" ? (
                                    <>
                                      <CheckCircle className="h-4 w-4 text-green-500" />
                                      <span className="text-green-600">Validated</span>
                                    </>
                                  ) : method.latest_validation_response?.status === "failed" ? (
                                    <>
                                      <XCircle className="h-4 w-4 text-red-500" />
                                      <span className="text-red-600">Failed</span>
                                    </>
                                  ) : (
                                    <>
                                      <XCircle className="h-4 w-4 text-gray-500" />
                                      <span className="text-gray-600">Skipped</span>
                                    </>
                                  )}
                                </div>
                                {method.latest_validation_response?.auth_code && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Auth Code: {method.latest_validation_response.auth_code}
                                  </p>
                                )}
                              </div>
                              <div>
                                <p className="text-muted-foreground">Validation Fee</p>
                                <p className="mt-1">Billed to {method.bill_to}</p>
                              </div>
                            </div>

                            {method.latest_validation_response?.message && (
                              <div className="text-sm">
                                <p className="text-muted-foreground">Message</p>
                                <p className="mt-1">{method.latest_validation_response.message}</p>
                              </div>
                            )}
                          </div>
                        ))}

                        {storedMethods.length > itemsPerPage && (
                          <div className="flex justify-center items-center gap-4 mt-6 pt-4 border-t">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={handlePreviousPage}
                              disabled={currentPage === 1}
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="text-sm text-muted-foreground">
                              Page {currentPage} of {totalPages}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={handleNextPage}
                              disabled={currentPage === totalPages}
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  {selectedMethodType && paymentMethodIntent ? (
                    <PaymentElementV2
                      apiKey={partnerApiKeys[envData.data[partner].id]}
                      clientSecret={paymentMethodIntent.client_secret}
                      paymentMethodIntentId={paymentMethodIntent.id}
                    />
                  ) : (
                    <Card className="p-6">
                      <Button
                        className="w-full bg-[#008273] hover:bg-[#006B5F]"
                        onClick={() => setShowMethodDialog(true)}
                        disabled={loading || !partner || !selectedAccount}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Initializing...
                          </>
                        ) : (
                          <>
                            <CreditCard className="mr-2 h-4 w-4" />
                            Store New Payment Method
                          </>
                        )}
                      </Button>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />

      <Dialog open={showMethodDialog} onOpenChange={setShowMethodDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold text-[#008273]">
              Choose Payment Method Type
            </DialogTitle>
            <DialogDescription className="text-center">
              Select the type of payment method you want to store
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <Button
              variant="outline"
              className="flex flex-col h-32 items-center justify-center gap-2 border-2 hover:border-[#008273] hover:bg-[#F7FAFF]"
              onClick={() => handleMethodTypeSelect("card")}
              disabled={loading}
            >
              <CreditCard className="h-8 w-8 text-[#008273]" />
              <span className="font-medium">Credit Card</span>
            </Button>
            
            <Button
              variant="outline"
              className="flex flex-col h-32 items-center justify-center gap-2 border-2 hover:border-[#008273] hover:bg-[#F7FAFF]"
              onClick={() => handleMethodTypeSelect("bank")}
              disabled={loading}
            >
              <Building2 className="h-8 w-8 text-[#008273]" />
              <span className="font-medium">Bank Account</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function PaymentMethodsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentMethodsContent />
    </Suspense>
  )
}