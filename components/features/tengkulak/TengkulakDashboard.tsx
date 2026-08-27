import React, { useState } from 'react';
import { User, LogOut, PlusCircle, AlertCircle } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { TengkulakRecord, SessionUser, Kuartal } from '@/types';
import { DUSUN_NAMES, GOVERNMENT_PRICE_BENCHMARKS } from '@/app/lib/constants';
import { createRecord } from '@/services/recordService';

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
    const myRecords = records
        .filter((r) => r.nama.toLowerCase() === (activeUser.name || '').toLowerCase())
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const totalPanenKu = myRecords.reduce((acc, r) => acc + (r.totalPanen || 0), 0);

    const chartData = ['Q1', 'Q2', 'Q3', 'Q4'].map((k) => {
        const kRecs = myRecords.filter((r) => r.kuartal === k);
        const totalP = kRecs.reduce((acc, r) => acc + (r.totalPanen || 0), 0);
        const avgBeras = kRecs.length > 0 ? kRecs.reduce((acc, r) => acc + r.hargaBeras, 0) / kRecs.length : 0;
        return {
            kuartal: k.replace('Q', 'Periode '),
            'Total Panen (Kg)': totalP,
            'Harga Beras': Math.round(avgBeras),
        };
    });

    const [tengkulakForm, setTengkulakForm] = useState({
        hargaBeras: '',
        hargaGabah: '',
        kuartal: 'Q1' as Kuartal,
        totalPanen: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const numBeras = Number(tengkulakForm.hargaBeras) || 0;
    const numGabah = Number(tengkulakForm.hargaGabah) || 0;
    const isBerasOver = numBeras > GOVERNMENT_PRICE_BENCHMARKS.beras.max;
    const isGabahOver = numGabah > GOVERNMENT_PRICE_BENCHMARKS.gabah.max;

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await createRecord({
                nama: activeUser.name || 'Tengkulak',
                dusun: activeUser.assignedDusun || 1,
                hargaBeras: Number(tengkulakForm.hargaBeras),
                hargaGabah: Number(tengkulakForm.hargaGabah),
                kuartal: tengkulakForm.kuartal,
                totalPanen: Number(tengkulakForm.totalPanen),
            });

            if (res.success) {
                setTengkulakForm({
                    hargaBeras: '',
                    hargaGabah: '',
                    kuartal: 'Q1',
                    totalPanen: '',
                });
                onRefreshRecords();
                onShowSuccess(
                    'Data Berhasil Disimpan!',
                    res.warning
                        ? res.warning + ' Namun data tetap tersimpan ke sistem.'
                        : 'Setoran data harga dan hasil panen Anda berhasil dicatat.'
                );
            } else {
                alert('Gagal menyimpan: ' + (res.error || 'Terjadi kesalahan'));
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex justify-between items-center bg-white p-6 rounded-[1.75rem] border border-[#e2e0d4] shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#15291b] text-[#d6f837] rounded-2xl flex items-center justify-center font-bold shadow-sm">
                        <User className="w-6 h-6 stroke-[2.2]" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold text-[#121e14]">
                            Halo, {activeUser.name}
                        </h1>
                        <p className="text-[#121e14]/70 text-xs font-semibold mt-0.5">
                            Dusun {DUSUN_NAMES[activeUser.assignedDusun || 1] || activeUser.assignedDusun} • Mitra Tengkulak
                        </p>
                    </div>
                </div>
                <button
                    onClick={onLogout}
                    className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold bg-[#f4f3ea] border border-[#e2e0d4] rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all text-[#121e14] shadow-sm"
                >
                    <LogOut className="w-4 h-4 stroke-[2.2]" /> Keluar
                </button>
            </div>

            {/* Benchmark Info Banner */}
            <div className="bg-white p-4 rounded-2xl border border-[#e2e0d4] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                        HET
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-[#121e14]">Acuan Standar Harga Pemerintah (Bapanas)</h4>
                        <p className="text-[11px] text-[#121e14]/60">
                            HET Beras: Rp {GOVERNMENT_PRICE_BENCHMARKS.beras.min.toLocaleString('id-ID')} - Rp {GOVERNMENT_PRICE_BENCHMARKS.beras.max.toLocaleString('id-ID')}/Kg • HPP Gabah: Rp {GOVERNMENT_PRICE_BENCHMARKS.gabah.min.toLocaleString('id-ID')} - Rp {GOVERNMENT_PRICE_BENCHMARKS.gabah.max.toLocaleString('id-ID')}/Kg
                        </p>
                    </div>
                </div>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-bold border border-emerald-200">
                    Batas Wajar Aktif
                </span>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#15291b] p-6 rounded-[1.75rem] text-white shadow-lg md:col-span-1 border border-white/10 relative overflow-hidden flex flex-col justify-between">
                    <div>
                        <span className="badge-pill-dark text-[10px] mb-3">
                            <span className="badge-bullet"></span> AKUMULASI PANEN
                        </span>
                        <h3 className="text-4xl font-extrabold text-[#d6f837] mt-2">
                            {(totalPanenKu / 1000).toLocaleString('id-ID', { maximumFractionDigits: 1 })}{' '}
                            <span className="text-lg text-white/80">Ton</span>
                        </h3>
                        <p className="text-xs text-white/60 mt-1">
                            Total: {totalPanenKu.toLocaleString('id-ID')} Kg
                        </p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[1.75rem] border border-[#e2e0d4] shadow-sm md:col-span-2 flex flex-col justify-between">
                    <div>
                        <h3 className="font-bold text-lg text-[#121e14] mb-1">Ringkasan Setoran & Kemitraan</h3>
                        <p className="text-xs text-[#121e14]/70 leading-relaxed">
                            Anda tercatat memiliki <strong>{myRecords.length} transaksi setoran</strong> di Dusun {DUSUN_NAMES[activeUser.assignedDusun || 1] || activeUser.assignedDusun}.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#e2e0d4]">
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#121e14]/50">Total Transaksi</span>
                            <p className="text-base font-extrabold text-[#15291b]">{myRecords.length} Kali</p>
                        </div>
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#121e14]/50">Rata-rata Setoran</span>
                            <p className="text-base font-extrabold text-[#15291b]">
                                {myRecords.length > 0 ? Math.round(totalPanenKu / myRecords.length).toLocaleString('id-ID') : 0} Kg
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form Input + Chart Section */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Form Input */}
                <div className="xl:col-span-1">
                    <div className="bg-white rounded-[1.75rem] border border-[#e2e0d4] shadow-sm overflow-hidden sticky top-24">
                        <div className="bg-[#15291b] p-5 border-b border-white/10 text-white">
                            <h3 className="font-bold flex items-center text-[#d6f837] text-base">
                                <PlusCircle className="w-5 h-5 mr-2 stroke-[2.5]" />
                                {"Input Setoran Panen Baru"}
                            </h3>
                            <p className="text-[11px] text-white/70 mt-1 ml-7">
                                Masukkan data harga dan jumlah panen secara mandiri.
                            </p>
                        </div>
                        <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
                            {(isBerasOver || isGabahOver) && (
                                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-[11px] font-medium flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                                    <span>Peringatan: Harga melebihi standar pemerintah, namun tetap dapat disimpan.</span>
                                </div>
                            )}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-[#121e14] mb-1.5">Harga Beras (Rp/Kg)</label>
                                <input
                                    type="number"
                                    required
                                    value={tengkulakForm.hargaBeras}
                                    onChange={(e) => setTengkulakForm({ ...tengkulakForm, hargaBeras: e.target.value })}
                                    className={"w-full px-4 py-2.5 rounded-xl border bg-[#f4f3ea] text-xs font-medium text-[#121e14] focus:outline-none focus:ring-2 focus:ring-[#15291b] " + (
                                        isBerasOver ? 'border-amber-400 ring-1 ring-amber-400' : 'border-[#e2e0d4]'
                                    )}
                                    placeholder="Contoh: 14000"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-[#121e14] mb-1.5">Harga Gabah (Rp/Kg)</label>
                                <input
                                    type="number"
                                    required
                                    value={tengkulakForm.hargaGabah}
                                    onChange={(e) => setTengkulakForm({ ...tengkulakForm, hargaGabah: e.target.value })}
                                    className={"w-full px-4 py-2.5 rounded-xl border bg-[#f4f3ea] text-xs font-medium text-[#121e14] focus:outline-none focus:ring-2 focus:ring-[#15291b] " + (
                                        isGabahOver ? 'border-amber-400 ring-1 ring-amber-400' : 'border-[#e2e0d4]'
                                    )}
                                    placeholder="Contoh: 7000"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-[#121e14] mb-1.5">Periode</label>
                                    <select
                                        value={tengkulakForm.kuartal}
                                        onChange={(e) => setTengkulakForm({ ...tengkulakForm, kuartal: e.target.value as Kuartal })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-[#e2e0d4] bg-[#f4f3ea] text-xs font-medium text-[#121e14] focus:outline-none focus:ring-2 focus:ring-[#15291b]"
                                    >
                                        <option value="Q1">Periode 1 (Jan-Mar)</option>
                                        <option value="Q2">Periode 2 (Apr-Jun)</option>
                                        <option value="Q3">Periode 3 (Jul-Sep)</option>
                                        <option value="Q4">Periode 4 (Okt-Des)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-[#121e14] mb-1.5">Total Panen</label>
                                    <input
                                        type="number"
                                        required
                                        value={tengkulakForm.totalPanen}
                                        onChange={(e) => setTengkulakForm({ ...tengkulakForm, totalPanen: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-[#e2e0d4] bg-[#f4f3ea] text-xs font-medium text-[#121e14] focus:outline-none focus:ring-2 focus:ring-[#15291b]"
                                        placeholder="Kg"
                                    />
                                </div>
                            </div>
                            <div className="pt-3">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="btn-forest w-full py-3 text-xs font-bold uppercase tracking-wider justify-center disabled:opacity-50"
                                >
                                    <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Transaksi'}</span>
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
                                <h3 className="font-bold text-base text-[#121e14]">Tren Panen Per Periode</h3>
                                <p className="text-xs text-[#121e14]/60">Distribusi hasil panen Anda per Kuartal.</p>
                            </div>
                        </div>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e0d4" />
                                    <XAxis dataKey="kuartal" tick={{ fontSize: 11, fill: '#121e14' }} />
                                    <YAxis tick={{ fontSize: 11, fill: '#121e14' }} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#15291b',
                                            borderRadius: '12px',
                                            border: 'none',
                                            color: '#fff',
                                            fontSize: '12px',
                                        }}
                                    />
                                    <Bar dataKey="Total Panen (Kg)" fill="#15291b" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-[1.75rem] border border-[#e2e0d4] shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-[#e2e0d4] flex justify-between items-center bg-[#f4f3ea]">
                            <div>
                                <h3 className="font-bold text-base text-[#121e14]">Riwayat Setoran Panen Anda</h3>
                                <p className="text-xs text-[#121e14]/60">Daftar transaksi panen yang tercatat atas nama Anda.</p>
                            </div>
                            <div className="bg-[#15291b] text-[#d6f837] px-3.5 py-1 rounded-full text-xs font-bold">
                                {myRecords.length} Transaksi
                            </div>
                        </div>
                        {myRecords.length === 0 ? (
                            <div className="p-12 text-center text-[#121e14]/50 text-xs">Belum ada riwayat transaksi.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left whitespace-nowrap">
                                    <thead>
                                        <tr className="text-[11px] uppercase tracking-wider text-[#121e14]/60 bg-[#f4f3ea]">
                                            <th className="px-6 py-4 font-bold">Tanggal</th>
                                            <th className="px-6 py-4 font-bold">Periode</th>
                                            <th className="px-6 py-4 font-bold">Harga Beras</th>
                                            <th className="px-6 py-4 font-bold">Harga Gabah</th>
                                            <th className="px-6 py-4 font-bold">Total Panen</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#e2e0d4]">
                                        {myRecords.map((r) => (
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
                                                <td className="px-6 py-4 text-emerald-800 font-extrabold">{r.totalPanen ? r.totalPanen.toLocaleString('id-ID') + ' Kg' : '-'}</td>
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
