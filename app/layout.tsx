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
          <AppProvider>
            <div className="flex-1 flex flex-col">
              {children}
            </div>
            <footer className="bg-[#15291b] text-white pt-8 pb-8 border-t border-white/10 mt-auto">
              <div className="container mx-auto px-6 max-w-7xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-8">
                  <div className="md:col-span-1">
                    <h2 className="text-2xl font-extrabold text-[#d6f837] mb-4">TaniCerdas</h2>
                    <p className="text-white/70 text-sm leading-relaxed">
                      Platform digital terpadu untuk memantau harga beras, gabah, dan distribusi hasil panen di tingkat Desa secara real-time. Membantu petani mencapai produktivitas maksimal.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-4">Navigasi</h3>
                    <ul className="space-y-3 text-sm text-white/70 font-medium">
                      <li><a href="/" className="hover:text-[#d6f837] transition-colors">Beranda</a></li>
                      <li><a href="/admin" className="hover:text-[#d6f837] transition-colors">Portal Pengelola</a></li>
                      <li><a href="#" className="hover:text-[#d6f837] transition-colors">Statistik Desa</a></li>
                      <li><a href="#" className="hover:text-[#d6f837] transition-colors">Panduan Petani</a></li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-4">Hubungi Kami</h3>
                    <ul className="space-y-3 text-sm text-white/70 font-medium">
                      <li>Kantor Balai Desa Kedungrejo</li>
                      <li>Telepon: </li>
                      <li>Email: </li>
                    </ul>
                  </div>
                </div>
                <div className="pt-4 border-t border-white/10 text-center flex flex-col md:flex-row justify-center items-center gap-4">
                  <p className="text-white/60 text-xs font-semibold">
                    © {new Date().getFullYear()} TaniCerdas. Seluruh Hak Cipta Dilindungi.
                  </p>
                </div>
              </div>
            </footer>
          </AppProvider>
        </Providers>
      </body>
    </html>
  );
}
