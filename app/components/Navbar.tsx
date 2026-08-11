"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Users, ArrowUpRight, Menu, X, LogOut } from "lucide-react";

export function Navbar() {
    const { data: session, status } = useSession();
    const pathname = usePathname();
    const router = useRouter();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleNavClick = (
        e: React.MouseEvent<HTMLAnchorElement>,
        targetId: string
    ) => {
        if (pathname === "/") {
            e.preventDefault();
            const elem = document.getElementById(targetId);
            if (elem) {
                elem.scrollIntoView({ behavior: "smooth" });
            }
        } else {
            router.push(`/#${targetId}`);
        }
        setMobileMenuOpen(false);
    };

    const isHome = pathname === "/";
    const isAdminPath = pathname === "/admin";
    const isDetailPath = pathname === "/detail";

    // Role Status Badge Rendering (ONLY shown when authenticated and NOT on landing page)
    const renderRoleBadge = () => {
        if (!session?.user || isHome) return null;
        const role = session.user.role;
        if (role === "admin") {
            return (
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#d6f837]/20 text-[#d6f837] border border-[#d6f837]/30 hidden sm:inline-block">
                    Admin
                </span>
            );
        }
        if (role === "tengkulak") {
            return (
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#d6f837]/20 text-[#d6f837] border border-[#d6f837]/30 hidden sm:inline-block">
                    Tengkulak
                </span>
            );
        }
        if (role === "superadmin") {
            return (
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 hidden sm:inline-block">
                    Superadmin
                </span>
            );
        }
        return null;
    };

    return (
        <header className="sticky top-4 z-50 px-4 sm:px-6 pointer-events-none">
            <div className="max-w-7xl mx-auto floating-navbar px-5 h-16 sm:h-18 flex items-center justify-between pointer-events-auto">
                <div className="flex items-center gap-3">
                    <Link href="/" className="flex items-center gap-3">
                        <Image
                            src="/Logo (3).svg"
                            alt="TaniCerdas Logo"
                            width={32}
                            height={32}
                            className="h-8 w-auto object-contain"
                        />
                        <span className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans flex items-center gap-2">
                            TaniCerdas
                            {renderRoleBadge()}
                        </span>
                    </Link>
                </div>

                {/* Desktop Navigation Items */}
                        <nav className="hidden lg:flex items-center gap-6 flex-nowrap overflow-x-auto text-xs font-bold tracking-wider text-white/80 uppercase">
                    <a
                        href="/#hero"
                        onClick={(e) => handleNavClick(e, "hero")}
                        className={`transition-colors hover:text-[#d6f837] ${
                            isHome ? "text-[#d6f837]" : ""
                        }`}
                    >
                        Beranda
                    </a>
                    <a
                        href="/#overview"
                        onClick={(e) => handleNavClick(e, "overview")}
                        className="transition-colors hover:text-[#d6f837]"
                    >
                        Ringkasan
                    </a>
                    <a
                        href="/#stats"
                        onClick={(e) => handleNavClick(e, "stats")}
                        className="transition-colors hover:text-[#d6f837]"
                    >
                        Grafik & Tren
                    </a>
                    <a
                        href="/#grafik"
                        onClick={(e) => handleNavClick(e, "grafik")}
                        className="transition-colors hover:text-[#d6f837]"
                    >
                        Data Panen
                    </a>
                    {session?.user && (session.user.role === "admin" || session.user.role === "superadmin") && (
                        <Link
                            href="/admin"
                            className={`transition-colors hover:text-[#d6f837] ${
                                pathname === "/admin" ? "text-[#d6f837]" : ""
                            }`}
                        >
                            Detail Statistik
                        </Link>
                    )}

                    {session?.user && session.user.role === "tengkulak" && (
                        <Link
                            href="/tengkulak"
                            className={`transition-colors hover:text-[#d6f837] ${
                                pathname === "/tengkulak" ? "text-[#d6f837]" : ""
                            }`}
                        >
                            Riwayat
                        </Link>
                    )}

                    {session?.user && session.user.role !== "tengkulak" && (
                        <Link
                            href="/detail"
                            className={`transition-colors hover:text-[#d6f837] ${
                                isDetailPath ? "text-[#d6f837]" : ""
                            }`}
                        >
                            Inputan
                        </Link>
                    )}
                </nav>

                <div className="hidden sm:flex items-center gap-4">
                    {status === "loading" ? null : session?.user ? (
                        <button
                            onClick={() => signOut({ callbackUrl: "/admin" })}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-500/20 hover:bg-red-500 text-red-200 hover:text-white text-xs font-bold uppercase tracking-wider transition-all border border-red-400/30 hover:border-red-500 cursor-pointer"
                        >
                            <LogOut className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Keluar</span>
                        </button>
                    ) : (
                        <Link
                            href="/admin"
                            className="btn-neon text-xs font-bold uppercase tracking-wider py-2 px-5"
                        >
                            <Users className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Login</span>
                            <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                        </Link>
                    )}
                </div>

                {/* Mobile Menu Toggle Button */}
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="lg:hidden p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
                >
                    {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Drawer Menu */}
            {mobileMenuOpen && (
                <div className="lg:hidden max-w-7xl mx-auto mt-2 bg-[#132417]/95 backdrop-blur-xl border border-white/15 rounded-2xl p-6 space-y-4 shadow-2xl animate-in slide-in-from-top-2 pointer-events-auto">
                    <nav className="flex flex-col gap-4 text-sm font-bold tracking-wider text-white/90 uppercase">
                        <a
                            href="/#hero"
                            onClick={(e) => handleNavClick(e, "hero")}
                            className={isHome ? "text-[#d6f837]" : ""}
                        >
                            Beranda
                        </a>
                        <a
                            href="/#overview"
                            onClick={(e) => handleNavClick(e, "overview")}
                        >
                            Ringkasan
                        </a>
                        <a
                            href="/#stats"
                            onClick={(e) => handleNavClick(e, "stats")}
                        >
                            Grafik & Tren
                        </a>
                        <a
                            href="/#grafik"
                            onClick={(e) => handleNavClick(e, "grafik")}
                        >
                            Data Panen
                        </a>
                        {session?.user && (session.user.role === "admin" || session.user.role === "superadmin") && (
                            <Link
                                href="/admin"
                                className={pathname === "/admin" ? "text-[#d6f837]" : ""}
                            >
                                Detail Statistik
                            </Link>
                        )}
                        {session?.user && session.user.role === "tengkulak" && (
                            <Link
                                href="/tengkulak"
                                className={pathname === "/tengkulak" ? "text-[#d6f837]" : ""}
                            >
                               Riwayat
                            </Link>
                        )}

                        {/* Nav item Inputan ONLY visible when logged in (Admin / Superadmin) */}
                        {session?.user && session.user.role !== "tengkulak" && (
                            <Link href="/detail" className={isDetailPath ? "text-[#d6f837]" : ""}>
                                Inputan
                            </Link>
                        )}
                    </nav>
                    <div className="pt-2">
                        {status === "loading" ? null : session?.user ? (
                            <button
                                onClick={() => {
                                    setMobileMenuOpen(false);
                                    signOut({ callbackUrl: "/admin" });
                                }}
                                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-red-500/20 hover:bg-red-500 text-red-200 hover:text-white text-xs font-bold uppercase tracking-wider transition-all border border-red-400/30 hover:border-red-500 cursor-pointer"
                            >
                                <LogOut className="w-4 h-4 stroke-[2.5]" />
                                <span>Keluar</span>
                            </button>
                        ) : (
                            <Link
                                href="/admin"
                                onClick={() => setMobileMenuOpen(false)}
                                className="btn-neon w-full text-xs font-bold uppercase tracking-wider py-3 justify-center"
                            >
                                <Users className="w-4 h-4 stroke-[2.5]" />
                                <span>Login</span>
                                <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
