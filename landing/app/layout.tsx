import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Peek - Discover What You Both Want | Relationship App for Couples",
  description: "Peek helps couples explore intimacy together through a private, judgment-free swiping experience. Discover shared interests, set boundaries, and deepen your connection.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ background: 'linear-gradient(to bottom, #6B46C1 0%, #000000 100%)' }}>
      <body style={{ background: 'linear-gradient(to bottom, #6B46C1 0%, #000000 100%)' }}>{children}</body>
    </html>
  );
}

