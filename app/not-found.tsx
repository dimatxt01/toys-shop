import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Home } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center">
        <div className="container flex flex-col items-center justify-center gap-6 text-center py-12 md:py-24 lg:py-32">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">404</h1>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Page Not Found</h2>
            <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl">
              Sorry, the page you are looking for doesn't exist or has been moved.
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}