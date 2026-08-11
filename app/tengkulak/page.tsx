"use client";

import React, { useState, useEffect } from "react";
import { TengkulakRecord } from "../lib/data";
import {
    LogOut,
    User as UserIcon,
    ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "../components/Navbar";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

export default function TengkulakPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [records, setRecords] = useState<TengkulakRecord[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/admin");
        }
    }, [status, router]);

    useEffect(() => {
        if (!session?.user) return;
        async function fetchRecords() {
            try {
                const res = await fetch("/api/records");
                if (res.ok) {
                    const data = await res.json();
                    setRecords(data);
                } else {
                    setError("Gagal memuat data detail.");
                }
            } catch (err) {
                console.error("Failed to fetch records:", err);
                setError("Terjadi kesalahan koneksi.");
            } finally {
                setLoading(false);
            }
        }
        fetchRecords();
    }, [session?.user]);

    if (status === "loading" || loading) {
        return (
            <div className="min-h-screen bg-[#f4f3ea] text-[#121e14] flex flex-col justify-center items-center font-bold text-xs animate-pulse">
                Memuat Halaman Tengkulak...
            </div>
        );
    }

    if (!session?.user || session.user.role !== "tengkulak") {
        return (
            <div className="min-h-screen bg-[#f4f3ea] text-[#121e14] flex flex-col justify-center items-center font-bold text-xs">
                Akses Ditolak. Halaman ini hanya untuk mitra Tengkulak.
            </div>
        );
    }

    const activeUser = {
        name: session.user.name || "Pengguna",
        role: session.user.role,
        assignedDusun: session.user.assignedDusun,
    };

    const myRecords = records
        .filter((r) => r.nama.toLowerCase() === activeUser.name.toLowerCase())
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const totalPanenKu = myRecords.reduce((acc, r) => acc + (r.totalPanen || 0), 0);

    // Chart Data for Tengkulak
    const tengkulakChartData = ["Q1", "Q2", "Q3", "Q4"].map((k) => {
        const kRecs = myRecords.filter((r) => r.kuartal === k);
        const totalP = kRecs.reduce((acc, r) => acc + (r.totalPanen || 0), 0);
        const avgBeras = kRecs.length > 0 ? kRecs.reduce((acc, r) => acc + r.hargaBeras, 0) / kRecs.length : 0;
        return {
            kuartal: k.replace("Q", "Periode "),
            "Total Panen (Kg)": totalP,
            "Harga Beras": Math.round(avgBeras),
        };
    });

    const handleLogout = async () => {
        await signOut({ callbackUrl: "/admin" });
    };

    return (
        <div className="min-h-screen bg-[#f4f3ea] text-[#121e14] flex flex-col selection:bg-[#d6f837] selection:text-[#121e14]">
            <Navbar />
            <main className="flex-1 w-full max-w-7xl mx-auto p-6 md:p-10 space-y-8 animate-in fade-in duration-500">
                <div className="flex justify-between items-center bg-white p-6 rounded-[1.75rem] border border-[#e2e0d4] shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#15291b] text-[#d6f837] rounded-2xl flex items-center justify-center font-bold">
                            <UserIcon className="w-6 h-6 stroke-[2.2]" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-extrabold text-[#121e14]">
                                Halo, {activeUser.name}
                            </h1>
                            <p className="text-[#121e14]/70 text-xs font-semibold mt-0.5">
                                Dusun {activeUser.assignedDusun} • Tengkulak 
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold bg-[#f4f3ea] border border-[#e2e0d4] rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all text-[#121e14]"
                    >
                        <LogOut className="w-4 h-4 stroke-[2.2]" /> Keluar
                    </button>
                </div>

                {/* Stats cards for Tengkulak */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-[#15291b] p-6 rounded-[1.75rem] text-white shadow-lg md:col-span-1 border border-white/10 relative overflow-hidden flex flex-col justify-between">
                        <div>
                            <span className="badge-pill-dark text-[10px] mb-3">
                                <span className="badge-bullet"></span> AKUMULASI PANEN
                            </span>
                            <h3 className="text-4xl font-extrabold text-[#d6f837] mt-2">
                                {(totalPanenKu / 1000).toLocaleString("id-ID", {
                                    maximumFractionDigits: 1,
                                })}{" "}
                                <span className="text-lg text-white/80">Ton</span>
                            </h3>
                            <p className="text-xs text-white/60 mt-1">
                                Total: {totalPanenKu.toLocaleString("id-ID")} Kg
                            </p>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-[1.75rem] border border-[#e2e0d4] shadow-sm md:col-span-2 flex flex-col justify-between">
                        <div>
                            <h3 className="font-bold text-lg text-[#121e14] mb-1">
                                Ringkasan Setoran & Kemitraan
                            </h3>
                            <p className="text-xs text-[#121e14]/70 leading-relaxed">
                                Anda tercatat memiliki <strong>{myRecords.length} transaksi setoran</strong> di Dusun {activeUser.assignedDusun}. Jika ada ketidaksesuaian data, hubungi Admin Dusun setempat.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#e2e0d4]">
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#121e14]/50">Total Setoran</span>
                                <p className="text-base font-extrabold text-[#15291b]">{myRecords.length} Kali</p>
                            </div>
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#121e14]/50">Dusun Mitra</span>
                                <p className="text-base font-extrabold text-[#15291b]">Dusun {activeUser.assignedDusun}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Grafik Track Record Tengkulak */}
                <div className="bg-white p-6 sm:p-8 rounded-[1.75rem] border border-[#e2e0d4] shadow-sm">
                    <div className="mb-6">
                        <span className="badge-pill-light mb-2">
                            <span className="badge-bullet-dark"></span>
                            TRACK RECORD PANEN
                        </span>
                        <h3 className="text-xl font-bold text-[#121e14]">
                            Grafik Setoran Hasil Panen Anda per Periode
                        </h3>
                        <p className="text-xs text-[#121e14]/60 mt-1">
                            Visualisasi akumulasi panen (Kg) yang telah disetorkan.
                        </p>
                    </div>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={tengkulakChartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e0d4" />
                                <XAxis dataKey="kuartal" tick={{ fill: "#121e14", fontSize: 11, fontWeight: 700 }} />
                                <YAxis tickFormatter={(val) => `${val / 1000} Ton`} tick={{ fill: "#121e14", fontSize: 11 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: "14px", border: "1px solid #e2e0d4" }}
                                    formatter={(val: unknown) => [`${Number(val).toLocaleString("id-ID")} Kg`, "Total Panen"]}
                                />
                                <Bar dataKey="Total Panen (Kg)" fill="#15291b" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Table for Tengkulak */}
                <div className="bg-white rounded-[1.75rem] border border-[#e2e0d4] shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-[#e2e0d4] bg-[#f4f3ea]">
                        <h3 className="font-bold text-base text-[#121e14]">
                            Detail Riwayat Input Data Anda (Terbaru)
                        </h3>
                    </div>
                    {myRecords.length === 0 ? (
                        <div className="p-12 text-center text-[#121e14]/50 text-sm">
                            Belum ada riwayat data yang tercatat atas nama Anda.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left whitespace-nowrap">
                                <thead>
                                    <tr className="text-[11px] uppercase tracking-wider text-[#121e14]/60 bg-[#f4f3ea]">
                                        <th className="px-6 py-4 font-bold">Tanggal</th>
                                        <th className="px-6 py-4 font-bold">Periode</th>
                                        <th className="px-6 py-4 font-bold">Harga Beras</th>
                                        <th className="px-6 py-4 font-bold">Harga Gabah</th>
                                        <th className="px-6 py-4 font-bold">Total Panen (Kg)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#e2e0d4]">
                                    {myRecords.map((r) => (
                                        <tr
                                            key={r.id}
                                            className="hover:bg-[#f4f3ea]/60 transition-colors text-xs font-semibold"
                                        >
                                            <td className="px-6 py-4 text-[#121e14]">
                                                {new Date(r.timestamp).toLocaleDateString("id-ID")}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="bg-[#15291b] text-[#d6f837] px-2.5 py-1 rounded-md text-[10px] font-bold">
                                                    {r.kuartal ? r.kuartal.replace('Q', 'Periode ') : ''}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-[#121e14]">
                                                Rp {r.hargaBeras.toLocaleString("id-ID")}
                                            </td>
                                            <td className="px-6 py-4 text-[#121e14]">
                                                Rp {r.hargaGabah.toLocaleString("id-ID")}
                                            </td>
                                            <td className="px-6 py-4 font-bold text-[#15291b]">
                                                {(r.totalPanen || 0).toLocaleString("id-ID")} Kg
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
