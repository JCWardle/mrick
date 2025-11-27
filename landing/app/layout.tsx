import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Peek - Discover What You Both Want | Relationship App for Couples",
  description: "Peek helps couples explore intimacy together through a private, judgment-free swiping experience. Discover shared interests, set boundaries, and deepen your connection.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

