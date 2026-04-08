import type { Metadata } from "next";
import { Readex_Pro } from "next/font/google";
import "./globals.css";

const readexPro = Readex_Pro({
  variable: "--font-readex-pro",
  subsets: ["arabic", "latin"],
});

export const metadata: Metadata = {
  title: "مخبز السعادة البلدي - لوحة التحكم",
  description: "لوحة تحكم احترافية لمخبز السعادة البلدي",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${readexPro.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
