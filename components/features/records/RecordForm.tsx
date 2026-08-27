import React, { useState, useEffect } from 'react';
import { PlusCircle, AlertCircle } from 'lucide-react';
import { RecordFormData, Kuartal, PriceBenchmark } from '@/types';
import { DUSUN_NAMES, GOVERNMENT_PRICE_BENCHMARKS } from '@/app/lib/constants';
import { searchTengkulak } from '@/services/tengkulakService';
import { fetchBenchmarkPrices } from '@/services/benchmarkService';

interface RecordFormProps {
    formData: RecordFormData;
    onChange: (data: RecordFormData) => void;
    onSubmit: (e: React.FormEvent) => void;
    isSubmitting: boolean;
    role: string;
    assignedDusun?: number;
}

export function RecordForm({
    formData,
    onChange,
    onSubmit,
    isSubmitting,
    role,
    assignedDusun = 1,
}: RecordFormProps) {
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [benchmarks, setBenchmarks] = useState<PriceBenchmark>({
        beras: GOVERNMENT_PRICE_BENCHMARKS.beras,
        gabah: GOVERNMENT_PRICE_BENCHMARKS.gabah,
    });

    useEffect(() => {
        async function loadBm() {
            const data = await fetchBenchmarkPrices();
            setBenchmarks(data);
        }
        loadBm();
    }, []);

    useEffect(() => {
        if (!formData.nama.trim()) {
            setSuggestions([]);
            return;
        }
        const targetDusun = role === 'superadmin' ? formData.dusun : assignedDusun;
        const timer = setTimeout(async () => {
            const list = await searchTengkulak(formData.nama, targetDusun);
            setSuggestions(list);
        }, 200);
        return () => clearTimeout(timer);
    }, [formData.nama, formData.dusun, role, assignedDusun]);

    const numBeras = Number(formData.hargaBeras) || 0;
    const numGabah = Number(formData.hargaGabah) || 0;
    const berasMin = benchmarks.beras?.min || GOVERNMENT_PRICE_BENCHMARKS.beras.min;
    const berasMax = benchmarks.beras?.max || GOVERNMENT_PRICE_BENCHMARKS.beras.max;
    const gabahMin = benchmarks.gabah?.min || GOVERNMENT_PRICE_BENCHMARKS.gabah.min;
    const gabahMax = benchmarks.gabah?.max || GOVERNMENT_PRICE_BENCHMARKS.gabah.max;

    const isBerasOver = numBeras > 0 && numBeras > berasMax;
    const isBerasUnder = numBeras > 0 && numBeras < berasMin;
    const isGabahOver = numGabah > 0 && numGabah > gabahMax;
    const isGabahUnder = numGabah > 0 && numGabah < gabahMin;

    return (
        <div className="bg-white rounded-[1.75rem] border border-[#e2e0d4] shadow-sm overflow-hidden">
            <div className="bg-[#15291b] p-5 border-b border-white/10 text-white">
                <h3 className="font-bold flex items-center text-[#d6f837] text-base">
                    <PlusCircle className="w-5 h-5 mr-2 stroke-[2.5]" />
                    {"Tambah Data Tengkulak"}
                </h3>
                <p className="text-[11px] text-white/70 mt-1 ml-7">
                    Menambah data ini otomatis mengupdate setoran & panen Tengkulak.
                </p>
            </div>

            <form onSubmit={onSubmit} className="p-6 space-y-4">
                <div className="relative">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#121e14] mb-1.5">
                        Nama Tengkulak *
                    </label>
                    <input
                        type="text"
                        required
                        value={formData.nama}
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        onChange={(e) => {
                            onChange({ ...formData, nama: e.target.value });
                            setShowSuggestions(true);
                        }}
                        className="w-full px-4 py-2.5 rounded-xl border border-[#e2e0d4] bg-[#f4f3ea] text-xs font-medium text-[#121e14] focus:outline-none focus:ring-2 focus:ring-[#15291b]"
                        placeholder="Masukkan nama lengkap"
                    />
                    {showSuggestions && suggestions.length > 0 && (
                        <ul className="absolute z-20 w-full mt-1 bg-white border border-[#e2e0d4] rounded-xl shadow-lg max-h-48 overflow-y-auto">
                            {suggestions.map((name, idx) => (
                                <li
                                    key={idx}
                                    onMouseDown={() => {
                                        onChange({ ...formData, nama: name });
                                        setShowSuggestions(false);
                                    }}
                                    className="px-4 py-2 text-xs text-[#121e14] hover:bg-[#d6f837] cursor-pointer font-medium border-b border-[#e2e0d4] last:border-0"
                                >
                                    {name}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {role === 'superadmin' && (
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#121e14] mb-1.5">
                            Dusun Target (Superadmin)
                        </label>
                        <select
                            value={formData.dusun}
                            onChange={(e) => onChange({ ...formData, dusun: Number(e.target.value) })}
                            className="w-full px-4 py-2.5 rounded-xl border border-[#e2e0d4] bg-[#f4f3ea] text-xs font-medium text-[#121e14] focus:outline-none focus:ring-2 focus:ring-[#15291b]"
                        >
                            <option value={1}>Dusun {DUSUN_NAMES[1]}</option>
                            <option value={2}>Dusun {DUSUN_NAMES[2]}</option>
                            <option value={3}>Dusun {DUSUN_NAMES[3]}</option>
                            <option value={4}>Dusun {DUSUN_NAMES[4]}</option>
                        </select>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#121e14] mb-1.5">
                            Harga Beras (Rp/Kg) *
                        </label>
                        <input
                            type="number"
                            required
                            value={formData.hargaBeras}
                            onChange={(e) => onChange({ ...formData, hargaBeras: e.target.value })}
                            className={"w-full px-4 py-2.5 rounded-xl border bg-[#f4f3ea] text-xs font-medium text-[#121e14] focus:outline-none focus:ring-2 focus:ring-[#15291b] " + (
                                isBerasOver ? 'border-red-400 ring-1 ring-red-400' : isBerasUnder ? 'border-amber-400 ring-1 ring-amber-400' : 'border-[#e2e0d4]'
                            )}
                            placeholder="Rp"
                        />
                        {isBerasOver && (
                            <p className="text-[10px] text-red-700 font-bold mt-1 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> Melebihi HET (Max Rp {berasMax.toLocaleString('id-ID')})
                            </p>
                        )}
                        {isBerasUnder && (
                            <p className="text-[10px] text-amber-700 font-bold mt-1 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> Di bawah HET (Min Rp {berasMin.toLocaleString('id-ID')})
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#121e14] mb-1.5">
                            Harga Gabah (Rp/Kg) *
                        </label>
                        <input
                            type="number"
                            required
                            value={formData.hargaGabah}
                            onChange={(e) => onChange({ ...formData, hargaGabah: e.target.value })}
                            className={"w-full px-4 py-2.5 rounded-xl border bg-[#f4f3ea] text-xs font-medium text-[#121e14] focus:outline-none focus:ring-2 focus:ring-[#15291b] " + (
                                isGabahOver ? 'border-red-400 ring-1 ring-red-400' : isGabahUnder ? 'border-amber-400 ring-1 ring-amber-400' : 'border-[#e2e0d4]'
                            )}
                            placeholder="Rp"
                        />
                        {isGabahOver && (
                            <p className="text-[10px] text-red-700 font-bold mt-1 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> Melebihi HPP (Max Rp {gabahMax.toLocaleString('id-ID')})
                            </p>
                        )}
                        {isGabahUnder && (
                            <p className="text-[10px] text-amber-700 font-bold mt-1 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> Di bawah HPP (Min Rp {gabahMin.toLocaleString('id-ID')})
                            </p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#121e14] mb-1.5">
                            Periode
                        </label>
                        <select
                            value={formData.kuartal}
                            onChange={(e) => onChange({ ...formData, kuartal: e.target.value as Kuartal })}
                            className="w-full px-4 py-2.5 rounded-xl border border-[#e2e0d4] bg-[#f4f3ea] text-xs font-medium text-[#121e14] focus:outline-none focus:ring-2 focus:ring-[#15291b]"
                        >
                            <option value="Q1">Periode 1 (Jan-Mar)</option>
                            <option value="Q2">Periode 2 (Apr-Jun)</option>
                            <option value="Q3">Periode 3 (Jul-Sep)</option>
                            <option value="Q4">Periode 4 (Okt-Des)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#121e14] mb-1.5">
                            Total Panen (Kg)
                        </label>
                        <input
                            type="number"
                            value={formData.totalPanen}
                            onChange={(e) => onChange({ ...formData, totalPanen: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl border border-[#e2e0d4] bg-[#f4f3ea] text-xs font-medium text-[#121e14] focus:outline-none focus:ring-2 focus:ring-[#15291b]"
                            placeholder="Kg (Opsional)"
                        />
                    </div>
                </div>

                <div className="pt-4 flex gap-3">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-forest flex-1 py-3 text-xs font-bold uppercase tracking-wider justify-center disabled:opacity-50"
                    >
                        <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Data'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
