import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { TengkulakRecord, PriceBenchmark } from '@/types';
import { DUSUN_NAMES, GOVERNMENT_PRICE_BENCHMARKS } from '@/app/lib/constants';

interface RecordTableProps {
    records: TengkulakRecord[];
    isLoading: boolean;
    benchmarks?: PriceBenchmark;
    onEdit: (record: TengkulakRecord) => void;
    onDelete: (record: TengkulakRecord) => void;
}

export function RecordTable({ records, isLoading, benchmarks, onEdit, onDelete }: RecordTableProps) {
    if (isLoading) {
        return (
            <div className="p-12 text-center text-[#121e14]/50 animate-pulse text-xs font-bold bg-white rounded-[1.75rem] border border-[#e2e0d4]">
                Memuat data panen...
            </div>
        );
    }

    if (records.length === 0) {
        return (
            <div className="p-12 text-center text-[#121e14]/50 text-sm bg-white rounded-[1.75rem] border border-[#e2e0d4]">
                Belum ada data panen yang tercatat.
            </div>
        );
    }

    const berasMin = benchmarks?.beras?.min || GOVERNMENT_PRICE_BENCHMARKS.beras.min;
    const berasMax = benchmarks?.beras?.max || GOVERNMENT_PRICE_BENCHMARKS.beras.max;
    const gabahMin = benchmarks?.gabah?.min || GOVERNMENT_PRICE_BENCHMARKS.gabah.min;
    const gabahMax = benchmarks?.gabah?.max || GOVERNMENT_PRICE_BENCHMARKS.gabah.max;

    return (
        <div className="bg-white rounded-[1.75rem] border border-[#e2e0d4] shadow-sm overflow-hidden">
            <div className="p-6 border-b border-[#e2e0d4] flex justify-between items-center bg-[#f4f3ea]">
                <div>
                    <h3 className="font-bold text-base text-[#121e14]">
                        Tabel Seluruh Data Panen (Terbaru)
                    </h3>
                    <p className="text-xs text-[#121e14]/60">
                        Total {records.length} data transaksi panen tercatat di sistem.
                    </p>
                </div>
                <div className="bg-[#15291b] text-[#d6f837] px-3.5 py-1 rounded-full text-xs font-bold">
                    {records.length} Data
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap">
                    <thead>
                        <tr className="text-[11px] uppercase tracking-wider text-[#121e14]/60 bg-[#f4f3ea]">
                            <th className="px-6 py-4 font-bold">Tanggal</th>
                            <th className="px-6 py-4 font-bold">Nama Tengkulak</th>
                            <th className="px-6 py-4 font-bold">Dusun</th>
                            <th className="px-6 py-4 font-bold">Harga Beras</th>
                            <th className="px-6 py-4 font-bold">Harga Gabah</th>
                            <th className="px-6 py-4 font-bold">Total Panen</th>
                            <th className="px-6 py-4 font-bold">Status Bapanas</th>
                            <th className="px-6 py-4 font-bold text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e2e0d4]">
                        {records.map((r) => {
                            const isOver = r.hargaBeras > berasMax || r.hargaGabah > gabahMax;
                            const isUnder = r.hargaBeras < berasMin || r.hargaGabah < gabahMin;

                            return (
                                <tr
                                    key={r.id}
                                    className="hover:bg-[#f4f3ea]/60 transition-colors text-xs font-semibold"
                                >
                                    <td className="px-6 py-4 text-[#121e14]/70">
                                        {new Date(r.timestamp).toLocaleDateString('id-ID', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric',
                                        })}
                                    </td>
                                    <td className="px-6 py-4 font-bold text-sm text-[#121e14]">
                                        {r.nama}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="bg-[#f4f3ea] text-[#121e14] px-2.5 py-1 rounded-md text-[11px] font-bold border border-[#e2e0d4]">
                                            Dusun {DUSUN_NAMES[r.dusun] || r.dusun}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-[#15291b] font-bold">
                                        Rp {r.hargaBeras.toLocaleString('id-ID')}
                                    </td>
                                    <td className="px-6 py-4 text-[#15291b] font-bold">
                                        Rp {r.hargaGabah.toLocaleString('id-ID')}
                                    </td>
                                    <td className="px-6 py-4 text-[#121e14]">
                                        {r.totalPanen ? (
                                            <span className="font-extrabold text-emerald-800">
                                                {r.totalPanen >= 1000
                                                    ? (r.totalPanen / 1000).toLocaleString('id-ID', {
                                                          maximumFractionDigits: 1,
                                                      }) + ' Ton'
                                                    : r.totalPanen.toLocaleString('id-ID') + ' Kg'}
                                            </span>
                                        ) : (
                                            '-'
                                        )}
                                    </td>
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
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => onEdit(r)}
                                                className="p-2 rounded-lg bg-[#f4f3ea] text-[#15291b] hover:bg-[#15291b] hover:text-[#d6f837] transition-all"
                                                title="Edit Data"
                                            >
                                                <Pencil className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => onDelete(r)}
                                                className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all"
                                                title="Hapus Data"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
