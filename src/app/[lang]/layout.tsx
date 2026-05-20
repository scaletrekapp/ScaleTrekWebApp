import type { Metadata } from "next";
import "../globals.css";
import { Providers } from "../providers";
import { Inter } from "next/font/google";
import { LayoutProvider } from "./LayoutProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "ScaleTrek — The Blueprint Meets The Steel",
  description:
    "An elite investment discovery network bridging visionary Dreamers and verified Reality Checks in the Moroccan and regional ecosystem.",
  icons: { icon: "/favicon.svg" },
};

export async function generateStaticParams() {
  return ["en", "fr", "ar", "es"].map((lang) => ({ lang }));
}

export default function RootLayout({
  children,
  params: { lang },
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  const isRTL = lang === "ar";

  return (
    <html lang={lang} dir={isRTL ? "rtl" : "ltr"} className={inter.variable} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`min-h-screen font-sans ${isRTL ? "font-arabic" : ""}`}>
        <Providers>
          <LayoutProvider lang={lang}>{children}</LayoutProvider>
        </Providers>
      </body>
    </html>
  );
}
