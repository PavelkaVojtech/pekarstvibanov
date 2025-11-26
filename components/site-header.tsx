"use client"

import * as React from "react"
import Link from "next/link"
import { Menu, ShoppingCart } from "lucide-react"
import { FaBreadSlice } from "react-icons/fa"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"

export function SiteHeader() {
  const links = [
    { name: 'PRODUKTY', href: '/produkty' },
    { name: 'O NÁS', href: '/onas' },
    { name: 'KONTAKT', href: '/kontakt' },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-gray-950/90 backdrop-blur supports-[backdrop-filter]:bg-gray-950/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 mx-auto">
        
        {/* 1. MOBILNÍ MENU */}
        <div className="flex items-center md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2 text-white hover:bg-gray-800 hover:text-amber-400">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] bg-gray-900 border-gray-800 text-white">
              <SheetTitle className="text-left flex items-center gap-2 mb-6 text-amber-400">
                 <FaBreadSlice /> PEKAŘSTVÍ
              </SheetTitle>
              <nav className="flex flex-col gap-4">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block px-2 py-2 text-lg font-medium text-gray-300 hover:text-amber-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
                
                {/* PŘIDÁNO: Odkaz na přihlášení pro mobilní verzi */}
                <div className="border-t border-gray-800 mt-4 pt-4">
                  <Link
                    href="/prihlaseni"
                    className="block px-2 py-2 text-lg font-bold text-amber-500 hover:text-amber-400 transition-colors"
                  >
                    Přihlášení
                  </Link>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        {/* 2. LOGO A DESKTOP NAVIGACE */}
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2 group">
            <FaBreadSlice className="h-6 w-6 text-amber-500 group-hover:text-amber-400 transition-colors" />
            <span className="hidden font-bold sm:inline-block text-xl tracking-wider font-serif text-white group-hover:text-gray-200 transition-colors">
              PEKAŘSTVÍ BÁNOV
            </span>
          </Link>
          
          <nav className="hidden gap-6 md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center text-sm font-medium text-gray-300 transition-colors hover:text-amber-400"
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* 3. PRAVÁ STRANA */}
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            
            <Button variant="ghost" size="icon" className="relative text-gray-300 hover:text-amber-400 hover:bg-gray-800" aria-label="Košík">
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
            </Button>

            <Button asChild variant="default" size="sm" className="hidden sm:flex bg-amber-500 text-black hover:bg-amber-600 font-bold">
                <Link href="/prihlaseni">
                    Přihlášení
                </Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  )
}