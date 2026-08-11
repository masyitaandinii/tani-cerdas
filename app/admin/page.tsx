"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    CircleDollarSign,
    Tractor,
    BarChart3,
    Calendar,
    Users,
    ChevronRight,
    LogIn,
    LogOut,
} from "lucide-react";
import { TengkulakRecord } from "../lib/data";
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { useSession, signIn, signOut } from "next-auth/react";
import { Navbar } from "../components/Navbar";

function AdminDetailContent() {
    const { data: session, status } = useSession();
    const searchParams = useSearchParams();

    // Login Form State
    const [loginUsername, setLoginUsername] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [loginError, setLoginError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Detail Page State
    const userRole = session?.user?.role;
    const userDusun = session?.user?.assignedDusun;
    const isSuperadmin = userRole === "superadmin";
    const initialDusun = isSuperadmin
        ? (Number(searchParams.get("dusun")) || 1)
        : (userDusun || 1);
    const [selectedDusun, setSelectedDusun] = useState<number>(
        initialDusun >= 1 && initialDusun <= 4 ? initialDusun : 1
    );
    const [selectedKuartal, setSelectedKuartal] = useState<string>("ALL");
    const [records, setRecords] = useState<TengkulakRecord[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();

    useEffect(() => {
        if (session?.user?.role === "tengkulak") {
            router.replace("/tengkulak");
        }
    }, [session, router]);

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

    if (session?.user?.role === "tengkulak") {
        return (
            <div className="min-h-screen bg-[#f4f3ea] text-[#121e14] flex flex-col justify-center items-center font-bold text-xs animate-pulse">
                Mengalihkan ke halaman Tengkulak...
            </div>
        );
    }

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError("");
        setIsSubmitting(true);

        try {
            const result = await signIn("credentials", {
                username: loginUsername,
                password: loginPassword,
                redirect: false,
            });

            if (result?.error) {
                setLoginError(result.error);
            }
        } catch (err) {
            console.error("Login failed:", err);
            setLoginError("Terjadi kesalahan koneksi saat login.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (status === "loading") {
        return (
            <div className="min-h-screen bg-[#f4f3ea] text-[#121e14] flex flex-col justify-center items-center font-bold text-xs animate-pulse">
                Memeriksa Sesi Login...
            </div>
        );
    }

    // Unauthenticated View: Render Login Form with Clean Simple Header (Logo + Kembali Button)
    if (!session?.user) {
        return (
            <div className="min-h-screen bg-[#f4f3ea] text-[#121e14] flex flex-col selection:bg-[#d6f837] selection:text-[#121e14]">
                {/* Header Login Page Sederhana: Hanya Logo & Tombol Kembali */}
                <header className="sticky top-4 z-50 px-4 sm:px-6 pointer-events-none">
                    <div className="max-w-7xl mx-auto floating-navbar px-5 h-16 sm:h-18 flex items-center justify-between pointer-events-auto">
                        {/* Brand Logo & Name */}
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
                            </span>
                        </Link>

                        {/* Tombol Kembali ke Beranda */}
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-[#d6f837] hover:text-[#121e14] text-white text-xs font-bold uppercase tracking-wider transition-all"
                        >
                            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
                            <span>Kembali ke Beranda</span>
                        </Link>
                    </div>
                </header>

                {/* Content Area Login Form */}
                <main className="flex-1 flex items-center justify-center p-6 animate-in fade-in duration-500">
                    <div className="w-full max-w-md space-y-6">
                        <div className="text-center space-y-2">
                            <Image
                                src="/Logo (3).svg"
                                alt="TaniCerdas Logo"
                                width={56}
                                height={56}
                                className="h-14 w-auto mx-auto mb-4 object-contain"
                            />
                            <h1 className="text-3xl font-extrabold text-[#121e14] tracking-tight">
                                Portal Pengelola TaniCerdas
                            </h1>
                            <p className="text-[#121e14]/60 text-xs font-medium max-w-xs mx-auto">
                                Masuk untuk mengakses rincian data grafik & statistik panen dusun Anda.
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-[#e2e0d4]">
                            <form onSubmit={handleLoginSubmit} className="space-y-5">
                                {loginError && (
                                    <div className="bg-red-50 text-red-600 text-xs font-bold p-3.5 rounded-xl border border-red-200 text-center">
                                        {loginError}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-[#121e14] mb-2">
                                        Username
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={loginUsername}
                                        onChange={(e) => setLoginUsername(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-[#e2e0d4] bg-[#f4f3ea] text-xs font-bold text-[#121e14] focus:outline-none focus:ring-2 focus:ring-[#15291b]"
                                        placeholder="Masukkan username"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-[#121e14] mb-2">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        required
                                        value={loginPassword}
                                        onChange={(e) => setLoginPassword(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-[#e2e0d4] bg-[#f4f3ea] text-xs font-bold text-[#121e14] focus:outline-none focus:ring-2 focus:ring-[#15291b]"
                                        placeholder="••••••••"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="btn-forest w-full py-3.5 text-xs font-bold uppercase tracking-wider justify-center disabled:opacity-50"
                                >
                                    <LogIn className="w-4 h-4 stroke-[2.5]" />
                                    <span>{isSubmitting ? "Memproses..." : "Masuk ke Portal"}</span>
                                </button>
                            </form>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    // Authenticated View: Render Halaman Detail Grafik & Tabel Statistik Dusun (Tampilan awal setelah login)
    const dusunRecords = records
        .filter((r) => {
            const matchesDusun = r.dusun === selectedDusun;
            const matchesKuartal =
                selectedKuartal === "ALL" || r.kuartal === selectedKuartal;
            return matchesDusun && matchesKuartal;
        })
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Statistics for the selected Dusun
    const stats = (() => {
        if (dusunRecords.length === 0) {
            return { avgBeras: 0, avgGabah: 0, totalPanen: 0, count: 0 };
        }
        const totalBeras = dusunRecords.reduce((acc, r) => acc + r.hargaBeras, 0);
        const totalGabah = dusunRecords.reduce((acc, r) => acc + r.hargaGabah, 0);
        const totalPanen = dusunRecords.reduce((acc, r) => acc + (r.totalPanen || 0), 0);

        return {
            avgBeras: Math.round(totalBeras / dusunRecords.length),
            avgGabah: Math.round(totalGabah / dusunRecords.length),
            totalPanen,
            count: dusunRecords.length,
        };
    })();

    // Kuartal trend chart data for selected Dusun
    const kuartalTrendData = (() => {
        const kuartals = ["Q1", "Q2", "Q3", "Q4"];
        const labels: Record<string, string> = {
            Q1: "Periode 1 (Jan-Mar)",
            Q2: "Periode 2 (Apr-Jun)",
            Q3: "Periode 3 (Jul-Sep)",
            Q4: "Periode 4 (Okt-Des)",
        };

        return kuartals.map((k) => {
            const kRecords = records.filter(
                (r) => r.dusun === selectedDusun && r.kuartal === k
            );
            const count = kRecords.length;
            const avgB = count > 0 ? kRecords.reduce((acc, r) => acc + r.hargaBeras, 0) / count : 0;
            const avgG = count > 0 ? kRecords.reduce((acc, r) => acc + r.hargaGabah, 0) / count : 0;
            const totalP = kRecords.reduce((acc, r) => acc + (r.totalPanen || 0), 0);

            return {
                kuartal: labels[k],
                "Harga Beras": Math.round(avgB),
                "Harga Gabah": Math.round(avgG),
                "Total Panen (Kg)": totalP,
            };
        });
    })();

    return (
        <div className="min-h-screen bg-[#f4f3ea] text-[#121e14] flex flex-col selection:bg-[#d6f837] selection:text-[#121e14]">
            {/* Header Navigation Bar with Role Badge */}
            <Navbar />

            {/* Main Content */}
            <main className="flex-1 w-full max-w-7xl mx-auto p-6 md:p-10 space-y-8 animate-in fade-in duration-500">
                
                {/* Hero section inside page */}
                <div className="bg-[#15291b] p-8 rounded-[2rem] text-white shadow-xl border border-white/10 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="relative z-10 space-y-2">
                        <div className="flex items-center gap-2 text-xs font-semibold text-[#d6f837]">
                            <Link href="/" className="hover:underline">Beranda</Link>
                            <ChevronRight className="w-3.5 h-3.5" />
                            <span>Detail Dusun {selectedDusun}</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                            Laporan Detail Data Panen Dusun {selectedDusun}
                        </h1>
                        <p className="text-white/70 text-sm max-w-xl">
                            Informasi perbandingan harga beras, harga gabah, dan akumulasi hasil panen secara mendalam untuk Dusun {selectedDusun}.
                        </p>
                    </div>

                    <div className="relative z-10 flex flex-col items-end gap-3">
                        {/* Dusun Selector Buttons - only for superadmin */}
                        {isSuperadmin ? (
                            <div className="flex flex-wrap items-center gap-2 bg-white/10 p-2 rounded-2xl border border-white/15">
                                {[1, 2, 3, 4].map((d) => (
                                    <button
                                        key={d}
                                        onClick={() => setSelectedDusun(d)}
                                        className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                                            selectedDusun === d
                                                ? "bg-[#d6f837] text-[#121e14] shadow-md scale-105"
                                                : "text-white/80 hover:bg-white/10 hover:text-white"
                                        }`}
                                    >
                                        Dusun {d}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white/10 px-4 py-2 rounded-2xl border border-white/15 text-xs font-bold text-[#d6f837]">
                                Dusun {selectedDusun}
                            </div>
                        )}

                       
                    </div>
                </div>

                {/* Filter and Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-[1.75rem] border border-[#e2e0d4] shadow-sm flex flex-col justify-between">
                        <div>
                            <div className="w-10 h-10 bg-[#15291b]/10 rounded-xl flex items-center justify-center text-[#15291b] mb-4">
                                <CircleDollarSign className="w-5 h-5 stroke-[2.2]" />
                            </div>
                            <p className="text-xs font-bold uppercase tracking-wider text-[#121e14]/60 mb-1">
                                Rata-rata Harga Beras
                            </p>
                            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#121e14]">
                                Rp {stats.avgBeras.toLocaleString("id-ID")}{" "}
                                <span className="text-xs font-semibold text-[#121e14]/50">/kg</span>
                            </h3>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-[1.75rem] border border-[#e2e0d4] shadow-sm flex flex-col justify-between">
                        <div>
                            <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-700 mb-4">
                                <Tractor className="w-5 h-5 stroke-[2.2]" />
                            </div>
                            <p className="text-xs font-bold uppercase tracking-wider text-[#121e14]/60 mb-1">
                                Rata-rata Harga Gabah
                            </p>
                            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#121e14]">
                                Rp {stats.avgGabah.toLocaleString("id-ID")}{" "}
                                <span className="text-xs font-semibold text-[#121e14]/50">/kg</span>
                            </h3>
                        </div>
                    </div>

                    <div className="bg-[#15291b] p-6 rounded-[1.75rem] text-white shadow-md border border-white/10 flex flex-col justify-between md:col-span-2">
                        <div>
                            <span className="badge-pill-dark text-[10px] mb-3">
                                <span className="badge-bullet"></span> TOTAL PANEN DUSUN {selectedDusun}
                            </span>
                            <h3 className="text-3xl sm:text-4xl font-extrabold text-[#d6f837] mt-2">
                                {(stats.totalPanen / 1000).toLocaleString("id-ID", {
                                    maximumFractionDigits: 1,
                                })}{" "}
                                <span className="text-lg text-white/80">Ton</span>
                                <span className="text-xs font-semibold text-white/60 ml-2">
                                    ({stats.totalPanen.toLocaleString("id-ID")} Kg)
                                </span>
                            </h3>
                            <p className="text-white/70 text-xs mt-2">
                                Berdasarkan {stats.count} catatan input panen di Dusun {selectedDusun}.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Filter Kuartal Bar */}
                <div className="bg-white p-4 rounded-2xl border border-[#e2e0d4] shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#121e14]/80">
                        <Calendar className="w-4 h-4 text-[#15291b]" />
                        <span>Filter Periode Kuartal Dusun {selectedDusun}:</span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        {[
                            { key: "ALL", label: "Semua Periode" },
                            { key: "Q1", label: "Periode 1 (Jan-Mar)" },
                            { key: "Q2", label: "Periode 2 (Apr-Jun)" },
                            { key: "Q3", label: "Periode 3 (Jul-Sep)" },
                            { key: "Q4", label: "Periode 4 (Okt-Des)" },
                        ].map((q) => (
                            <button
                                key={q.key}
                                onClick={() => setSelectedKuartal(q.key)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                    selectedKuartal === q.key
                                        ? "bg-[#15291b] text-[#d6f837]"
                                        : "bg-[#f4f3ea] text-[#121e14]/70 hover:bg-[#e2e0d4]"
                                }`}
                            >
                                {q.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Price movement chart */}
                    <div className="bg-white p-6 sm:p-8 rounded-[1.75rem] border border-[#e2e0d4] shadow-sm flex flex-col justify-between">
                        <div className="mb-6">
                            <span className="badge-pill-light mb-2">
                                <span className="badge-bullet-dark"></span>
                                PERBANDINGAN HARGA PER PERIODE
                            </span>
                            <h3 className="text-xl font-bold text-[#121e14]">
                                Pergerakan Harga Beras & Gabah
                            </h3>
                            <p className="text-xs text-[#121e14]/60 mt-1">
                                Perbandingan rata-rata harga di Dusun {selectedDusun} tiap periode.
                            </p>
                        </div>
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={kuartalTrendData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e0d4" />
                                    <XAxis
                                        dataKey="kuartal"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: "#121e14", fontSize: 10, fontWeight: 700 }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tickFormatter={(val) => `Rp ${val / 1000}k`}
                                        tick={{ fill: "#121e14", fontSize: 11 }}
                                    />
                                    <Tooltip
                                        cursor={{ fill: "#15291b", opacity: 0.05 }}
                                        contentStyle={{
                                            borderRadius: "14px",
                                            border: "1px solid #e2e0d4",
                                            boxShadow: "0 4px 15px rgba(0,0,0,0.06)",
                                        }}
                                        formatter={(val: unknown) => [
                                            `Rp ${Number(val).toLocaleString("id-ID")}`,
                                            "",
                                        ]}
                                    />
                                    <Legend wrapperStyle={{ paddingTop: "15px", fontSize: "12px", fontWeight: "bold" }} />
                                    <Line
                                        type="monotone"
                                        dataKey="Harga Beras"
                                        stroke="#15291b"
                                        strokeWidth={3}
                                        dot={{ fill: "#15291b", r: 4 }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="Harga Gabah"
                                        stroke="#ca8a04"
                                        strokeWidth={3}
                                        dot={{ fill: "#ca8a04", r: 4 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Harvest quantity chart */}
                    <div className="bg-white p-6 sm:p-8 rounded-[1.75rem] border border-[#e2e0d4] shadow-sm flex flex-col justify-between">
                        <div className="mb-6">
                            <span className="badge-pill-light mb-2">
                                <span className="badge-bullet-dark"></span>
                                AKUMULASI PANEN
                            </span>
                            <h3 className="text-xl font-bold text-[#121e14]">
                                Total Hasil Panen per Periode (Kg)
                            </h3>
                            <p className="text-xs text-[#121e14]/60 mt-1">
                                Volume produksi panen Dusun {selectedDusun} tiap periode.
                            </p>
                        </div>
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={kuartalTrendData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e0d4" />
                                    <XAxis
                                        dataKey="kuartal"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: "#121e14", fontSize: 10, fontWeight: 700 }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tickFormatter={(val) => `${val / 1000} Ton`}
                                        tick={{ fill: "#121e14", fontSize: 11 }}
                                    />
                                    <Tooltip
                                        cursor={{ fill: "#15291b", opacity: 0.05 }}
                                        contentStyle={{
                                            borderRadius: "14px",
                                            border: "1px solid #e2e0d4",
                                            boxShadow: "0 4px 15px rgba(0,0,0,0.06)",
                                        }}
                                        formatter={(val: unknown) => [
                                            `${Number(val).toLocaleString("id-ID")} Kg`,
                                            "Total Panen",
                                        ]}
                                    />
                                    <Bar dataKey="Total Panen (Kg)" fill="#15291b" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Detailed Table Section */}
                <div className="bg-white rounded-[1.75rem] border border-[#e2e0d4] shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-[#e2e0d4] flex justify-between items-center bg-[#f4f3ea]">
                        <div>
                            <h3 className="font-bold text-base text-[#121e14]">
                                Rincian Tabel Input Data - Dusun {selectedDusun} (Terbaru)
                            </h3>
                            <p className="text-xs text-[#121e14]/60">
                                Seluruh riwayat transaksi setoran panen di Dusun {selectedDusun} (paling baru di atas).
                            </p>
                        </div>
                        <div className="bg-[#15291b] text-[#d6f837] px-4 py-1 rounded-full text-xs font-bold">
                            {dusunRecords.length} Data
                        </div>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center text-[#121e14]/50 animate-pulse">
                            Memuat data tabel...
                        </div>
                    ) : error ? (
                        <div className="p-12 text-center text-red-500 font-semibold">{error}</div>
                    ) : dusunRecords.length === 0 ? (
                        <div className="p-12 text-center text-[#121e14]/50 text-sm">
                            Tidak ada data untuk Dusun {selectedDusun} pada filter ini.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left whitespace-nowrap">
                                <thead>
                                    <tr className="text-[11px] uppercase tracking-wider text-[#121e14]/60 bg-[#f4f3ea]">
                                        <th className="px-6 py-4 font-bold">Tanggal</th>
                                        <th className="px-6 py-4 font-bold">Nama Tengkulak</th>
                                        <th className="px-6 py-4 font-bold">Periode</th>
                                        <th className="px-6 py-4 font-bold">Harga Beras</th>
                                        <th className="px-6 py-4 font-bold">Harga Gabah</th>
                                        <th className="px-6 py-4 font-bold">Total Panen (Kg)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#e2e0d4]">
                                    {dusunRecords.map((r) => (
                                        <tr
                                            key={r.id}
                                            className="hover:bg-[#f4f3ea]/60 transition-colors text-xs font-semibold"
                                        >
                                            <td className="px-6 py-4 text-[#121e14]">
                                                {new Date(r.timestamp).toLocaleDateString("id-ID")}
                                            </td>
                                            <td className="px-6 py-4 font-bold text-[#121e14]">
                                                {r.nama}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="bg-[#15291b] text-[#d6f837] px-2.5 py-1 rounded-md text-[10px] font-bold">
                                                    {r.kuartal ? r.kuartal.replace("Q", "Periode ") : ""}
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

export default function AdminPage() {
    return (
        <Suspense fallback={
            <div className="flex justify-center items-center min-h-screen bg-[#f4f3ea] text-[#121e14] font-bold animate-pulse text-xs">
                Memuat Portal Admin...
            </div>
        }>
            <AdminDetailContent />
        </Suspense>
    );
}
