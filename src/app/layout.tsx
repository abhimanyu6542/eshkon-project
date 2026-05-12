import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { SkipLink } from "@/components/ui/SkipLink";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Page Studio",
  description: "WYSIWYG-lite page editor powered by Contentful",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-gray-50 font-sans antialiased">
        <SkipLink />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
