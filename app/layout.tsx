import type { Metadata } from "next";
import "./globals.css";
import ReduxProvider from "../components/ReduxProvider";
import { Toaster } from "sonner";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Chikitoslandia",
    template: "%s | Chikitoslandia",
  },
  description:
    "Tienda online de ropa, juguetes y articulos para bebes y ninos.",
  openGraph: {
    title: "Chikitoslandia",
    description:
      "Ropa, juguetes y articulos para bebes y ninos en una tienda online pensada para la familia.",
    url: "/",
    siteName: "Chikitoslandia",
    images: [
      {
        url: "/chikitoslandia-og.png",
        width: 1730,
        height: 909,
        alt: "Chikitoslandia tienda online para bebes",
      },
    ],
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Chikitoslandia",
    description:
      "Ropa, juguetes y articulos para bebes y ninos en una tienda online pensada para la familia.",
    images: ["/chikitoslandia-og.png"],
  },
  other: {
    google: "notranslate",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      translate="no"
      data-scroll-behavior="smooth"
      className="notranslate"
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <ReduxProvider>{children}</ReduxProvider>
        <Toaster
          position="top-right"
          expand={true}
          richColors
          closeButton
          icons={{
            success: undefined,
            error: undefined,
            warning: undefined,
            info: undefined,
          }}
          toastOptions={{
            style: {
              fontSize: "14px",
              minWidth: "320px",
              maxWidth: "500px",
              padding: "16px",
            },
            className: "text-sm sm:text-base",
            duration: 4000,
            unstyled: false,
          }}
        />
      </body>
    </html>
  );
}
