"use client"

import * as React from "react"
import Link from "next/link"
import { Menu, ShoppingCart, User, LogOut } from "lucide-react"
import { FaBreadSlice } from "react-icons/fa"
import { authClient } from "@/lib/auth-client"
import { useCart } from "@/components/providers/cart-provider"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { ModeToggle } from "@/components/mode-toggle"

export function SiteHeader() {
  const links = [
    { name: 'PRODUKTY', href: '/produkty' },
    { name: 'O NÁS', href: '/onas' },
    { name: 'KONTAKT', href: '/kontakt' },
  ]

  const { data: session, isPending } = authClient.useSession()
  const [isMounted, setIsMounted] = React.useState(false)

  React.useEffect(() => {
    setIsMounted(true)
  }, [])
  
  const { itemCount } = useCart()
  const sessionData = isMounted ? session : null
  const showAuthUi = isMounted && !isPending
  
  const profileHref =
    sessionData?.user?.role === "ADMIN"
      ? "/admin/profil"
      : sessionData?.user?.role === "EMPLOYEE"
      ? "/zamestnanec/profil"
      : "/profil"

  const handleLogout = async () => {
    try {
      await authClient.signOut()
    } finally {
      window.location.assign("/")
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-colors duration-300">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8 mx-auto">
        
        <div className="flex items-center md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2 h-10 w-10 text-foreground">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] p-6">
              <SheetTitle className="text-left flex items-center gap-2 mb-8 text-primary font-serif text-xl">
                 <FaBreadSlice className="h-6 w-6" /> PEKAŘSTVÍ
              </SheetTitle>
              <nav className="flex flex-col gap-6">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block text-xl font-bold text-foreground/80 hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
                
                <div className="border-t border-border mt-4 pt-6 space-y-6">
                  <Link href="/pokladna" className="flex items-center justify-between text-xl font-bold text-foreground/80">
                      <span>Košík</span>
                      {itemCount > 0 && (
                          <span className="bg-primary text-primary-foreground text-xs font-black rounded-full h-7 w-7 flex items-center justify-center">
                              {itemCount}
                          </span>
                      )}
                  </Link>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Vzhled</span>
                    <ModeToggle />
                  </div>
                  
                  {showAuthUi && sessionData ? (
                    <div className="space-y-4 pt-2">
                        <Link href={profileHref} className="flex items-center gap-3 text-primary font-black text-lg">
                            <User className="h-6 w-6" />
                            <span>{sessionData.user.name}</span>
                        </Link>
                        <Button variant="destructive" onClick={handleLogout} className="w-full h-12 justify-center font-bold">
                            <LogOut className="mr-2 h-5 w-5" /> Odhlásit se
                        </Button>
                    </div>
                  ) : (
                    <Button asChild className="w-full h-12 font-bold text-lg">
                      <Link href="/prihlaseni">Přihlášení</Link>
                    </Button>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center space-x-2 group shrink-0">
            <FaBreadSlice className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
            <span className="font-black text-lg sm:text-xl tracking-tighter font-serif text-foreground">
              PEKAŘSTVÍ BÁNOV
            </span>
          </Link>
          <nav className="hidden md:flex gap-8">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="text-sm font-black text-foreground/70 hover:text-primary transition-colors uppercase tracking-widest">
                {link.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center justify-end gap-2 sm:gap-4">
          <div className="hidden sm:block"><ModeToggle /></div>

          <Button asChild variant="ghost" size="icon" className="relative h-10 w-10 text-foreground hover:text-primary" aria-label="Košík">
            <Link href="/pokladna">
              <ShoppingCart className="h-6 w-6" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-black text-primary-foreground shadow-sm">
                  {itemCount}
                </span>
              )}
            </Link>
          </Button>

          {showAuthUi && (
            sessionData ? (
                <div className="hidden md:flex items-center gap-3 pl-2 border-l border-border ml-2">
                    <Button asChild variant="ghost" className="font-black px-2 hover:text-primary">
                        <Link href={profileHref} className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            <span className="truncate max-w-[120px]">{sessionData.user.name}</span>
                        </Link>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handleLogout} className="text-muted-foreground hover:text-destructive transition-colors">
                        <LogOut className="h-5 w-5" />
                    </Button>
                </div>
            ) : (
                <Button asChild variant="default" size="sm" className="hidden md:flex font-black shadow-md">
                    <Link href="/prihlaseni">PŘIHLÁŠENÍ</Link>
                </Button>
            )
          )}
        </div>
      </div>
    </header>
  )
}