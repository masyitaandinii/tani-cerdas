import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AppProvider } from "./lib/store";
import { Providers } from "./providers";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "TaniCerdas | Wujudkan Pertanian Desa Cerdas & Berkelanjutan",
    template: "%s | TaniCerdas"
  },
  description: "Platform digital untuk memantau harga beras, gabah, dan distribusi hasil panen di tingkat Desa secara real-time. Membantu petani meningkatkan produktivitas.",
  keywords: ["TaniCerdas", "Pertanian Cerdas", "Dashboard Pertanian", "Harga Gabah", "Harga Beras", "Distribusi Panen", "Petani Indonesia", "Desa Digital"],
  authors: [{ name: "Tim TaniCerdas" }],
  creator: "TaniCerdas",
  publisher: "TaniCerdas",
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://tani-cerdas-xi.vercel.app/",
    title: "TaniCerdas - Portal Data Pertanian Desa",
    description: "Pantau harga beras, gabah, dan distribusi panen tingkat dusun secara real-time dan terpercaya.",
    siteName: "TaniCerdas Dashboard",
  },
  twitter: {
    card: "summary_large_image",
    title: "TaniCerdas - Portal Data Pertanian Desa",
    description: "Pantau harga beras, gabah, dan distribusi panen tingkat dusun secara real-time dan terpercaya.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers>
          <AppProvider>{children}</AppProvider>
        </Providers>
      </body>
    </html>
  );
}
