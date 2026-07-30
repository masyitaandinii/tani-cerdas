import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-[#f4f3ea] text-[#121e14] flex flex-col">
            <header className="bg-[#15291b] text-white border-b border-white/10 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Image src="/Logo (3).svg" alt="TaniCerdas Logo" width={32} height={32} className="h-8 w-auto object-contain" />
                        <span className="text-xl font-bold tracking-tight text-white font-sans flex items-center gap-2">
                            TaniCerdas <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#d6f837]/20 text-[#d6f837] border border-[#d6f837]/30">Admin</span>
                        </span>
                    </div>

                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white hover:bg-[#d6f837] hover:text-[#121e14] transition-all text-xs font-bold uppercase tracking-wider"
                    >
                        <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
                        <span className="hidden sm:inline">Kembali ke Beranda</span>
                    </Link>
                </div>
            </header>

            <main className="flex-1 w-full max-w-7xl mx-auto p-6 md:p-10">
                {children}
            </main>
        </div>
    );
}
