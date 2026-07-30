"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { TengkulakRecord } from '../lib/data';
import { ArrowUpRight } from 'lucide-react';

interface Props {
    selectedKuartal?: string;
}

export function DusunDistributionCard({ selectedKuartal = "ALL" }: Props) {
    const [records, setRecords] = useState<TengkulakRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchRecords() {
            try {
                const res = await fetch('/api/records');
                if (res.ok) {
                    const data = await res.json();
                    setRecords(data);
                } else {
                    setError("Gagal memuat distribusi dusun.");
                }
            } catch (error) {
                console.error("Failed to fetch records:", error);
                setError("Terjadi kesalahan koneksi.");
            } finally {
                setLoading(false);
            }
        }
        fetchRecords();
    }, []);
    const currentYear = new Date().getFullYear();

    const distribution = useMemo(() => {
        const dusunTotals: Record<number, number> = {
            1: 0,
            2: 0,
            3: 0,
            4: 0
        };

        const filteredRecords = records.filter(r => {
            const isCurrentYear = new Date(r.timestamp).getFullYear() === currentYear;
            const matchesKuartal = selectedKuartal === "ALL" || r.kuartal === selectedKuartal;
            return isCurrentYear && matchesKuartal;
        });

        filteredRecords.forEach(r => {
            if (dusunTotals[r.dusun] !== undefined) {
                // Convert kg to ton (divide by 1000)
                dusunTotals[r.dusun] += (r.totalPanen || 0) / 1000;
            }
        });

        const dataList = [
            { id: 1, name: "Dusun 1", total: dusunTotals[1] },
            { id: 2, name: "Dusun 2", total: dusunTotals[2] },
            { id: 3, name: "Dusun 3", total: dusunTotals[3] },
            { id: 4, name: "Dusun 4", total: dusunTotals[4] },
        ];

        // Sort descending
        dataList.sort((a, b) => b.total - a.total);

        return dataList;
    }, [records, selectedKuartal, currentYear]);

    // Find max value to calculate percentage width
    const maxTotal = useMemo(() => {
        const max = Math.max(...distribution.map(d => d.total));
        return max > 0 ? max : 1;
    }, [distribution]);

    return (
        <div className="bg-white p-6 sm:p-8 rounded-[1.75rem] border border-[#e2e0d4] shadow-sm flex flex-col justify-between h-full">
            <div>
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <span className="badge-pill-light mb-2">
                            <span className="badge-bullet-dark"></span>
                            DISTRIBUSI DUSUN
                        </span>
                        <h3 className="text-xl sm:text-2xl font-bold text-[#121e14]">Distribusi Panen {currentYear}</h3>
                    </div>
                </div>
                
                <div className="space-y-6">
                    {error ? (
                        <div className="w-full py-8 flex items-center justify-center text-red-500 bg-red-50 border-2 border-dashed border-red-200 rounded-2xl text-sm font-semibold">
                            {error}
                        </div>
                    ) : loading ? (
                        <div className="w-full py-8 flex items-center justify-center text-[#121e14]/50 border-2 border-dashed border-[#e2e0d4] rounded-2xl animate-pulse">
                            Memuat data distribusi...
                        </div>
                    ) : distribution.every(d => d.total === 0) ? (
                        <div className="w-full py-8 flex flex-col items-center justify-center text-[#121e14]/50 border-2 border-dashed border-[#e2e0d4] rounded-2xl text-sm font-semibold">
                            <span>Belum ada data panen.</span>
                            <span className="text-xs font-normal mt-1 opacity-75">Tahun {currentYear} | {selectedKuartal === 'ALL' ? 'Semua Kuartal' : selectedKuartal}</span>
                        </div>
                    ) : (
                        distribution.map((item) => {
                            const widthPercent = (item.total / maxTotal) * 100;
                            
                            return (
                                <div key={item.id} className="group">
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-sm font-bold text-[#121e14]">{item.name}</span>
                                        <span className="text-sm font-extrabold text-[#15291b]">{item.total.toFixed(1)} Ton</span>
                                    </div>
                                    <div className="w-full h-3 bg-[#f4f3ea] rounded-full overflow-hidden border border-[#e2e0d4]">
                                        <div 
                                            className="h-full bg-[#15291b] rounded-full transition-all duration-1000 ease-out group-hover:bg-[#d6f837]"
                                            style={{ width: `${widthPercent}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            <button className="btn-forest w-full mt-8 py-3.5 text-xs uppercase tracking-wider justify-center">
                <span>Lihat Detail Lengkap</span>
                <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
            </button>
        </div>
    );
}
