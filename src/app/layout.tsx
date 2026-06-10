import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "VDW Health & Safety Solutions | OHS Compliance for Gauteng & Limpopo SMEs",
    template: "%s | VDW Health & Safety Solutions",
  },
  description:
    "Outsourced health & safety compliance for manufacturing, warehousing, and engineering SMEs across Gauteng and Limpopo. Compliance audits, H&S file builds, HIRA, outsourced safety officers, and training.",
  metadataBase: new URL("https://vdwsafety.com"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-ZA">
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased bg-offwhite text-ink`}>
        {children}
      </body>
    </html>
  );
}
