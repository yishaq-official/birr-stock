import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "./(marketing)/_layouts/header";

export const metadata: Metadata = {
  title: "BirrStock IMS | Enterprise E-Commerce Inventory Management",
  description: "Internal enterprise-grade inventory management system with real-time ledger and hardware scanner support.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#090d16",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, // Useful for handheld barcode scanners to prevent unintentional zoom
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-[#090d16] text-gray-100">
        <Header />
        <main className="flex-1 flex flex-col">{children}</main>
        <footer className="border-t border-gray-800/80 px-6 py-4 text-xs text-gray-500 flex justify-between items-center bg-[#070a10]">
          <span>BirrStock IMS v0.1.0 • Internal Enterprise Edition</span>
          <span>PostgreSQL Ledger + Redis Redlock Verified</span>
        </footer>
      </body>
    </html>
  );
}
