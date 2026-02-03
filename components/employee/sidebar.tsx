"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ShoppingBag, PackagePlus, Store, User, LogOut } from "lucide-react"
import { authClient } from "@/lib/auth-client"

const sidebarItems = [
  {
    title: "Objednávky",
    href: "/zamestnanec/objednavky",
    icon: ShoppingBag,
  },
  {
    title: "Produkty",
    href: "/zamestnanec/produkty",
    icon: PackagePlus,
  },
]

export function EmployeeSidebar() {
  const pathname = usePathname()

  const handleLogout = async () => {
    try {
      await authClient.signOut()
    } finally {
      window.location.assign("/")
    }
  }

  return (
    <div className="pb-12 min-h-screen w-64 bg-card border-r border-border fixed left-0 top-0 hidden md:block">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight text-primary font-serif">
            Zaměstnanec
          </h2>
          <div className="space-y-1">
            {sidebarItems.map((item) => (
              <Button
                key={item.href}
                variant={pathname === item.href ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  pathname === item.href && "bg-muted font-bold text-primary"
                )}
                asChild
              >
                <Link href={item.href}>
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Link>
              </Button>
            ))}
          </div>
        </div>
        
        <div className="px-3 py-2 border-t border-border mt-auto">
            <div className="space-y-1 mt-4">
                <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground" asChild>
                  <Link href="/zamestnanec/profil">
                    <User className="mr-2 h-4 w-4" /> Můj profil
                  </Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground" asChild>
                    <Link href="/">
                        <Store className="mr-2 h-4 w-4" /> Zpět na web
                    </Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" /> Odhlásit se
                </Button>
            </div>
        </div>
      </div>
    </div>
  )
}
