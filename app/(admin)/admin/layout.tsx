import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { AdminSidebar } from "@/components/admin/sidebar";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    redirect("/prihlaseni");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen bg-muted/20">
      <AdminSidebar className="fixed left-0 top-0 hidden md:block" />

      <div className="md:ml-64 flex-1 flex flex-col min-h-screen">
        <header className="flex h-16 items-center gap-4 border-b bg-background px-6 md:px-10 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="-ml-2">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <SheetTitle className="sr-only">Navigace</SheetTitle>
              <AdminSidebar />
            </SheetContent>
          </Sheet>
          <span className="font-bold">Administrace</span>
        </header>
        
        <main className="flex-1 flex flex-col">
          <div className="w-full max-w-(--breakpoint-2xl) mx-auto p-4 md:p-8 lg:p-12 space-y-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}