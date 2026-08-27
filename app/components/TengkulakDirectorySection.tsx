"use client";

import React, { useState, useEffect } from "react";
import { Users, Phone, MessageCircle, Filter, CheckCircle2, Search } from "lucide-react";
import { DUSUN_NAMES } from "../lib/constants";

interface TengkulakItem {
    id: string;
    name: string;
    username: string;
    assignedDusun: number;
    dusunName: string;
    whatsapp: string;
}

export function TengkulakDirectorySection() {
    const [tengkulaks, setTengkulaks] = useState<TengkulakItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDusun, setSelectedDusun] = useState<number | "ALL">("ALL");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        async function fetchTengkulaks() {
            try {
                const res = await fetch("/api/tengkulak");
                if (res.ok) {
                    const data = await res.json();
                    setTengkulaks(data.data || []);
                }
            } catch (err) {
                console.error("Failed to fetch tengkulak list:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchTengkulaks();
    }, []);

    const filtered = tengkulaks.filter((t) => {
        const matchesDusun = selectedDusun === "ALL" || t.assignedDusun === selectedDusun;
        const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.dusunName.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesDusun && matchesSearch;
    });

    const formatWhatsappUrl = (wa: string, name: string, dusun: string) => {
        let clean = wa.replace(/\D/g, "");
        if (clean.startsWith("0")) {
            clean = "62" + clean.substring(1);
        } else if (!clean.startsWith("62") && clean.length > 0) {
            clean = "62" + clean;
        }
        const text = encodeURIComponent(
            `Halo Bapak/Ibu ${name} (Mitra Tengkulak Dusun ${dusun}), saya warga/petani Desa Kedungrejo ingin menanyakan info harga dan transaksi panen.`
        );
        return `https://wa.me/${clean}?text=${text}`;
    };

    return (
        <section id="tengkulak-list" className="space-y-8 pt-6 border-t border-[#e2e0d4]">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-2">
                    <span className="badge-pill-light">
                        <span className="badge-bullet-dark"></span>
                        JARINGAN MITRA DESA
                    </span>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#121e14] tracking-tight">
                        Daftar Kontak Mitra Tengkulak
                    </h2>
                    <p className="text-[#121e14]/70 text-sm sm:text-base max-w-2xl leading-relaxed">
                        Hubungi mitra pembeli/tengkulak resmi yang terdaftar di Desa Kedungrejo untuk transparansi dan kepastian transaksi hasil panen.
                    </p>
                </div>

                {/* Search Bar */}
                <div className="relative w-full md:w-72">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#121e14]/50" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari nama atau dusun..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#e2e0d4] rounded-xl text-xs font-semibold text-[#121e14] focus:outline-none focus:ring-2 focus:ring-[#15291b]"
                    />
                </div>
            </div>

            {/* Dusun Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                <button
                    onClick={() => setSelectedDusun("ALL")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                        selectedDusun === "ALL"
                            ? "bg-[#15291b] text-[#d6f837] shadow-sm"
                            : "bg-white text-[#121e14]/70 border border-[#e2e0d4] hover:bg-[#f4f3ea]"
                    }`}
                >
                    Semua Wilayah ({tengkulaks.length})
                </button>
                {[1, 2, 3, 4].map((d) => {
                    const count = tengkulaks.filter((t) => t.assignedDusun === d).length;
                    return (
                        <button
                            key={d}
                            onClick={() => setSelectedDusun(d)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                                selectedDusun === d
                                    ? "bg-[#15291b] text-[#d6f837] shadow-sm"
                                    : "bg-white text-[#121e14]/70 border border-[#e2e0d4] hover:bg-[#f4f3ea]"
                            }`}
                        >
                            Dusun {DUSUN_NAMES[d]} ({count})
                        </button>
                    );
                })}
            </div>

            {/* Tengkulak Cards Grid */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-44 bg-gray-200/70 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white p-10 rounded-2xl border border-[#e2e0d4] text-center space-y-2">
                    <p className="text-[#121e14]/60 text-sm font-semibold">
                        Tidak ada mitra tengkulak yang ditemukan untuk kriteria ini.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map((t) => {
                        const hasWa = Boolean(t.whatsapp && t.whatsapp.trim().length >= 8);

                        return (
                            <div
                                key={t.id}
                                className="bg-white p-6 rounded-[1.75rem] border border-[#e2e0d4] shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-5 group"
                            >
                                <div className="space-y-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-[#15291b]/10 text-[#15291b] flex items-center justify-center font-bold group-hover:bg-[#15291b] group-hover:text-[#d6f837] transition-colors">
                                            <Users className="w-6 h-6 stroke-[2.2]" />
                                        </div>
                                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100/70 text-emerald-800 border border-emerald-200">
                                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                            Mitra Resmi
                                        </span>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold text-[#121e14] group-hover:text-[#15291b]">
                                            {t.name}
                                        </h3>
                                        <p className="text-xs font-semibold text-[#121e14]/60 mt-0.5">
                                            Wilayah Operasional: <strong>Dusun {t.dusunName}</strong>
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-[#e2e0d4]/80 space-y-3">
                                    {hasWa ? (
                                        <a
                                            href={formatWhatsappUrl(t.whatsapp, t.name, t.dusunName)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold shadow-sm hover:shadow transition-all cursor-pointer"
                                        >
                                            <MessageCircle className="w-4 h-4 fill-white stroke-none" />
                                            <span>Chat WhatsApp</span>
                                            <span className="text-[10px] opacity-80 font-normal">({t.whatsapp})</span>
                                        </a>
                                    ) : (
                                        <div className="w-full text-center py-2.5 px-4 rounded-xl bg-[#f4f3ea] text-[#121e14]/60 text-xs font-semibold border border-[#e2e0d4]">
                                            Kontak belum terdaftar
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
