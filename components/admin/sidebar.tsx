"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, ShoppingBag, Users, Settings, LogOut, PackagePlus, Store, User } from "lucide-react"
import { authClient } from "@/lib/auth-client"

const sidebarItems = [
  {
    title: "Přehled",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Objednávky",
    href: "/admin/objednavky",
    icon: ShoppingBag,
  },
  {
    title: "Produkty",
    href: "/admin/produkty",
    icon: PackagePlus,
  },
  {
    title: "Zákazníci",
    href: "/admin/zakaznici",
    icon: Users,
  },
  {
    title: "Nastavení webu",
    href: "/admin/nastaveni",
    icon: Settings,
  },
]

export function AdminSidebar({ className }: { className?: string }) {
  const pathname = usePathname()

  const handleLogout = async () => {
    try {
      await authClient.signOut()
    } finally {
      window.location.assign("/")
    }
  }

  return (
    <div className={cn("pb-12 min-h-screen w-64 bg-card border-r border-border shadow-xl md:shadow-none", className)}>
      <div className="flex flex-col h-full py-6">
        <div className="px-6 mb-8">
          <h2 className="text-2xl font-black tracking-tight text-primary font-serif">
            Administrace
          </h2>
        </div>
        
        <div className="flex-1 px-3 space-y-1">
          {sidebarItems.map((item) => (
            <Button
              key={item.href}
              variant={pathname === item.href ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start h-11 px-4",
                pathname === item.href && "bg-muted font-bold text-primary shadow-sm"
              )}
              asChild
            >
              <Link href={item.href}>
                <item.icon className="mr-3 h-5 w-5" />
                {item.title}
              </Link>
            </Button>
          ))}
        </div>
        
        <div className="px-3 pt-6 border-t border-border">
            <div className="space-y-1">
                <Button variant="ghost" className="w-full justify-start h-11 px-4 text-muted-foreground hover:text-foreground" asChild>
                  <Link href="/admin/profil">
                        <User className="mr-3 h-5 w-5" /> Můj profil
                    </Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start h-11 px-4 text-muted-foreground hover:text-foreground" asChild>
                    <Link href="/">
                        <Store className="mr-3 h-5 w-5" /> Zpět na web
                    </Link>
                </Button>
                <div className="pt-4 mt-2">
                  <Button variant="ghost" className="w-full justify-start h-11 px-4 text-destructive hover:bg-destructive/10 hover:text-destructive font-bold" onClick={handleLogout}>
                      <LogOut className="mr-3 h-5 w-5" /> Odhlásit se
                  </Button>
                </div>
            </div>
        </div>
      </div>
    </div>
  )
}