"use client";

import React, { useState } from "react";
import { MessageSquareWarning, Send, Globe, ArrowUpRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { VILLAGE_INFO, DUSUN_NAMES } from "../lib/constants";

export function ComplaintSection() {
    const [formData, setFormData] = useState({
        nama: "",
        noHp: "",
        dusun: 1,
        kategori: "Harga Tidak Sesuai Standar",
        pesan: "",
    });
    const [submitted, setSubmitted] = useState(false);

    const categories = [
        "Harga Tidak Sesuai Standar Pemerintah",
        "Ketidaksesuaian Pembayaran Tengkulak",
        "Kendala Pasokan / Kelangkaan Pupuk",
        "Masalah Saluran Irigasi & Pengairan",
        "Lainnya / Masukan Umum",
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.nama || !formData.pesan) {
            alert("Harap lengkapi nama dan isi pengaduan Anda.");
            return;
        }

        const dusunName = DUSUN_NAMES[Number(formData.dusun)] || `Dusun ${formData.dusun}`;
        const template = `*PENGADUAN WARGA PERTANIAN - ${VILLAGE_INFO.name.toUpperCase()}*\n\n` +
            `👤 *Nama Pelapor:* ${formData.nama}\n` +
            `📱 *Nomor WA Pelapor:* ${formData.noHp || '-'}\n` +
            `📍 *Asal Wilayah:* Dusun ${dusunName}\n` +
            `📌 *Kategori Laporan:* ${formData.kategori}\n\n` +
            `📝 *Isi Pengaduan / Keluhan:*\n"${formData.pesan}"\n\n` +
            `_Dikirim melalui Portal TaniCerdas ${VILLAGE_INFO.name}_`;

        const waUrl = `https://wa.me/${VILLAGE_INFO.whatsappPengaduan}?text=${encodeURIComponent(template)}`;

        // Open WhatsApp in new tab
        window.open(waUrl, "_blank");
        setSubmitted(true);
    };

    return (
        <section id="pengaduan" className="space-y-8 pt-6 border-t border-[#e2e0d4]">
            <div className="bg-[#132417] rounded-[2rem] p-6 sm:p-10 text-white relative overflow-hidden shadow-xl border border-white/10">
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#d6f837]/10 rounded-full blur-3xl pointer-events-none" />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
                    {/* Left Column: Info & Direct Links */}
                    <div className="lg:col-span-5 space-y-6">
                        <span className="badge-pill-dark">
                            <span className="badge-bullet"></span> LAYANAN ASPIRASI WARGA
                        </span>
                        
                        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
                            Pusat Pengaduan & Bantuan Petani Desa
                        </h2>

                        <p className="text-white/80 text-sm sm:text-base leading-relaxed">
                            Pemerintah {VILLAGE_INFO.name} berkomitmen menjaga kestabilan harga dan melindungi kesejahteraan petani. Sampaikan keluhan, ketidaksesuaian harga jual, atau kendala lapangan secara langsung.
                        </p>

                        <div className="space-y-3 pt-2">
                            <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
                                <ShieldCheck className="w-6 h-6 text-[#d6f837] shrink-0" />
                                <div>
                                    <h4 className="text-xs font-bold text-white">Privasi & Verifikasi Terjamin</h4>
                                    <p className="text-[11px] text-white/60">Laporan langsung diteruskan ke petugas Pemerintah Desa.</p>
                                </div>
                            </div>

                            {/* Direct Portal Link */}
                            <a
                                href={VILLAGE_INFO.websiteUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between p-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 transition-all text-white group cursor-pointer"
                            >
                                <div className="flex items-center gap-3">
                                    <Globe className="w-5 h-5 text-[#d6f837]" />
                                    <div>
                                        <h4 className="text-xs font-bold">Website Resmi {VILLAGE_INFO.name}</h4>
                                        <p className="text-[11px] text-white/60">Buka portal utama pemerintahan desa</p>
                                    </div>
                                </div>
                                <ArrowUpRight className="w-4 h-4 text-white/60 group-hover:text-[#d6f837] transition-colors" />
                            </a>
                        </div>
                    </div>

                    {/* Right Column: Complaint Form */}
                    <div className="lg:col-span-7 bg-white text-[#121e14] p-6 sm:p-8 rounded-[1.75rem] shadow-2xl space-y-5">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-[#15291b] text-[#d6f837] rounded-xl font-bold">
                                <MessageSquareWarning className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-[#121e14]">
                                    Formulir Pengaduan Cepat
                                </h3>
                                <p className="text-xs text-[#121e14]/60">
                                    Isi data berikut untuk meneruskan aduan resmi ke Hotline Desa
                                </p>
                            </div>
                        </div>

                        {submitted && (
                            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between gap-2 font-bold animate-in fade-in">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                                    <span>Format laporan telah disiapkan dan dialihkan ke WhatsApp Admin Desa!</span>
                                </div>
                                <button onClick={() => setSubmitted(false)} className="text-emerald-700 text-xs underline">
                                    Kirim lagi
                                </button>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-[#121e14]">
                                        Nama Warga / Pelapor <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.nama}
                                        onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                                        placeholder="Nama lengkap Anda"
                                        className="w-full px-4 py-2.5 bg-[#f4f3ea] border border-[#e2e0d4] rounded-xl text-xs font-bold text-[#121e14] focus:outline-none focus:ring-2 focus:ring-[#15291b]"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-[#121e14]">
                                        Nomor WhatsApp (Opsional)
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.noHp}
                                        onChange={(e) => setFormData({ ...formData, noHp: e.target.value })}
                                        placeholder="Contoh: 08123456789"
                                        className="w-full px-4 py-2.5 bg-[#f4f3ea] border border-[#e2e0d4] rounded-xl text-xs font-bold text-[#121e14] focus:outline-none focus:ring-2 focus:ring-[#15291b]"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-[#121e14]">
                                        Asal Wilayah Dusun <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={formData.dusun}
                                        onChange={(e) => setFormData({ ...formData, dusun: Number(e.target.value) })}
                                        className="w-full px-4 py-2.5 bg-[#f4f3ea] border border-[#e2e0d4] rounded-xl text-xs font-bold text-[#121e14] focus:outline-none focus:ring-2 focus:ring-[#15291b]"
                                    >
                                        {[1, 2, 3, 4].map((d) => (
                                            <option key={d} value={d}>
                                                Dusun {DUSUN_NAMES[d]}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-[#121e14]">
                                        Kategori Pengaduan <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={formData.kategori}
                                        onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-[#f4f3ea] border border-[#e2e0d4] rounded-xl text-xs font-bold text-[#121e14] focus:outline-none focus:ring-2 focus:ring-[#15291b]"
                                    >
                                        {categories.map((c) => (
                                            <option key={c} value={c}>
                                                {c}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[#121e14]">
                                    Isi Pengaduan / Keluhan <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    required
                                    rows={3}
                                    value={formData.pesan}
                                    onChange={(e) => setFormData({ ...formData, pesan: e.target.value })}
                                    placeholder="Jelaskan kendala, lokasi, atau nama tengkulak yang dilaporkan..."
                                    className="w-full px-4 py-2.5 bg-[#f4f3ea] border border-[#e2e0d4] rounded-xl text-xs font-bold text-[#121e14] focus:outline-none focus:ring-2 focus:ring-[#15291b] resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn-neon w-full py-3 text-xs font-bold justify-center rounded-xl cursor-pointer text-[#0f1a10]"
                            >
                                <Send className="w-4 h-4 stroke-[2.5]" />
                                <span>Kirim Pengaduan via WhatsApp Desa</span>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}
