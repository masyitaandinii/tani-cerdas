"use client";

import React, { useState, useEffect } from "react";
import { TengkulakRecord, Kuartal } from "../lib/data";
import { PlusCircle, LogOut, User as UserIcon } from "lucide-react";
import { useSession, signOut, signIn } from "next-auth/react";
import Image from "next/image";

export default function PengelolaPage() {
    const { data: session, status } = useSession();

    // Petakan session NextAuth ke format activeUser agar komponen di bawahnya tidak rusak
    const activeUser = session?.user ? {
        name: session.user.name || "Pengguna",
        role: session.user.role,
        assignedDusun: session.user.assignedDusun
    } : null;

    // Login Form State
    const [loginUsername, setLoginUsername] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [loginError, setLoginError] = useState("");

    const [formData, setFormData] = useState({
        nama: "",
        dusun: 1,
        hargaBeras: "",
        hargaGabah: "",
        kuartal: "Q1" as Kuartal,
        totalPanen: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [records, setRecords] = useState<TengkulakRecord[]>([]);

    const fetchRecords = async () => {
        try {
            const res = await fetch("/api/records");
            if (res.ok) {
                const data = await res.json();
                setRecords(data);
            }
        } catch (error) {
            console.error("Failed to fetch records:", error);
        }
    };

    useEffect(() => {
        if (session?.user) {
            // eslint-disable-next-line
            fetchRecords();
        }
    }, [session?.user]);

    const handleLogout = () => {
        signOut({ callbackUrl: '/admin' });
    };

    const handleAdminSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeUser || (activeUser.role !== "admin" && activeUser.role !== "superadmin")) return;

        const b = Number(formData.hargaBeras);
        const g = Number(formData.hargaGabah);
        const p = Number(formData.totalPanen);

        if (b <= 0 || g <= 0 || p <= 0) {
            alert("Harga beras, harga gabah, dan total panen harus berupa angka lebih dari 0.");
            return;
        }
        
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/records", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nama: formData.nama,
                    dusun: activeUser.role === "superadmin" ? Number(formData.dusun) : (activeUser.assignedDusun || 1),
                    hargaBeras: Number(formData.hargaBeras),
                    hargaGabah: Number(formData.hargaGabah),
                    kuartal: formData.kuartal,
                    totalPanen: Number(formData.totalPanen),
                }),
            });

            if (res.ok) {
                setFormData({ nama: "", dusun: 1, hargaBeras: "", hargaGabah: "", kuartal: "Q1", totalPanen: "" });
                await fetchRecords();
            } else {
                const err = await res.json();
                alert(`Gagal menyimpan data: ${err.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error("Failed to submit record:", error);
            alert("Terjadi kesalahan koneksi saat menyimpan data.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (status === "loading") {
        return <div className="flex justify-center items-center min-h-[75vh] animate-pulse">Memuat Sesi Aman...</div>;
    }

    if (!activeUser) {
        const handleLoginSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            setLoginError("");
            const result = await signIn("credentials", {
                username: loginUsername,
                password: loginPassword,
                redirect: false
            });
            if (result?.error) {
                setLoginError(result.error);
            }
        };

        return (
            <div className="flex flex-col items-center justify-center min-h-[75vh] px-4 animate-in fade-in duration-500">
                <div className="text-center mb-8">
                    <Image src="/Logo (3).svg" alt="TaniCerdas Logo" width={56} height={56} className="h-14 w-auto mx-auto mb-4 object-contain" />
                    <h2 className="text-3xl font-extrabold text-[#121e14]">Portal Pengelola TaniCerdas</h2>
                    <p className="text-[#121e14]/60 mt-2 max-w-sm mx-auto text-sm font-medium">Masuk untuk mengelola data panen atau memantau setoran Anda.</p>
                </div>
                
                <div className="bg-white p-8 rounded-[1.75rem] shadow-md border border-[#e2e0d4] w-full max-w-md">
                    <form onSubmit={handleLoginSubmit} className="space-y-6">
                        {loginError && (
                            <div className="bg-red-50 text-red-600 text-xs font-bold p-3.5 rounded-xl border border-red-200 text-center">
                                {loginError}
                            </div>
                        )}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-[#121e14] mb-2">Username</label>
                            <input
                                type="text"
                                required
                                value={loginUsername}
                                onChange={(e) => setLoginUsername(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-[#e2e0d4] bg-[#f4f3ea] text-[#121e14] font-semibold focus:outline-none focus:ring-2 focus:ring-[#15291b]"
                                placeholder="Masukkan username"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-[#121e14] mb-2">Password</label>
                            <input
                                type="password"
                                required
                                value={loginPassword}
                                onChange={(e) => setLoginPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-[#e2e0d4] bg-[#f4f3ea] text-[#121e14] font-semibold focus:outline-none focus:ring-2 focus:ring-[#15291b]"
                                placeholder="••••••••"
                            />
                        </div>
                        <button type="submit" className="btn-forest w-full py-3.5 text-xs font-bold uppercase tracking-wider justify-center">
                            <span>Masuk ke Portal</span>
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // TENGKULAK DASHBOARD
    if (activeUser.role === "admin") {
        const myRecords = records.filter(r => r.nama.toLowerCase() === activeUser.name.toLowerCase());
        const totalPanenKu = myRecords.reduce((acc, r) => acc + (r.totalPanen || 0), 0);

        return (
            <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
                <div className="flex justify-between items-center bg-white p-6 rounded-[1.75rem] border border-[#e2e0d4] shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#15291b] text-[#d6f837] rounded-2xl flex items-center justify-center font-bold">
                            <UserIcon className="w-6 h-6 stroke-[2.2]" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-extrabold text-[#121e14]">Halo, {activeUser.name}</h1>
                            <p className="text-[#121e14]/70 text-xs font-semibold mt-0.5">Dusun {activeUser.assignedDusun} • Tengkulak Partner</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold bg-[#f4f3ea] border border-[#e2e0d4] rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all text-[#121e14]"
                    >
                        <LogOut className="w-4 h-4 stroke-[2.2]" /> Keluar
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-[#15291b] p-6 rounded-[1.75rem] text-white shadow-lg md:col-span-1 border border-white/10 relative overflow-hidden">
                        <span className="badge-pill-dark text-[10px] mb-3">
                            <span className="badge-bullet"></span> AKUMULASI PANEN
                        </span>
                        <h3 className="text-4xl font-extrabold text-[#d6f837] mt-2">
                            {(totalPanenKu / 1000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} <span className="text-lg text-white/80">Ton</span>
                        </h3>
                    </div>
                    <div className="bg-white p-6 rounded-[1.75rem] border border-[#e2e0d4] shadow-sm md:col-span-2 flex flex-col justify-center">
                        <h3 className="font-bold text-lg text-[#121e14] mb-1">Riwayat Setoran Anda</h3>
                        <p className="text-xs text-[#121e14]/70 leading-relaxed">
                            Semua data riwayat panen dan harga yang Anda berikan dikelola oleh Admin Dusun. Jika terdapat kesalahan data, harap hubungi Admin Dusun {activeUser.assignedDusun}.
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-[1.75rem] border border-[#e2e0d4] shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-[#e2e0d4] bg-[#f4f3ea]">
                        <h3 className="font-bold text-base text-[#121e14]">Detail Riwayat Input Data</h3>
                    </div>
                    {myRecords.length === 0 ? (
                        <div className="p-12 text-center text-[#121e14]/50 text-sm">Belum ada riwayat data yang tercatat atas nama Anda.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left whitespace-nowrap">
                                <thead>
                                    <tr className="text-[11px] uppercase tracking-wider text-[#121e14]/60 bg-[#f4f3ea]">
                                        <th className="px-6 py-4 font-bold">Tanggal</th>
                                        <th className="px-6 py-4 font-bold">Kuartal</th>
                                        <th className="px-6 py-4 font-bold">Harga Beras</th>
                                        <th className="px-6 py-4 font-bold">Harga Gabah</th>
                                        <th className="px-6 py-4 font-bold">Total Panen (Kg)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#e2e0d4]">
                                    {myRecords.map((r) => (
                                        <tr key={r.id} className="hover:bg-[#f4f3ea]/60 transition-colors text-xs font-semibold">
                                            <td className="px-6 py-4 text-[#121e14]">{new Date(r.timestamp).toLocaleDateString('id-ID')}</td>
                                            <td className="px-6 py-4">
                                                <span className="bg-[#15291b] text-[#d6f837] px-2.5 py-1 rounded-md text-[10px] font-bold">{r.kuartal}</span>
                                            </td>
                                            <td className="px-6 py-4 text-[#121e14]">Rp {r.hargaBeras.toLocaleString('id-ID')}</td>
                                            <td className="px-6 py-4 text-[#121e14]">Rp {r.hargaGabah.toLocaleString('id-ID')}</td>
                                            <td className="px-6 py-4 font-bold text-[#15291b]">{(r.totalPanen || 0).toLocaleString('id-ID')} Kg</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // ADMIN DASHBOARD
    // Note: For superadmin, they might see all records if they don't have assignedDusun, 
    // or we just show them everything if assignedDusun is not set.
    const activeRecords = activeUser.role === "superadmin" 
        ? records 
        : records.filter((r) => r.dusun === activeUser.assignedDusun);

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
            <div className="flex justify-between items-center bg-white p-6 rounded-[1.75rem] border border-[#e2e0d4] shadow-sm">
                <div>
                    <h1 className="text-2xl font-extrabold text-[#121e14]">Halo, {activeUser.name}</h1>
                    <p className="text-[#121e14]/70 text-xs font-semibold mt-0.5">Anda mengelola data untuk Dusun {activeUser.assignedDusun}.</p>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold bg-[#f4f3ea] border border-[#e2e0d4] rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all text-[#121e14]"
                >
                    <LogOut className="w-4 h-4 stroke-[2.2]" /> Keluar
                </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-1">
                    <div className="bg-white rounded-[1.75rem] border border-[#e2e0d4] shadow-sm overflow-hidden sticky top-24">
                        <div className="bg-[#15291b] p-5 border-b border-white/10 text-white">
                            <h3 className="font-bold flex items-center text-[#d6f837] text-base">
                                <PlusCircle className="w-5 h-5 mr-2 stroke-[2.5]" />
                                { "Tambah Data Tengkulak"}
                            </h3>
                            <p className="text-[11px] text-white/70 mt-1 ml-7">
                                Menambah data ini otomatis akan membuatkan/mengupdate akun akses login Tengkulak tersebut.
                            </p>
                        </div>
                        <form onSubmit={handleAdminSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-[#121e14] mb-1.5">Nama Tengkulak</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.nama}
                                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-[#e2e0d4] bg-[#f4f3ea] text-xs font-medium text-[#121e14] focus:outline-none focus:ring-2 focus:ring-[#15291b]"
                                    placeholder="Masukkan nama lengkap"
                                />
                            </div>

                            {activeUser.role === "superadmin" && (
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-[#121e14] mb-1.5">Dusun Target (Superadmin)</label>
                                    <select
                                        value={formData.dusun}
                                        onChange={(e) => setFormData({ ...formData, dusun: Number(e.target.value) })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-[#e2e0d4] bg-[#f4f3ea] text-xs font-medium text-[#121e14] focus:outline-none focus:ring-2 focus:ring-[#15291b]"
                                    >
                                        <option value={1}>Dusun 1</option>
                                        <option value={2}>Dusun 2</option>
                                        <option value={3}>Dusun 3</option>
                                        <option value={4}>Dusun 4</option>
                                    </select>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-[#121e14] mb-1.5">Harga Beras</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.hargaBeras}
                                        onChange={(e) => setFormData({ ...formData, hargaBeras: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-[#e2e0d4] bg-[#f4f3ea] text-xs font-medium text-[#121e14] focus:outline-none focus:ring-2 focus:ring-[#15291b]"
                                        placeholder="Rp / Kg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-[#121e14] mb-1.5">Harga Gabah</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.hargaGabah}
                                        onChange={(e) => setFormData({ ...formData, hargaGabah: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-[#e2e0d4] bg-[#f4f3ea] text-xs font-medium text-[#121e14] focus:outline-none focus:ring-2 focus:ring-[#15291b]"
                                        placeholder="Rp / Kg"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-[#121e14] mb-1.5">Kuartal</label>
                                    <select
                                        value={formData.kuartal}
                                        onChange={(e) => setFormData({ ...formData, kuartal: e.target.value as Kuartal })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-[#e2e0d4] bg-[#f4f3ea] text-xs font-medium text-[#121e14] focus:outline-none focus:ring-2 focus:ring-[#15291b]"
                                    >
                                        <option value="Q1">Q1</option>
                                        <option value="Q2">Q2</option>
                                        <option value="Q3">Q3</option>
                                        <option value="Q4">Q4</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-[#121e14] mb-1.5">Total Panen</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.totalPanen}
                                        onChange={(e) => setFormData({ ...formData, totalPanen: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-[#e2e0d4] bg-[#f4f3ea] text-xs font-medium text-[#121e14] focus:outline-none focus:ring-2 focus:ring-[#15291b]"
                                        placeholder="Kg"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="btn-forest flex-1 py-3 text-xs font-bold uppercase tracking-wider justify-center disabled:opacity-50"
                                >
                                    <span>{isSubmitting ? "Menyimpan..." : "Simpan Data"}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="xl:col-span-2">
                    <div className="bg-white rounded-[1.75rem] border border-[#e2e0d4] shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-[#e2e0d4] flex justify-between items-center bg-[#f4f3ea]">
                            <div>
                                <h3 className="font-bold text-base text-[#121e14]">Data Tengkulak Dusun {activeUser.assignedDusun}</h3>
                                <p className="text-xs text-[#121e14]/60">Daftar riwayat yang diinput oleh Dusun Anda.</p>
                            </div>
                            <div className="bg-[#15291b] text-[#d6f837] px-4 py-1 rounded-full text-xs font-bold">
                                {activeRecords.length} Data
                            </div>
                        </div>

                        {activeRecords.length === 0 ? (
                            <div className="p-12 text-center text-[#121e14]/50 text-sm">
                                <p>Belum ada data tengkulak di dusun ini.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left whitespace-nowrap">
                                    <thead>
                                        <tr className="text-[11px] uppercase tracking-wider text-[#121e14]/60 bg-[#f4f3ea]">
                                            <th className="px-6 py-4 font-bold">Nama & Waktu</th>
                                            <th className="px-6 py-4 font-bold">Kuartal</th>
                                            <th className="px-6 py-4 font-bold">Beras & Gabah / Kg</th>
                                            <th className="px-6 py-4 font-bold">Total Panen (Kg)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#e2e0d4]">
                                        {activeRecords.map((r) => (
                                            <tr key={r.id} className="hover:bg-[#f4f3ea]/60 transition-colors text-xs font-semibold">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-sm text-[#121e14]">{r.nama}</div>
                                                    <div className="text-[11px] text-[#121e14]/50 mt-0.5">{new Date(r.timestamp).toLocaleDateString('id-ID')}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="bg-[#15291b] text-[#d6f837] px-2.5 py-1 rounded-md text-[10px] font-bold">
                                                        {r.kuartal}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-xs text-[#121e14]">Beras: Rp {r.hargaBeras.toLocaleString('id-ID')}</div>
                                                    <div className="text-xs text-[#121e14]/70 mt-0.5">Gabah: Rp {r.hargaGabah.toLocaleString('id-ID')}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="font-bold text-[#15291b] text-xs">{(r.totalPanen || 0).toLocaleString('id-ID')} Kg</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
