import React from 'react';
import { User, LogOut } from 'lucide-react';
import { SessionUser } from '@/types';
import { DUSUN_NAMES } from '@/app/lib/constants';

interface PageHeaderProps {
    user: SessionUser;
    onLogout: () => void;
    title?: string;
    subtitle?: string;
}

export function PageHeader({ user, onLogout, title, subtitle }: PageHeaderProps) {
    const defaultTitle = user.role === 'superadmin'
        ? 'Panel Superadmin Desa'
        : user.role === 'admin'
        ? 'Dashboard Inputan Dusun ' + (DUSUN_NAMES[user.assignedDusun || 1] || user.assignedDusun)
        : 'Halo, ' + (user.name || 'Mitra Tengkulak');

    const defaultSubtitle = user.role === 'superadmin'
        ? 'Pusat Manajemen Data Seluruh Dusun & Akses Akun Desa Kedungrejo'
        : user.role === 'admin'
        ? 'Pengelolaan Data Panen & Akses Mitra Tengkulak Dusun ' + (DUSUN_NAMES[user.assignedDusun || 1] || user.assignedDusun)
        : 'Dusun ' + (DUSUN_NAMES[user.assignedDusun || 1] || user.assignedDusun) + ' • Tengkulak Partner';

    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-[1.75rem] border border-[#e2e0d4] shadow-sm">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#15291b] text-[#d6f837] rounded-2xl flex items-center justify-center font-bold shadow-sm">
                    <User className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                    <h1 className="text-xl sm:text-2xl font-extrabold text-[#121e14]">
                        {title || defaultTitle}
                    </h1>
                    <p className="text-[#121e14]/70 text-xs font-semibold mt-0.5">
                        {subtitle || defaultSubtitle}
                    </p>
                </div>
            </div>
            <button
                onClick={onLogout}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold bg-[#f4f3ea] border border-[#e2e0d4] rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all text-[#121e14] shadow-sm"
            >
                <LogOut className="w-4 h-4 stroke-[2.2]" />
                <span>Keluar</span>
            </button>
        </div>
    );
}
