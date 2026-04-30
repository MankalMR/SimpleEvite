import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Inter, Playfair_Display, Lora, Pacifico, Oswald } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import LayoutWrapper from "@/components/LayoutWrapper";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const lora = Lora({ subsets: ["latin"], variable: "--font-lora" });
const pacifico = Pacifico({ weight: "400", subsets: ["latin"], variable: "--font-pacifico" });
const oswald = Oswald({ subsets: ["latin"], variable: "--font-oswald" });

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'https://evite.mankala.space'
  ),
  ...generateSEOMetadata({
    title: "Simple Evite - Free Digital Invitations & Online RSVP Tracker",
    description: "Create stunning, personalized event invitations with real-time RSVP tracking. Perfect for weddings, birthdays, and parties. Free, beautiful templates with no complex setup.",
    keywords: ["digital invitations", "online rsvp tracker", "free evite alternative", "event invitation maker", "wedding rsvp website", "party invite builder"],
  }),
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#2563eb',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${playfair.variable} ${lora.variable} ${pacifico.variable} ${oswald.variable} antialiased bg-background`}
      >
        <Providers>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}
