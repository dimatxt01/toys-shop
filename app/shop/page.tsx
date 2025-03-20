"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ShoppingBag, ShoppingCart } from "lucide-react"
import { CartProvider, useCart } from "@/components/cart-context"
import { CartDrawer } from "@/components/cart-drawer"
import { envData } from "@/environment"
import gunToyImag from "@/public/1.jpg" // Importing the image for the first product
import blaster from "@/public/2.jpg" // Importing the image for the second product
import bubble from "@/public/3.jpg"
import fun from "@/public/4.jpeg" // Importing the image for the third product

interface Product {
  id: string
  name: string
  price: number
  image: any
  description: string
  impact: string
}

function ShopPageContent() {
  const searchParams = useSearchParams()
  const partnerId = searchParams?.get("partner")
  const [products, setProducts] = useState<Product[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState("")
  const { addItem, totalItems } = useCart()
  
  // Helper function to get active partner name
  const getActivePartner = (partnerId: string | null) => {
    if (!partnerId) return null
    return Object.entries(envData.data).find(([_, data]) => data.id === partnerId)?.[0] || null
  }
  
  const activeParter = getActivePartner(partnerId ?? "")

  useEffect(() => {
    // Reset selected account when partner changes
    setSelectedAccount("")
    
    setProducts([
      {
        id: "toy_gun_1",
        name: "Classic Water Pistol",
        price: 1.99,
        image: gunToyImag,
        description: "A classic water pistol perfect for summer fun. Features bright colors and easy-to-fill design.",
        impact: "Safe outdoor play for kids"
      },
      {
        id: "toy_gun_2",
        name: "Foam Dart Blaster",
        price: 11.99,
        image: blaster,
        description: "High-capacity foam dart blaster with rapid-fire action and comfortable grip.",
        impact: "Active play and coordination"
      },
      {
        id: "toy_gun_3",
        name: "Mini Bubble Shooter",
        price: 3.99,
        image: bubble,
        description: "Compact bubble gun that creates streams of bubbles with each pull of the trigger.",
        impact: "Creative bubble play"
      },
      {
        id: "toy_gun_4",
        name: "Light-Up Space Blaster",
        price: 8.99,
        image: "https://images.unsplash.com/photo-1563396983906-b3795482a59a?w=500&h=500&fit=crop",
        description: "Futuristic space blaster with LED lights and sound effects.",
        impact: "Imaginative space play"
      },
      {
        id: "toy_gun_5",
        name: "Rubber Band Shooter",
        price: 4.99,
        image: fun,
        description: "Classic wooden rubber band gun with multiple band capacity.",
        impact: "Traditional toy fun"
      },
    ])
  }, [partnerId])

  const handleAddToCart = (product: Product) => {
    if (!selectedAccount) {
      alert("Please select an account before adding items to cart")
      return
    }
    
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image
    })
  }

  if (!partnerId) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Partner ID Required</h1>
            <p className="mb-6">Please select a partner from the home page to access our toy store.</p>
            <Button asChild>
              <a href="/">Return to Home</a>
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
            <div className="flex flex-col items-center gap-4 text-center mb-12">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-[#008273]">
                Dima's Forward Shop
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl">
                Safe and fun toys for play
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
                <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                  <SelectTrigger className="w-[240px]">
                    <SelectValue placeholder="Choose an account..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(envData.data).map(([partnerName, partnerData]) => (
                      <SelectGroup key={partnerName}>
                        <SelectLabel>{partnerName}</SelectLabel>
                        {partnerName === activeParter && partnerData.accounts.map((account) => (
                          <SelectItem 
                            key={account.id} 
                            value={account.id}
                            disabled={partnerName !== activeParter}
                          >
                            { account.id}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button 
                  onClick={() => setIsCartOpen(true)}
                  className="bg-[#008273] hover:bg-[#006B5F]"
                >
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  View Cart
                  {totalItems > 0 && (
                    <span className="ml-2 bg-white text-[#008273] rounded-full h-6 w-6 flex items-center justify-center text-sm font-bold">
                      {totalItems}
                    </span>
                  )}
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <Card key={product.id} className="overflow-hidden border-2">
                  <div className="aspect-square relative">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle>{product.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{product.description}</p>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {product.impact}
                      </span>
                      <p className="text-2xl font-bold text-[#008273]">${product.price.toFixed(2)}</p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full bg-[#008273] hover:bg-[#006B5F]"
                      onClick={() => handleAddToCart(product)}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Add to Cart
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
      
      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        accountId={selectedAccount}
      />
    </div>
  )
}

export default function ShopPage() {
  return (
    <CartProvider>
      <Suspense fallback={<div>Loading...</div>}>
      <ShopPageContent />
      </Suspense>
    </CartProvider>
  )
}