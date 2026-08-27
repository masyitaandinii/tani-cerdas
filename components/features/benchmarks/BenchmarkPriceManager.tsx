"use client";

import React, { useState, useEffect } from 'react';
import { Sliders, CheckCircle, AlertCircle, CircleDollarSign, Tractor, RefreshCw } from 'lucide-react';
import { PriceBenchmark, UpdateBenchmarkPayload } from '@/types';
import { GOVERNMENT_PRICE_BENCHMARKS } from '@/app/lib/constants';
import { fetchBenchmarkPrices, updateBenchmarkPrices } from '@/services/benchmarkService';

interface BenchmarkPriceManagerProps {
    onBenchmarkUpdated?: () => void;
    onShowSuccess?: (title: string, message: string) => void;
}

export function BenchmarkPriceManager({
    onBenchmarkUpdated,
    onShowSuccess,
}: BenchmarkPriceManagerProps) {
    const [benchmark, setBenchmark] = useState<PriceBenchmark | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [form, setForm] = useState<UpdateBenchmarkPayload>({
        berasTarget: GOVERNMENT_PRICE_BENCHMARKS.beras.target,
        berasMin: GOVERNMENT_PRICE_BENCHMARKS.beras.min,
        berasMax: GOVERNMENT_PRICE_BENCHMARKS.beras.max,
        gabahTarget: GOVERNMENT_PRICE_BENCHMARKS.gabah.target,
        gabahMin: GOVERNMENT_PRICE_BENCHMARKS.gabah.min,
        gabahMax: GOVERNMENT_PRICE_BENCHMARKS.gabah.max,
    });

    const loadBenchmark = async (showRefreshIndicator = false) => {
        if (showRefreshIndicator) setIsRefreshing(true);
        setError(null);
        try {
            const data = await fetchBenchmarkPrices();
            if (data) {
                setBenchmark(data);
                setForm({
                    berasTarget: data.beras?.target || GOVERNMENT_PRICE_BENCHMARKS.beras.target,
                    berasMin: data.beras?.min || GOVERNMENT_PRICE_BENCHMARKS.beras.min,
                    berasMax: data.beras?.max || GOVERNMENT_PRICE_BENCHMARKS.beras.max,
                    gabahTarget: data.gabah?.target || GOVERNMENT_PRICE_BENCHMARKS.gabah.target,
                    gabahMin: data.gabah?.min || GOVERNMENT_PRICE_BENCHMARKS.gabah.min,
                    gabahMax: data.gabah?.max || GOVERNMENT_PRICE_BENCHMARKS.gabah.max,
                });
            }
        } catch {
            setError('Gagal memuat data acuan harga Bapanas.');
        } finally {
            if (showRefreshIndicator) setIsRefreshing(false);
        }
    };

    useEffect(() => {
        loadBenchmark();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (form.berasMin > form.berasMax) {
            setError('HET Beras Minimal tidak boleh lebih tinggi dari HET Maksimal');
            return;
        }

        if (form.gabahMin > form.gabahMax) {
            setError('HPP Gabah Minimal tidak boleh lebih tinggi dari HPP Maksimal');
            return;
        }

        setIsSaving(true);
        try {
            const res = await updateBenchmarkPrices(form);
            if (res.success) {
                await loadBenchmark();
                if (onBenchmarkUpdated) onBenchmarkUpdated();
                if (onShowSuccess) {
                    onShowSuccess(
                        'Acuan Harga Bapanas Berhasil Diperbarui!',
                        'Seluruh sistem dan dashboard utama sekarang menggunakan acuan rata-rata harga Bapanas terbaru.'
                    );
                }
            } else {
                setError(res.error || 'Gagal memperbarui harga acuan Bapanas.');
            }
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-white rounded-[1.75rem] border border-[#e2e0d4] shadow-sm overflow-hidden">
            {/* Header Banner */}
            <div className="bg-[#15291b] p-6 border-b border-white/10 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#d6f837] text-[#121e14] rounded-2xl flex items-center justify-center font-bold shadow-sm shrink-0">
                        <Sliders className="w-6 h-6 stroke-[2.3]" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-extrabold text-lg text-white">
                                Pengaturan Data Harga Acuan Bapanas
                            </h3>
                            <span className="bg-[#d6f837]/20 text-[#d6f837] border border-[#d6f837]/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                Resmi
                            </span>
                        </div>
                        <p className="text-xs text-white/70 mt-0.5">
                            Perbarui standar harga rata-rata, HET beras, dan HPP gabah dari Badan Pangan Nasional (Bapanas).
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => loadBenchmark(true)}
                    disabled={isRefreshing}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors shrink-0 self-start sm:self-auto disabled:opacity-50"
                    title="Muat Ulang Data Acuan"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                    <span>{isRefreshing ? 'Menyegarkan...' : 'Segarkan'}</span>
                </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-bold flex items-start gap-2.5">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                        <span>{error}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Seksi Beras */}
                    <div className="p-5 rounded-2xl bg-[#f4f3ea]/70 border border-[#e2e0d4] space-y-4">
                        <div className="flex items-center gap-2.5 pb-3 border-b border-[#e2e0d4]">
                            <div className="w-8 h-8 rounded-xl bg-[#15291b] text-[#d6f837] flex items-center justify-center font-bold">
                                <CircleDollarSign className="w-4 h-4" />
                            </div>
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-[#121e14]">
                                    Acuan Komoditas Beras
                                </h4>
                                <p className="text-[11px] text-[#121e14]/60">
                                    Harga Eceran Tertinggi (HET) Bapanas
                                </p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[#121e14] mb-1.5">
                                Harga Rata-rata / Acuan Beras (Rp/Kg) *
                            </label>
                            <input
                                type="number"
                                required
                                value={form.berasTarget || ''}
                                onChange={(e) => setForm({ ...form, berasTarget: Number(e.target.value) })}
                                className="w-full px-4 py-2.5 rounded-xl border border-[#e2e0d4] bg-white text-xs font-bold text-[#15291b] focus:outline-none focus:ring-2 focus:ring-[#15291b]"
                                placeholder="Contoh: 13500"
                            />
                            <span className="text-[10px] text-[#121e14]/50 mt-1 block">
                                Digunakan sebagai patokan harga rata-rata di beranda.
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[11px] font-bold text-[#121e14]/80 mb-1">
                                    HET Batas Bawah (Rp)
                                </label>
                                <input
                                    type="number"
                                    required
                                    value={form.berasMin || ''}
                                    onChange={(e) => setForm({ ...form, berasMin: Number(e.target.value) })}
                                    className="w-full px-3.5 py-2 rounded-xl border border-[#e2e0d4] bg-white text-xs font-semibold text-[#121e14] focus:outline-none focus:ring-2 focus:ring-[#15291b]"
                                    placeholder="12500"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-[#121e14]/80 mb-1">
                                    HET Batas Atas (Rp)
                                </label>
                                <input
                                    type="number"
                                    required
                                    value={form.berasMax || ''}
                                    onChange={(e) => setForm({ ...form, berasMax: Number(e.target.value) })}
                                    className="w-full px-3.5 py-2 rounded-xl border border-[#e2e0d4] bg-white text-xs font-semibold text-[#121e14] focus:outline-none focus:ring-2 focus:ring-[#15291b]"
                                    placeholder="14900"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Seksi Gabah */}
                    <div className="p-5 rounded-2xl bg-[#f4f3ea]/70 border border-[#e2e0d4] space-y-4">
                        <div className="flex items-center gap-2.5 pb-3 border-b border-[#e2e0d4]">
                            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center font-bold">
                                <Tractor className="w-4 h-4" />
                            </div>
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-[#121e14]">
                                    Acuan Komoditas Gabah
                                </h4>
                                <p className="text-[11px] text-[#121e14]/60">
                                    Harga Pembelian Pemerintah (HPP) Bapanas
                                </p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[#121e14] mb-1.5">
                                Harga Rata-rata / Acuan Gabah (Rp/Kg) *
                            </label>
                            <input
                                type="number"
                                required
                                value={form.gabahTarget || ''}
                                onChange={(e) => setForm({ ...form, gabahTarget: Number(e.target.value) })}
                                className="w-full px-4 py-2.5 rounded-xl border border-[#e2e0d4] bg-white text-xs font-bold text-amber-800 focus:outline-none focus:ring-2 focus:ring-[#15291b]"
                                placeholder="Contoh: 6500"
                            />
                            <span className="text-[10px] text-[#121e14]/50 mt-1 block">
                                Digunakan sebagai patokan harga rata-rata di beranda.
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[11px] font-bold text-[#121e14]/80 mb-1">
                                    HPP Batas Bawah (Rp)
                                </label>
                                <input
                                    type="number"
                                    required
                                    value={form.gabahMin || ''}
                                    onChange={(e) => setForm({ ...form, gabahMin: Number(e.target.value) })}
                                    className="w-full px-3.5 py-2 rounded-xl border border-[#e2e0d4] bg-white text-xs font-semibold text-[#121e14] focus:outline-none focus:ring-2 focus:ring-[#15291b]"
                                    placeholder="6000"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-[#121e14]/80 mb-1">
                                    HPP Batas Atas (Rp)
                                </label>
                                <input
                                    type="number"
                                    required
                                    value={form.gabahMax || ''}
                                    onChange={(e) => setForm({ ...form, gabahMax: Number(e.target.value) })}
                                    className="w-full px-3.5 py-2 rounded-xl border border-[#e2e0d4] bg-white text-xs font-semibold text-[#121e14] focus:outline-none focus:ring-2 focus:ring-[#15291b]"
                                    placeholder="7500"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Info & Action */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-[#e2e0d4]">
                    <div className="text-[11px] text-[#121e14]/60">
                        {benchmark?.updatedAt ? (
                            <span>
                                Terakhir diperbarui:{' '}
                                <strong>
                                    {new Date(benchmark.updatedAt).toLocaleDateString('id-ID', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </strong>{' '}
                                oleh {benchmark.updatedBy || 'Admin'}
                            </span>
                        ) : (
                            <span>Data menggunakan acuan standar Badan Pangan Nasional (Bapanas).</span>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isSaving}
                        className="btn-forest px-8 py-3 text-xs font-bold uppercase tracking-wider justify-center disabled:opacity-50"
                    >
                        <CheckCircle className="w-4 h-4 stroke-[2.5]" />
                        <span>{isSaving ? 'Menyimpan...' : 'Simpan Pembaruan Acuan'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
