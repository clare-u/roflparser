import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import QueryProvider from "@/components/QueryProvider";
import Navigation from "@/components/navigation/Navigation";

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
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
          rel="stylesheet"
        />
      </head>
      <body>
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
