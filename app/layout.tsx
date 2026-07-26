import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://teleradpartners.com"),
  title: {
    default: "Telerad Partners | Global Teleradiology Reporting",
    template: "%s | Telerad Partners",
  },
  description:
    "Telerad Partners connects hospitals and imaging centres with subspecialist radiologists for global teleradiology reporting.",
  keywords: [
    "teleradiology",
    "radiology reporting",
    "subspecialist radiologists",
    "musculoskeletal imaging",
    "oncology imaging",
    "acute imaging",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: "Telerad Partners | Making Medicine Global",
    description:
      "Global teleradiology reporting with subspecialist expertise and round-the-clock coverage.",
    url: "https://teleradpartners.com",
    siteName: "Telerad Partners",
    locale: "en_GB",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1536,
        height: 1024,
        alt: "Telerad Partners — Making Medicine Global",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Telerad Partners | Making Medicine Global",
    description:
      "Global teleradiology reporting with subspecialist expertise and round-the-clock coverage.",
    images: ["/og.png"],
  },
  icons: {
    icon: "/telerad-logo.png",
    apple: "/telerad-logo.png",
  },
  category: "healthcare",
};

export const viewport: Viewport = {
  themeColor: "#03111d",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>{children}</body>
    </html>
  );
}
