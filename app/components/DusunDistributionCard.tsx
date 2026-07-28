"use client";

import React, { useMemo } from 'react';
import { TengkulakRecord } from '../lib/data';
import { ArrowUpRight } from 'lucide-react';

interface Props {
    records: TengkulakRecord[];
}

export function DusunDistributionCard({ records }: Props) {
    const distribution = useMemo(() => {
        const dusunTotals: Record<number, number> = {
            1: 0,
            2: 0,
            3: 0,
            4: 0
        };

        records.forEach(r => {
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
    }, [records]);

    // Find max value to calculate percentage width
    const maxTotal = useMemo(() => {
        const max = Math.max(...distribution.map(d => d.total));
        return max > 0 ? max : 1;
    }, [distribution]);

    return (
        <div className="bg-white p-6 sm:p-8 rounded-[1.75rem] border border-[#e2e0d4] shadow-sm flex flex-col justify-between h-full">
            <div>
                <span className="badge-pill-light mb-2">
                    <span className="badge-bullet-dark"></span>
                    DISTRIBUSI DUSUN
                </span>
                <h3 className="text-2xl font-bold mb-6 text-[#121e14]">Distribusi Panen Per Dusun</h3>
                
                <div className="space-y-6">
                    {distribution.map((item) => {
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
                    })}
                </div>
            </div>

            <button className="btn-forest w-full mt-8 py-3.5 text-xs uppercase tracking-wider justify-center">
                <span>Lihat Detail Lengkap</span>
                <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
            </button>
        </div>
    );
}
