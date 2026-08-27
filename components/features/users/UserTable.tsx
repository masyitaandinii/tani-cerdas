import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { AppUser } from '@/types';
import { DUSUN_NAMES } from '@/app/lib/constants';
import { Badge } from '@/components/ui/Badge';

interface UserTableProps {
    users: AppUser[];
    isLoading: boolean;
    onEdit: (user: AppUser) => void;
    onDelete: (user: AppUser) => void;
    role: string;
}

export function UserTable({ users, isLoading, onEdit, onDelete, role }: UserTableProps) {
    if (isLoading) {
        return (
            <div className="p-12 text-center text-[#121e14]/50 animate-pulse text-xs font-bold bg-white rounded-[1.75rem] border border-[#e2e0d4]">
                Memuat daftar pengguna...
            </div>
        );
    }

    if (users.length === 0) {
        return (
            <div className="p-12 text-center text-[#121e14]/50 text-sm bg-white rounded-[1.75rem] border border-[#e2e0d4]">
                Belum ada akun terdaftar.
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[1.75rem] border border-[#e2e0d4] shadow-sm overflow-hidden">
            <div className="p-6 border-b border-[#e2e0d4] flex justify-between items-center bg-[#f4f3ea]">
                <div>
                    <h3 className="font-bold text-base text-[#121e14]">
                        Tabel Seluruh Pengguna Sistem (Terbaru)
                    </h3>
                    <p className="text-xs text-[#121e14]/60">
                        Daftar akun Admin Dusun dan Mitra Tengkulak terdaftar.
                    </p>
                </div>
                <div className="bg-[#15291b] text-[#d6f837] px-3.5 py-1 rounded-full text-xs font-bold">
                    {users.length} Akun
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap">
                    <thead>
                        <tr className="text-[11px] uppercase tracking-wider text-[#121e14]/60 bg-[#f4f3ea]">
                            <th className="px-6 py-4 font-bold">Username & Nama</th>
                            <th className="px-6 py-4 font-bold">No. WhatsApp</th>
                            <th className="px-6 py-4 font-bold">Peran / Role</th>
                            <th className="px-6 py-4 font-bold">Dusun</th>
                            <th className="px-6 py-4 font-bold text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e2e0d4]">
                        {users.map((u) => (
                            <tr
                                key={u.id}
                                className="hover:bg-[#f4f3ea]/60 transition-colors text-xs font-semibold"
                            >
                                <td className="px-6 py-4">
                                    <div className="font-bold text-sm text-[#121e14]">{u.name}</div>
                                    <div className="text-[11px] text-[#121e14]/60 mt-0.5">@{u.username}</div>
                                </td>
                                <td className="px-6 py-4 text-[#121e14]">
                                    {u.whatsapp ? (
                                        <span className="font-mono text-xs font-semibold text-emerald-700">
                                            {u.whatsapp}
                                        </span>
                                    ) : (
                                        <span className="text-[11px] text-gray-400 italic">Belum diatur</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <Badge
                                        variant={
                                            u.role === 'superadmin'
                                                ? 'superadmin'
                                                : u.role === 'admin'
                                                ? 'admin'
                                                : 'tengkulak'
                                        }
                                    >
                                        {u.role}
                                    </Badge>
                                </td>
                                <td className="px-6 py-4 text-[#121e14]">
                                    {u.assignedDusun ? 'Dusun ' + (DUSUN_NAMES[u.assignedDusun] || u.assignedDusun) : '-'}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    {u.role !== 'superadmin' ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => onEdit(u)}
                                                className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all text-xs font-bold inline-flex items-center gap-1.5"
                                                title="Edit Akun"
                                            >
                                                <Pencil className="w-3.5 h-3.5" />
                                                <span>Edit</span>
                                            </button>
                                            <button
                                                onClick={() => onDelete(u)}
                                                className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all text-xs font-bold inline-flex items-center gap-1.5"
                                                title="Hapus Akun"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                                <span>Hapus</span>
                                            </button>
                                        </div>
                                    ) : (
                                        <span className="text-[10px] text-gray-400 font-bold">Utama</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
