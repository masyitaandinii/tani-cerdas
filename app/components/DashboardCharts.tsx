"use client";

import React, { useMemo, useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { TengkulakRecord } from '../lib/data';
import { DUSUN_NAMES } from '../lib/constants';

interface DashboardChartsProps {
    filterLevel: "Desa" | "Dusun";
    selectedDusun: number;
    selectedKuartal: string;
}

export function DashboardCharts({ filterLevel, selectedDusun, selectedKuartal }: DashboardChartsProps) {
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
                    setError("Gagal memuat data grafik.");
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

    // Prepare data based on the filter logic
    const chartData = useMemo(() => {
        // 1. Filter by Kuartal (if selected is not ALL)
        let filtered = records;
        if (selectedKuartal !== "ALL") {
            filtered = filtered.filter(r => r.kuartal === selectedKuartal);
        }

        // 2. Aggregate or Breakdown
        if (filterLevel === "Desa") {
            // Aggregate data per Dusun
            const aggRecord: Record<number, { dName: string; count: number; totalBeras: number; totalGabah: number }> = {};
            [1, 2, 3, 4].forEach(d => {
                aggRecord[d] = { dName: `Dusun ${DUSUN_NAMES[d] || d}`, count: 0, totalBeras: 0, totalGabah: 0 };
            });

            filtered.forEach(r => {
                if (aggRecord[r.dusun]) {
                    aggRecord[r.dusun].count++;
                    aggRecord[r.dusun].totalBeras += r.hargaBeras;
                    aggRecord[r.dusun].totalGabah += r.hargaGabah;
                }
            });

            return Object.values(aggRecord).map(item => ({
                name: item.dName,
                "Harga Beras": item.count > 0 ? Math.round(item.totalBeras / item.count) : 0,
                "Harga Gabah": item.count > 0 ? Math.round(item.totalGabah / item.count) : 0,
            })).filter(item => item["Harga Beras"] > 0 || item["Harga Gabah"] > 0);

        } else {
            // Filter level is Dusun -> show inner data by Tengkulak instead
            const dusunRecords = filtered.filter(r => r.dusun === selectedDusun);
            return dusunRecords.map((r, i) => ({
                name: r.nama,
                "Harga Beras": r.hargaBeras,
                "Harga Gabah": r.hargaGabah,
            }));
        }
    }, [records, filterLevel, selectedDusun, selectedKuartal]);

    return (
        <div className="bg-white p-6 sm:p-8 rounded-[1.75rem] border border-[#e2e0d4] shadow-sm h-full flex flex-col justify-between">
            <div className="mb-6">
                <span className="badge-pill-light mb-2">
                    <span className="badge-bullet-dark"></span>
                    PERBANDINGAN HARGA
                </span>
                <h3 className="text-2xl font-bold text-[#121e14]">
                    Statistik Harga {filterLevel === "Desa" ? "Seluruh Dusun" : `di Dusun ${DUSUN_NAMES[selectedDusun] || selectedDusun}`}
                </h3>
                <p className="text-[#121e14]/60 text-xs sm:text-sm mt-1">
                    {filterLevel === "Desa"
                        ? "Rata-rata perbandingan harga beras dan gabah untuk setiap dusun di desa ini."
                        : "Rata-rata perbandingan harga beras dan gabah untuk setiap Tengkulak di dusun ini."}
                </p>
            </div>

            <div className="h-80 w-full">
                {error ? (
                    <div className="w-full h-full flex items-center justify-center text-red-500 bg-red-50 border-2 border-dashed border-red-200 rounded-2xl text-sm font-semibold">
                        {error}
                    </div>
                ) : loading ? (
                    <div className="w-full h-full flex items-center justify-center text-[#121e14]/50 border-2 border-dashed border-[#e2e0d4] rounded-2xl animate-pulse">
                        Memuat data grafik...
                    </div>
                ) : chartData.length === 0 ? (
                    <div className="w-full h-full flex items-center justify-center text-[#121e14]/50 border-2 border-dashed border-[#e2e0d4] rounded-2xl text-sm font-semibold">
                        Tidak ada data untuk filter tersebut.
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData}
                            margin={{
                                top: 20,
                                right: 20,
                                left: 20,
                                bottom: 5,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e0d4" />
                            <XAxis 
                                dataKey="name" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{fill: '#121e14', fontSize: 10, fontWeight: 700}}
                                interval={filterLevel === "Dusun" ? 0 : "preserveEnd"}
                                angle={filterLevel === "Dusun" ? -45 : 0}
                                textAnchor={filterLevel === "Dusun" ? "end" : "middle"}
                                height={filterLevel === "Dusun" ? 70 : 30}
                            />
                            <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `Rp ${val / 1000}k`} tick={{fill: '#121e14', fontSize: 11}} />
                            <Tooltip
                                cursor={{ fill: '#15291b', opacity: 0.05 }}
                                contentStyle={{ borderRadius: '14px', border: '1px solid #e2e0d4', boxShadow: '0 4px 15px rgba(0,0,0,0.06)' }}
                            />
                            <Legend wrapperStyle={{ paddingTop: '15px', fontSize: '12px', fontWeight: 'bold' }} />
                            <Bar dataKey="Harga Beras" fill="#15291b" radius={[8, 8, 0, 0]} />
                            <Bar dataKey="Harga Gabah" fill="#ca8a04" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}
