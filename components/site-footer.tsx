import Link from "next/link"
import Image from "next/image"
import { Github, Twitter, Linkedin, Instagram } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="bg-[#0A2540] text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-2">
              <Image 
                src="/forward-logo-white.svg" 
                alt="Forward Logo" 
                width={40} 
                height={40}
              />
              <span className="font-bold text-xl">Dima's Forward Shop</span>
            </Link>
          </div>

        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-300">
            &copy; {new Date().getFullYear()} Dima's Forward Shop. All rights reserved.
          </p>
          
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <Link href="#" target="_blank" rel="noreferrer" className="text-gray-300 hover:text-white transition-colors">
              <Instagram className="h-5 w-5" />
              <span className="sr-only">Instagram</span>
            </Link>
            <Link href="#" target="_blank" rel="noreferrer" className="text-gray-300 hover:text-white transition-colors">
              <Twitter className="h-5 w-5" />
              <span className="sr-only">Twitter</span>
            </Link>
            <Link href="#" target="_blank" rel="noreferrer" className="text-gray-300 hover:text-white transition-colors">
              <Linkedin className="h-5 w-5" />
              <span className="sr-only">LinkedIn</span>
            </Link>
            <Link href="#" target="_blank" rel="noreferrer" className="text-gray-300 hover:text-white transition-colors">
              <Github className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}