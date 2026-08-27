import React from 'react';
import { Filter } from 'lucide-react';
import { DUSUN_NAMES } from '@/app/lib/constants';

interface DusunFilterBarProps {
    selectedDusun: number | 'ALL';
    onSelectDusun: (dusun: number | 'ALL') => void;
    totalRecords: number;
}

export function DusunFilterBar({ selectedDusun, onSelectDusun, totalRecords }: DusunFilterBarProps) {
    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-[#e2e0d4] shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold text-[#121e14]">
                <Filter className="w-4 h-4 text-[#15291b]" />
                <span>Filter Dusun:</span>
            </div>
            <div className="flex flex-wrap gap-2">
                <button
                    type="button"
                    onClick={() => onSelectDusun('ALL')}
                    className={"px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all " + (
                        selectedDusun === 'ALL'
                            ? 'bg-[#15291b] text-[#d6f837] shadow-sm'
                            : 'bg-[#f4f3ea] text-[#121e14]/70 hover:bg-[#e2e0d4]'
                    )}
                >
                    Semua Dusun ({totalRecords})
                </button>
                {[1, 2, 3, 4].map((d) => (
                    <button
                        key={d}
                        type="button"
                        onClick={() => onSelectDusun(d)}
                        className={"px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all " + (
                            selectedDusun === d
                                ? 'bg-[#15291b] text-[#d6f837] shadow-sm'
                                : 'bg-[#f4f3ea] text-[#121e14]/70 hover:bg-[#e2e0d4]'
                        )}
                    >
                        Dusun {DUSUN_NAMES[d] || d}
                    </button>
                ))}
            </div>
        </div>
    );
}
