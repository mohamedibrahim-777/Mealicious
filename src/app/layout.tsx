import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mealicious Store - Premium Dry Fruits & Healthy Snacks",
  description: "Shop premium quality cashews, almonds, trail mix, dried fruits, flavored nuts & healthy snacks. 100% natural, FSSAI certified. Free shipping on orders above ₹599.",
  keywords: ["dry fruits", "healthy snacks", "cashews", "almonds", "trail mix", "premium nuts", "organic", "Mealicious", "Indian snacks", "health food"],
  authors: [{ name: "MEALICIOUS VENTURES PRIVATE LIMITED" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Mealicious Store - Premium Dry Fruits & Healthy Snacks",
    description: "Handpicked premium dry fruits and healthy snacks delivered fresh to your doorstep. 100% natural, FSSAI certified.",
    siteName: "Mealicious Store",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mealicious Store - Premium Dry Fruits & Healthy Snacks",
    description: "Handpicked premium dry fruits and healthy snacks delivered fresh to your doorstep.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
