import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";

const inter = Inter({ subsets: ["latin"] });

// Configuración de visualización móvil nativa obligatoria
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#050505",
};

// Metadatos SEO y Redes Sociales
export const metadata: Metadata = {
  metadataBase: new URL("https://vibrandstream.vercel.app"),
  title: "VibrandStream | Cuentas y Perfiles de Streaming Premium",
  description: "Tus plataformas favoritas de streaming al mejor precio. Acceso inmediato en 10-15 minutos con garantía total y soporte directo vía WhatsApp.",
  keywords: [
    "streaming",
    "cuentas de streaming",
    "netflix barato",
    "spotify premium",
    "disney plus",
    "hbo max",
    "prime video",
    "vibrandstream"
  ],
  authors: [{ name: "Gerardo Custodio - VibrandStream" }],
  openGraph: {
    title: "VibrandStream | Streaming Premium Garantizado",
    description: "Tus plataformas favoritas sin interrupciones. Cuentas originales con entrega en minutos y pago seguro por SPEI.",
    url: "https://vibrandstream.vercel.app",
    siteName: "VibrandStream",
    locale: "es_MX",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "VibrandStream - Cuentas de Streaming Premium",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VibrandStream | Streaming Premium",
    description: "Cuentas y perfiles originales al mejor precio con entrega express.",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark w-full max-w-full overflow-x-hidden">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
      </head>
      <body className={`${inter.className} bg-[#050505] text-gray-200 antialiased selection:bg-blue-500/30 w-full max-w-full overflow-x-hidden min-h-screen`}>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}