import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import QueryProvider from "@/components/QueryProvider";
import Navigation from "@/components/navigation/Navigation";
import Script from "next/script";
import { Suspense } from "react";
import ScrollToTopButton from "@/components/button/ScrollToTopButton";

export const metadata: Metadata = {
  title: "롤내전봇",
  description: "rofl 파일을 통해 내전 전적을 조회합니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        {/* Google Analytics (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-NJVQC93B5Z"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-NJVQC93B5Z');
          `}
        </Script>

        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined&display=swap"
          rel="stylesheet"
        />
      </head>

      <body>
        <QueryProvider>
          <Navigation />
          <Suspense>
            <div className="flex h-full flex-col items-center justify-center">
              {children}
            </div>
            <ScrollToTopButton />
          </Suspense>
          <Toaster richColors position="top-right" offset={60} />
        </QueryProvider>
      </body>
    </html>
  );
}
