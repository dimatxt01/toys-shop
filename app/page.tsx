"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ArrowRight, Globe, Heart, Leaf } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { envData } from "@/environment"

export default function Home() {
  const router = useRouter();
  const [partner, setPartner] = useState<string>("");
  const [partnerId, setPartnerId] = useState<string>("");
  
  const handlePartnerChange = (selectedPartner: string) => {
    setPartner(selectedPartner);

    // Find the partner by name and set the partnerId
    const foundPartner = envData.data[selectedPartner];
    if (foundPartner) {
      setPartnerId(foundPartner.id);
    } else {
      setPartnerId("");
    }
  };

  const handleProceedToStore = () => {
    if (partnerId) {
      router.push(`/shop/?partner=${partnerId}`);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-[#F7FAFF] to-white py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
              <div className="mb-8">
                <Image 
                  src="/forward-logo.svg" 
                  alt="Forward Logo" 
                  width={80} 
                  height={80} 
                  priority
                />
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#008273] mb-6">
                Dima's Forward Shop
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-10">
                Select your partner account to support important causes around the world
              </p>
              
              <Card className="w-full max-w-md border-2 shadow-lg bg-white">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-bold text-[#008273]">Welcome to Dima's Shop</CardTitle>
                  <CardDescription className="text-gray-600">
                    Choose your partner account to continue
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Select Partner
                    </label>
                    <Select value={partner} onValueChange={handlePartnerChange}>
                      <SelectTrigger className="w-full border-gray-300 focus:ring-[#008273] focus:border-[#008273]">
                        <SelectValue placeholder="Choose a partner..." />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(envData.data).map((partnerName) => (
                          <SelectItem key={partnerName} value={partnerName}>
                            {partnerName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full text-lg py-6 bg-[#008273] hover:bg-[#006B5F] transition-colors" 
                    size="lg"
                    onClick={handleProceedToStore}
                    disabled={!partnerId}
                  >
                    Browse Initiatives
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-[#008273] mb-4">
                Make a Global Impact
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Discover how your contributions can help create positive change around the world
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-[#F7FAFF] p-8 rounded-lg border border-gray-100">
                <div className="w-12 h-12 bg-[#E1EBFF] rounded-full flex items-center justify-center mb-4">
                  <Globe className="h-6 w-6 text-[#008273]" />
                </div>
                <h3 className="text-xl font-semibold text-[#008273] mb-2">Global Reach</h3>
                <p className="text-gray-600">
                  Our initiatives span across continents, addressing critical issues that affect communities worldwide.
                </p>
              </div>
              
              <div className="bg-[#F7FAFF] p-8 rounded-lg border border-gray-100">
                <div className="w-12 h-12 bg-[#E1EBFF] rounded-full flex items-center justify-center mb-4">
                  <Heart className="h-6 w-6 text-[#008273]" />
                </div>
                <h3 className="text-xl font-semibold text-[#008273] mb-2">Meaningful Impact</h3>
                <p className="text-gray-600">
                  Every contribution directly supports programs that create lasting positive change in communities.
                </p>
              </div>
              
              <div className="bg-[#F7FAFF] p-8 rounded-lg border border-gray-100">
                <div className="w-12 h-12 bg-[#E1EBFF] rounded-full flex items-center justify-center mb-4">
                  <Leaf className="h-6 w-6 text-[#008273]" />
                </div>
                <h3 className="text-xl font-semibold text-[#008273] mb-2">Sustainable Solutions</h3>
                <p className="text-gray-600">
                  We focus on long-term, sustainable approaches to addressing global challenges and creating a better future.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}