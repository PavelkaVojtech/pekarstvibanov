import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ToastProvider } from "@/components/ui/toast";
import { Toaster } from "@/components/ui/toaster";
import { CartProvider } from "@/components/providers/cart-provider";
import { cookies } from "next/headers";


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies()
  const initialItemCount = Number(cookieStore.get("cart_count")?.value ?? 0) || 0

  return (
    <html lang="cs" suppressHydrationWarning>
      <body className={`antialiased flex flex-col min-h-screen font-sans`}>
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
          <ToastProvider>
            <CartProvider initialItemCount={initialItemCount}>
              {children}
            </CartProvider>
            <Toaster />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}