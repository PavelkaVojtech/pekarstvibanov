import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { EmployeeSidebar } from "@/components/employee/sidebar";

export default async function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    redirect("/prihlaseni");
  }

  if (session.user.role !== "EMPLOYEE") {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen bg-muted/20">
      <EmployeeSidebar />

      <div className="md:ml-64 flex-1 flex flex-col min-h-screen">
        <header className="flex h-16 items-center gap-4 border-b bg-background px-6 md:hidden">
           <span className="font-bold">Zaměstnanec</span>
        </header>
        <main className="flex-1 p-6 md:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
