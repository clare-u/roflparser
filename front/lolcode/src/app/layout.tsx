import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import QueryProvider from "@/components/QueryProvider";
import Navigation from "@/components/navigation/Navigation";
import Script from "next/script";

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
        {/* Google Tag Manager */}
        <Script id="gtm-init" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-KM7LM2V6');
          `}
        </Script>

        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined&display=swap"
          rel="stylesheet"
        />
      </head>

      <body>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-KM7LM2V6"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          ></iframe>
        </noscript>

        <QueryProvider>
          <Navigation />
          <div className="flex h-full flex-col items-center justify-center">
            {children}
          </div>
          <Toaster richColors position="top-right" offset={60} />
        </QueryProvider>
      </body>
    </html>
  );
}
