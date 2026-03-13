import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ToastProvider } from "@/components/ui/toast";
import { Toaster } from "@/components/ui/toaster";
import { CartProvider } from "@/components/providers/cart-provider";
import { CookieConsentComponent } from "@/components/cookie-consent";
import { cookies } from "next/headers";
import Script from "next/script";
import { GoogleAnalytics } from "@next/third-parties/google";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies()
  const initialItemCount = Number(cookieStore.get("cart_count")?.value ?? 0) || 0

  return (
    <html lang="cs" suppressHydrationWarning className="overflow-x-hidden">
      <head>
        <Script id="consent-mode" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('consent', 'default', {
              'analytics_storage': 'denied',
              'ad_storage': 'denied',
              'ad_user_data': 'denied',
              'ad_personalization': 'denied',
              'wait_for_update': 500
            });
          `}
        </Script>
      </head>
      <body className="antialiased flex flex-col min-h-screen font-sans overflow-x-hidden w-full">
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
            <CookieConsentComponent />
          </ToastProvider>
        </ThemeProvider>
        <GoogleAnalytics gaId="G-47M299CGBZ" />
      </body>
    </html>
  );
}