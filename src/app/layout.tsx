import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {Navbar} from "@/components/navbar"; // 1. Import the global Navbar
import { CartSlideOut } from "@/components/cart-slide-out"; // 1. Import it

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Multi-Vendor Marketplace",
  description: "Built with Next.js, Prisma, and Supabase",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* 2. Nest the Navbar here so it sits permanently on top of all pages */}
        <Navbar />
        <CartSlideOut /> {/* 3. Mount it globally here! */}
        {children}
      </body>
    </html>
  );
}