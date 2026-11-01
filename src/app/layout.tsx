import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Seen Hijabi | متجر سين للحجاب والأزياء",
    template: "%s | Seen Hijabi",
  },
  description:
    "متجر سين للحجاب والأزياء النسائية الراقية – اكتشفي تشكيلتنا المميزة من الملابس والحجابات.",
  keywords: ["seen hijabi", "حجاب", "سين", "أزياء نسائية", "ملابس محجبات"],
  authors: [{ name: "Seen Hijabi" }],
  openGraph: {
    type: "website",
    locale: "ar_EG",
    alternateLocale: "en_US",
    siteName: "Seen Hijabi",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="ltr" suppressHydrationWarning>
      <head>
        {/* Preconnect to Google Fonts for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
