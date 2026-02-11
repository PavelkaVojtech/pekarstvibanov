import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1 w-full max-w-(--breakpoint-2xl) mx-auto px-4 sm:px-6 lg:px-12 py-6 md:py-10">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}