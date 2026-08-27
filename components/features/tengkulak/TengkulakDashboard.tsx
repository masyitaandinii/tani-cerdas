"use client";

import React, { useState, useEffect } from 'react';
import { User, LogOut, PlusCircle, AlertCircle, UserPen, CircleDollarSign, Tractor } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { TengkulakRecord, SessionUser, Kuartal, PriceBenchmark } from '@/types';
import { DUSUN_NAMES, GOVERNMENT_PRICE_BENCHMARKS } from '@/app/lib/constants';
import { createRecord } from '@/services/recordService';
import { fetchBenchmarkPrices } from '@/services/benchmarkService';
import { EditProfileModal } from '../users/EditProfileModal';

interface TengkulakDashboardProps {
    activeUser: SessionUser;
    records: TengkulakRecord[];
    onLogout: () => void;
    onRefreshRecords: () => void;
    onShowSuccess: (title: string, message: string) => void;
}

export function TengkulakDashboard({
    activeUser,
    records,
    onLogout,
    onRefreshRecords,
    onShowSuccess,
}: TengkulakDashboardProps) {
    const [benchmarks, setBenchmarks] = useState<PriceBenchmark>({
        beras: GOVERNMENT_PRICE_BENCHMARKS.beras,
        gabah: GOVERNMENT_PRICE_BENCHMARKS.gabah,
    });
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
    const [currentUserName, setCurrentUserName] = useState(activeUser.name || 'Mitra Tengkulak');

    useEffect(() => {
        async function loadBm() {
            const data = await fetchBenchmarkPrices();
            setBenchmarks(data);
        }
        loadBm();
    }, []);

    const myRecords = records
        .filter((r) => r.nama.toLowerCase() === (currentUserName || '').toLowerCase())
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const totalTransaksi = myRecords.length;
    const avgBerasKu = totalTransaksi > 0 ? Math.round(myRecords.reduce((acc, r) => acc + r.hargaBeras, 0) / totalTransaksi) : 0;
    const avgGabahKu = totalTransaksi > 0 ? Math.round(myRecords.reduce((acc, r) => acc + r.hargaGabah, 0) / totalTransaksi) : 0;

    const chartData = ['Q1', 'Q2', 'Q3', 'Q4'].map((k) => {
        const kRecs = myRecords.filter((r) => r.kuartal === k);
        const count = kRecs.length;
        const avgB = count > 0 ? kRecs.reduce((acc, r) => acc + r.hargaBeras, 0) / count : 0;
        const avgG = count > 0 ? kRecs.reduce((acc, r) => acc + r.hargaGabah, 0) / count : 0;
        return {
            kuartal: k.replace('Q', 'Periode '),
            'Harga Beras': Math.round(avgB),
            'Harga Gabah': Math.round(avgG),
        };
    });

    const [tengkulakForm, setTengkulakForm] = useState({
        hargaBeras: '',
        hargaGabah: '',
        kuartal: 'Q1' as Kuartal,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const berasMin = benchmarks.beras?.min || GOVERNMENT_PRICE_BENCHMARKS.beras.min;
    const berasMax = benchmarks.beras?.max || GOVERNMENT_PRICE_BENCHMARKS.beras.max;
    const gabahMin = benchmarks.gabah?.min || GOVERNMENT_PRICE_BENCHMARKS.gabah.min;
    const gabahMax = benchmarks.gabah?.max || GOVERNMENT_PRICE_BENCHMARKS.gabah.max;

    const numBeras = Number(tengkulakForm.hargaBeras) || 0;
    const numGabah = Number(tengkulakForm.hargaGabah) || 0;

    const isBerasOver = numBeras > 0 && numBeras > berasMax;
    const isBerasUnder = numBeras > 0 && numBeras < berasMin;
    const isGabahOver = numGabah > 0 && numGabah > gabahMax;
    const isGabahUnder = numGabah > 0 && numGabah < gabahMin;

    const hasOver = isBerasOver || isGabahOver;
    const hasUnder = isBerasUnder || isGabahUnder;

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await createRecord({
                nama: currentUserName,
                dusun: activeUser.assignedDusun || 1,
                hargaBeras: Number(tengkulakForm.hargaBeras),
                hargaGabah: Number(tengkulakForm.hargaGabah),
                kuartal: tengkulakForm.kuartal,
                totalPanen: 0, // Total panen tidak diinput oleh tengkulak
            });

            if (res.success) {
                setTengkulakForm({
                    hargaBeras: '',
                    hargaGabah: '',
                    kuartal: 'Q1',
                });
                onRefreshRecords();
                onShowSuccess(
                    'Setoran Harga Berhasil Disimpan!',
                    res.warning
                        ? res.warning + ' Data tetap tersimpan ke sistem.'
                        : 'Data harga beras dan gabah Anda berhasil dicatat ke sistem desa.'
                );
            } else {
                alert('Gagal menyimpan: ' + (res.error || 'Terjadi kesalahan'));
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleProfileUpdated = (updatedUser: { name: string; whatsapp?: string }) => {
        setCurrentUserName(updatedUser.name);
        onShowSuccess('Profil Diperbarui!', 'Perubahan nama dan kontak Anda telah disimpan.');
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-[1.75rem] border border-[#e2e0d4] shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#15291b] text-[#d6f837] rounded-2xl flex items-center justify-center font-bold shadow-sm">
                        <User className="w-6 h-6 stroke-[2.2]" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold text-[#121e14]">
                            Halo, {currentUserName}
                        </h1>
                        <p className="text-[#121e14]/70 text-xs font-semibold mt-0.5">
                            Dusun {DUSUN_NAMES[activeUser.assignedDusun || 1] || activeUser.assignedDusun} • Mitra Tengkulak
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsEditProfileOpen(true)}
                        className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold bg-[#f4f3ea] border border-[#e2e0d4] rounded-xl hover:bg-[#15291b] hover:text-[#d6f837] hover:border-[#15291b] transition-all text-[#121e14] shadow-sm"
                    >
                        <UserPen className="w-4 h-4 stroke-[2.2]" />
                        <span>Edit Profil</span>
                    </button>
                    <button
                        onClick={onLogout}
                        className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold bg-[#f4f3ea] border border-[#e2e0d4] rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all text-[#121e14] shadow-sm"
                    >
                        <LogOut className="w-4 h-4 stroke-[2.2]" />
                        <span>Keluar</span>
                    </button>
                </div>
            </div>

            {/* Benchmark Info Banner (Bapanas) */}
            <div className="bg-white p-4 rounded-2xl border border-[#e2e0d4] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                        BAP
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-[#121e14]">Acuan Standar Harga Pemerintah (Bapanas)</h4>
                        <p className="text-[11px] text-[#121e14]/60">
                            HET Beras: Rp {berasMin.toLocaleString('id-ID')} - Rp {berasMax.toLocaleString('id-ID')}/Kg • HPP Gabah: Rp {gabahMin.toLocaleString('id-ID')} - Rp {gabahMax.toLocaleString('id-ID')}/Kg
                        </p>
                    </div>
                </div>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-bold border border-emerald-200">
                    Acuan Aktif
                </span>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[1.75rem] border border-[#e2e0d4] shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="w-10 h-10 bg-[#15291b]/10 rounded-xl flex items-center justify-center text-[#15291b] mb-4">
                            <CircleDollarSign className="w-5 h-5 stroke-[2.2]" />
                        </div>
                        <p className="text-xs font-bold uppercase tracking-wider text-[#121e14]/60 mb-1">
                            Rata-rata Harga Beras Disetor
                        </p>
                        <h3 className="text-2xl sm:text-3xl font-extrabold text-[#121e14]">
                            Rp {avgBerasKu.toLocaleString('id-ID')}{' '}
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
                            Rata-rata Harga Gabah Disetor
                        </p>
                        <h3 className="text-2xl sm:text-3xl font-extrabold text-[#121e14]">
                            Rp {avgGabahKu.toLocaleString('id-ID')}{' '}
                            <span className="text-xs font-semibold text-[#121e14]/50">/kg</span>
                        </h3>
                    </div>
                </div>

                <div className="bg-[#15291b] p-6 rounded-[1.75rem] text-white shadow-lg flex flex-col justify-between border border-white/10 relative overflow-hidden">
                    <div className="relative z-10">
                        <span className="badge-pill-dark text-[10px] mb-3">
                            <span className="badge-bullet"></span> AKTIVITAS SETORAN
                        </span>
                        <h3 className="text-3xl sm:text-4xl font-extrabold text-[#d6f837] mt-2">
                            {totalTransaksi}{' '}
                            <span className="text-base text-white/80 font-bold">Transaksi</span>
                        </h3>
                        <p className="text-[11px] text-white/70 mt-2">
                            *Pencatatan volume total panen desa dikelola oleh Admin Desa.
                        </p>
                    </div>
                </div>
            </div>

            {/* Form Input + Chart Section */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Form Input: ONLY Beras & Gabah */}
                <div className="xl:col-span-1">
                    <div className="bg-white rounded-[1.75rem] border border-[#e2e0d4] shadow-sm overflow-hidden sticky top-24">
                        <div className="bg-[#15291b] p-5 border-b border-white/10 text-white">
                            <h3 className="font-bold flex items-center text-[#d6f837] text-base">
                                <PlusCircle className="w-5 h-5 mr-2 stroke-[2.5]" />
                                {"Input Setoran Harga Baru"}
                            </h3>
                            <p className="text-[11px] text-white/70 mt-1 ml-7">
                                Masukkan data harga beras dan harga gabah terkini Anda.
                            </p>
                        </div>
                        <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
                            {hasOver && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-[11px] font-medium flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                                    <span>Peringatan: Harga melebihi batas atas standar pemerintah (HET/HPP), namun tetap dapat disimpan.</span>
                                </div>
                            )}

                            {hasUnder && !hasOver && (
                                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-[11px] font-medium flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                                    <span>Pemberitahuan: Harga berada di bawah batas acuan pemerintah (HET/HPP), namun tetap dapat disimpan.</span>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-[#121e14] mb-1.5">
                                    Harga Beras (Rp/Kg) *
                                </label>
                                <input
                                    type="number"
                                    required
                                    value={tengkulakForm.hargaBeras}
                                    onChange={(e) => setTengkulakForm({ ...tengkulakForm, hargaBeras: e.target.value })}
                                    className={"w-full px-4 py-2.5 rounded-xl border bg-[#f4f3ea] text-xs font-semibold text-[#121e14] focus:outline-none focus:ring-2 focus:ring-[#15291b] " + (
                                        isBerasOver ? 'border-red-400 ring-1 ring-red-400' : isBerasUnder ? 'border-amber-400 ring-1 ring-amber-400' : 'border-[#e2e0d4]'
                                    )}
                                    placeholder="Contoh: 13500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-[#121e14] mb-1.5">
                                    Harga Gabah (Rp/Kg) *
                                </label>
                                <input
                                    type="number"
                                    required
                                    value={tengkulakForm.hargaGabah}
                                    onChange={(e) => setTengkulakForm({ ...tengkulakForm, hargaGabah: e.target.value })}
                                    className={"w-full px-4 py-2.5 rounded-xl border bg-[#f4f3ea] text-xs font-semibold text-[#121e14] focus:outline-none focus:ring-2 focus:ring-[#15291b] " + (
                                        isGabahOver ? 'border-red-400 ring-1 ring-red-400' : isGabahUnder ? 'border-amber-400 ring-1 ring-amber-400' : 'border-[#e2e0d4]'
                                    )}
                                    placeholder="Contoh: 6500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-[#121e14] mb-1.5">
                                    Periode Panen
                                </label>
                                <select
                                    value={tengkulakForm.kuartal}
                                    onChange={(e) => setTengkulakForm({ ...tengkulakForm, kuartal: e.target.value as Kuartal })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-[#e2e0d4] bg-[#f4f3ea] text-xs font-semibold text-[#121e14] focus:outline-none focus:ring-2 focus:ring-[#15291b]"
                                >
                                    <option value="Q1">Periode 1 (Jan-Mar)</option>
                                    <option value="Q2">Periode 2 (Apr-Jun)</option>
                                    <option value="Q3">Periode 3 (Jul-Sep)</option>
                                    <option value="Q4">Periode 4 (Okt-Des)</option>
                                </select>
                            </div>

                            <div className="pt-3">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="btn-forest w-full py-3 text-xs font-bold uppercase tracking-wider justify-center disabled:opacity-50"
                                >
                                    <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Harga'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Chart & History Table */}
                <div className="xl:col-span-2 space-y-8">
                    <div className="bg-white p-6 rounded-[1.75rem] border border-[#e2e0d4] shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="font-bold text-base text-[#121e14]">Pergerakan Harga Disetor Per Periode</h3>
                                <p className="text-xs text-[#121e14]/60">Grafik harga beras & gabah Anda per Kuartal.</p>
                            </div>
                        </div>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e0d4" />
                                    <XAxis dataKey="kuartal" tick={{ fontSize: 11, fill: '#121e14' }} />
                                    <YAxis
                                        tick={{ fontSize: 11, fill: '#121e14' }}
                                        tickFormatter={(val) => `Rp ${val / 1000}k`}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#15291b',
                                            borderRadius: '12px',
                                            border: 'none',
                                            color: '#fff',
                                            fontSize: '12px',
                                        }}
                                        formatter={(val: unknown) => [`Rp ${Number(val).toLocaleString('id-ID')}`, '']}
                                    />
                                    <Legend />
                                    <Line type="monotone" dataKey="Harga Beras" stroke="#15291b" strokeWidth={3} dot={{ r: 4 }} />
                                    <Line type="monotone" dataKey="Harga Gabah" stroke="#ca8a04" strokeWidth={3} dot={{ r: 4 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-[1.75rem] border border-[#e2e0d4] shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-[#e2e0d4] flex justify-between items-center bg-[#f4f3ea]">
                            <div>
                                <h3 className="font-bold text-base text-[#121e14]">Riwayat Setoran Harga Anda</h3>
                                <p className="text-xs text-[#121e14]/60">Daftar transaksi harga yang tercatat atas nama Anda.</p>
                            </div>
                            <div className="bg-[#15291b] text-[#d6f837] px-3.5 py-1 rounded-full text-xs font-bold">
                                {myRecords.length} Setoran
                            </div>
                        </div>
                        {myRecords.length === 0 ? (
                            <div className="p-12 text-center text-[#121e14]/50 text-xs">Belum ada riwayat transaksi harga.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left whitespace-nowrap">
                                    <thead>
                                        <tr className="text-[11px] uppercase tracking-wider text-[#121e14]/60 bg-[#f4f3ea]">
                                            <th className="px-6 py-4 font-bold">Tanggal</th>
                                            <th className="px-6 py-4 font-bold">Periode</th>
                                            <th className="px-6 py-4 font-bold">Harga Beras</th>
                                            <th className="px-6 py-4 font-bold">Harga Gabah</th>
                                            <th className="px-6 py-4 font-bold">Status Bapanas</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#e2e0d4]">
                                        {myRecords.map((r) => {
                                            const isOver = r.hargaBeras > berasMax || r.hargaGabah > gabahMax;
                                            const isUnder = r.hargaBeras < berasMin || r.hargaGabah < gabahMin;

                                            return (
                                                <tr key={r.id} className="hover:bg-[#f4f3ea]/60 transition-colors text-xs font-semibold">
                                                    <td className="px-6 py-4 text-[#121e14]/70">
                                                        {new Date(r.timestamp).toLocaleDateString('id-ID', {
                                                            day: '2-digit',
                                                            month: 'short',
                                                            year: 'numeric',
                                                        })}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="bg-[#f4f3ea] text-[#121e14] px-2.5 py-1 rounded-md text-[11px] font-bold border border-[#e2e0d4]">
                                                            {r.kuartal.replace('Q', 'Periode ')}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-[#15291b] font-bold">Rp {r.hargaBeras.toLocaleString('id-ID')}</td>
                                                    <td className="px-6 py-4 text-[#15291b] font-bold">Rp {r.hargaGabah.toLocaleString('id-ID')}</td>
                                                    <td className="px-6 py-4">
                                                        {isOver ? (
                                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-red-100 text-red-800 px-2.5 py-0.5 rounded-full border border-red-200">
                                                                Di Atas Acuan
                                                            </span>
                                                        ) : isUnder ? (
                                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full border border-amber-200">
                                                                Di Bawah Acuan
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200">
                                                                Sesuai Acuan
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Edit Profile Modal */}
            <EditProfileModal
                isOpen={isEditProfileOpen}
                onClose={() => setIsEditProfileOpen(false)}
                user={{
                    id: activeUser.id || '',
                    name: currentUserName,
                    role: activeUser.role,
                }}
                onProfileUpdated={handleProfileUpdated}
            />
        </div>
    );
}
