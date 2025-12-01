"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Menu, ShoppingCart, User, LogOut } from "lucide-react"
import { FaBreadSlice } from "react-icons/fa"
import { authClient } from "@/lib/auth-client"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { ModeToggle } from "@/components/mode-toggle"

export function SiteHeader() {
  const links = [
    { name: 'PRODUKTY', href: '/produkty' },
    { name: 'O NÁS', href: '/onas' },
    { name: 'KONTAKT', href: '/kontakt' },
  ]

  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/")
          router.refresh()
        },
      },
    })
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 transition-colors duration-300">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 mx-auto">
        
        {/* 1. MOBILNÍ MENU */}
        <div className="flex items-center md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2 text-foreground hover:bg-accent hover:text-primary">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] bg-background border-border text-foreground">
              <SheetTitle className="text-left flex items-center gap-2 mb-6 text-primary">
                 <FaBreadSlice /> PEKAŘSTVÍ
              </SheetTitle>
              <nav className="flex flex-col gap-4">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block px-2 py-2 text-lg font-medium text-foreground/80 hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
                
                <div className="border-t border-border mt-4 pt-4 flex flex-col gap-4">
                  <div className="flex items-center justify-between px-2">
                    <span className="text-sm font-medium">Vzhled aplikace</span>
                    <ModeToggle />
                  </div>
                  
                  {/* --- UŽIVATEL NA MOBILU --- */}
                  {session ? (
                    <div className="px-2 space-y-3">
                        {/* ZMĚNA: Jméno je nyní odkaz na profil */}
                        <Link href="/profil" className="flex items-center gap-2 text-primary font-bold hover:underline">
                            <User className="h-5 w-5" />
                            <span>{session.user.name}</span>
                        </Link>
                        <Button 
                            variant="destructive" 
                            onClick={handleLogout}
                            className="w-full justify-start"
                        >
                            <LogOut className="mr-2 h-4 w-4" /> Odhlásit se
                        </Button>
                    </div>
                  ) : (
                    <Link
                        href="/prihlaseni"
                        className="block px-2 py-2 text-lg font-bold text-primary hover:text-primary/80 transition-colors"
                    >
                        Přihlášení
                    </Link>
                  )}

                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        {/* 2. LOGO A DESKTOP NAVIGACE */}
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2 group">
            <FaBreadSlice className="h-6 w-6 text-primary group-hover:text-primary/80 transition-colors" />
            <span className="hidden font-bold sm:inline-block text-xl tracking-wider font-serif text-foreground group-hover:text-foreground/80 transition-colors">
              PEKAŘSTVÍ BÁNOV
            </span>
          </Link>
          
          <nav className="hidden gap-6 md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* 3. PRAVÁ STRANA */}
        <div className="flex flex-1 items-center justify-end space-x-2">
          <nav className="flex items-center space-x-1 md:space-x-2">
            
            <div className="hidden md:block">
               <ModeToggle />
            </div>

            <Button variant="ghost" size="icon" className="relative text-foreground hover:text-primary hover:bg-accent" aria-label="Košík">
              <ShoppingCart className="h-5 w-5" />
              {/* Zde později přidáme číslo počtu položek v košíku */}
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
            </Button>

            {/* --- UŽIVATEL NA DESKTOPU --- */}
            {!isPending && (
                session ? (
                    <div className="hidden sm:flex items-center gap-2 pl-2">
                        {/* ZMĚNA: Jméno je odkaz na profil */}
                        <Button asChild variant="ghost" className="text-foreground hover:text-primary font-bold px-2">
                            <Link href="/profil" className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                <span className="truncate max-w-[150px]">{session.user.name}</span>
                            </Link>
                        </Button>

                        <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={handleLogout}
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            title="Odhlásit se"
                        >
                            <LogOut className="h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    <Button asChild variant="default" size="sm" className="hidden sm:flex bg-primary text-primary-foreground hover:bg-primary/90 font-bold">
                        <Link href="/prihlaseni">
                            Přihlášení
                        </Link>
                    </Button>
                )
            )}
            
          </nav>
        </div>
      </div>
    </header>
  )
}