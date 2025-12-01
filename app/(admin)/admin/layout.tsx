import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { AdminSidebar } from "@/components/admin/sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  // 1. Pokud uživatel není přihlášen, pryč s ním
  if (!session) {
    redirect("/prihlaseni");
  }

  // 2. Kontrola role
  // Díky kroku 1 a 2 by teď TypeScript měl vědět, že 'role' existuje.
  // Pokud by přesto protestoval (kvůli cache), je to jen vizuální chyba editoru, runtime bude fungovat.
  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Sidebar - fixní vlevo */}
      <AdminSidebar />

      {/* Obsah - posunutý doprava */}
      <div className="md:ml-64 flex-1 flex flex-col min-h-screen">
        <header className="flex h-16 items-center gap-4 border-b bg-background px-6 md:hidden">
           <span className="font-bold">Administrace</span>
        </header>
        <main className="flex-1 p-6 md:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}