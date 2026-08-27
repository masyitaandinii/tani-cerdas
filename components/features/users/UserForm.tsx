import React from 'react';
import { UserPlus } from 'lucide-react';
import { UserFormData } from '@/types';
import { DUSUN_NAMES } from '@/app/lib/constants';

interface UserFormProps {
    formData: UserFormData;
    onChange: (data: UserFormData) => void;
    onSubmit: (e: React.FormEvent) => void;
    isSubmitting: boolean;
    role: string;
    assignedDusun?: number;
}

export function UserForm({
    formData,
    onChange,
    onSubmit,
    isSubmitting,
    role,
    assignedDusun = 1,
}: UserFormProps) {
    return (
        <div className="bg-white rounded-[1.75rem] border border-[#e2e0d4] shadow-sm overflow-hidden">
            <div className="bg-[#121e14] p-5 border-b border-white/10 text-white">
                <h3 className="font-bold flex items-center text-white text-base">
                    <UserPlus className="w-5 h-5 mr-2 stroke-[2.5]" />
                    {role === 'admin' ? 'Tambah Mitra Tengkulak' : 'Tambah Pengguna Sistem'}
                </h3>
                <p className="text-[11px] text-white/70 mt-1 ml-7">
                    {role === 'admin'
                        ? 'Daftarkan akun tengkulak baru untuk Dusun ' + (DUSUN_NAMES[assignedDusun] || assignedDusun) + '.'
                        : 'Buat akun Admin Dusun atau Mitra Tengkulak baru.'}
                </p>
            </div>

            <form onSubmit={onSubmit} className="p-6 space-y-4">
                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#121e14] mb-1.5">
                        Username
                    </label>
                    <input
                        type="text"
                        required
                        value={formData.username}
                        onChange={(e) => onChange({ ...formData, username: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-[#e2e0d4] bg-[#f4f3ea] text-xs font-medium text-[#121e14] focus:outline-none focus:ring-2 focus:ring-[#15291b]"
                        placeholder="Username untuk login"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#121e14] mb-1.5">
                        Password
                    </label>
                    <input
                        type="password"
                        required
                        value={formData.password || ''}
                        onChange={(e) => onChange({ ...formData, password: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-[#e2e0d4] bg-[#f4f3ea] text-xs font-medium text-[#121e14] focus:outline-none focus:ring-2 focus:ring-[#15291b]"
                        placeholder="••••••••"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#121e14] mb-1.5">
                        Nama Lengkap
                    </label>
                    <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => onChange({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-[#e2e0d4] bg-[#f4f3ea] text-xs font-medium text-[#121e14] focus:outline-none focus:ring-2 focus:ring-[#15291b]"
                        placeholder="Nama Pengguna"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#121e14] mb-1.5">
                        Nomor WhatsApp (Opsional)
                    </label>
                    <input
                        type="tel"
                        value={formData.whatsapp || ''}
                        onChange={(e) => onChange({ ...formData, whatsapp: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-[#e2e0d4] bg-[#f4f3ea] text-xs font-medium text-[#121e14] focus:outline-none focus:ring-2 focus:ring-[#15291b]"
                        placeholder="Contoh: 08123456789"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#121e14] mb-1.5">
                            Peran / Role
                        </label>
                        <select
                            value={formData.role}
                            onChange={(e) => onChange({ ...formData, role: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl border border-[#e2e0d4] bg-[#f4f3ea] text-xs font-medium text-[#121e14] focus:outline-none focus:ring-2 focus:ring-[#15291b]"
                            disabled={role === 'admin'}
                        >
                            {role === 'superadmin' && <option value="admin">Admin Dusun</option>}
                            <option value="tengkulak">Tengkulak</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#121e14] mb-1.5">
                            Dusun
                        </label>
                        <select
                            value={formData.assignedDusun}
                            onChange={(e) => onChange({ ...formData, assignedDusun: Number(e.target.value) })}
                            className="w-full px-4 py-2.5 rounded-xl border border-[#e2e0d4] bg-[#f4f3ea] text-xs font-medium text-[#121e14] focus:outline-none focus:ring-2 focus:ring-[#15291b]"
                            disabled={role === 'admin'}
                        >
                            {role === 'superadmin' ? (
                                <>
                                    <option value={1}>Dusun {DUSUN_NAMES[1]}</option>
                                    <option value={2}>Dusun {DUSUN_NAMES[2]}</option>
                                    <option value={3}>Dusun {DUSUN_NAMES[3]}</option>
                                    <option value={4}>Dusun {DUSUN_NAMES[4]}</option>
                                </>
                            ) : (
                                <option value={assignedDusun}>Dusun {DUSUN_NAMES[assignedDusun] || assignedDusun}</option>
                            )}
                        </select>
                    </div>
                </div>

                <div className="pt-4 flex gap-3">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-forest flex-1 py-3 text-xs font-bold uppercase tracking-wider justify-center disabled:opacity-50"
                    >
                        <span>{isSubmitting ? 'Menyimpan...' : 'Buat Akun'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
