import type { Metadata, Viewport } from "next";
import "./globals.css";
import { InstallPwaPrompt } from "@/components/pwa/InstallPwaPrompt";

export const viewport: Viewport = {
  themeColor: "#059669",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "مدرسة المعالي الأهلية الابتدائية المختلطة | تأسست سنة 2017",
  description: "المنظومة الإدارية والتربوية الشاملة لمدرسة المعالي الأهلية الابتدائية المختلطة - تأسست سنة 2017.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "مدرسة المعالي الأهلية",
  },
  icons: {
    icon: "/icons/icon-192x192.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="مدرسة المعالي الأهلية" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#f8fafc] text-slate-800 antialiased font-cairo selection:bg-brand-100 selection:text-brand-900">
        {children}
        <InstallPwaPrompt />
      </body>
    </html>
  );
}
