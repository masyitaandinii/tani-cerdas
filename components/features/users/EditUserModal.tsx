import React from 'react';
import { Pencil } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { AppUser, EditUserFormData } from '@/types';

interface EditUserModalProps {
    user: AppUser | null;
    formData: EditUserFormData;
    onChange: (data: EditUserFormData) => void;
    onSubmit: (e: React.FormEvent) => void;
    onClose: () => void;
    isUpdating: boolean;
}

export function EditUserModal({
    user,
    formData,
    onChange,
    onSubmit,
    onClose,
    isUpdating,
}: EditUserModalProps) {
    if (!user) return null;

    return (
        <Modal isOpen={!!user} onClose={onClose}>
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                    <Pencil className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-bold text-[#121e14] text-lg">Edit Pengguna</h3>
                    <p className="text-xs text-[#121e14]/60">@{user.username}</p>
                </div>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
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
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#121e14] mb-1.5">
                        Nomor WhatsApp
                    </label>
                    <input
                        type="tel"
                        value={formData.whatsapp || ''}
                        onChange={(e) => onChange({ ...formData, whatsapp: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-[#e2e0d4] bg-[#f4f3ea] text-xs font-medium text-[#121e14] focus:outline-none focus:ring-2 focus:ring-[#15291b]"
                        placeholder="Contoh: 08123456789"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#121e14] mb-1.5">
                        Password Baru (Opsional)
                    </label>
                    <input
                        type="password"
                        value={formData.password || ''}
                        onChange={(e) => onChange({ ...formData, password: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-[#e2e0d4] bg-[#f4f3ea] text-xs font-medium text-[#121e14] focus:outline-none focus:ring-2 focus:ring-[#15291b]"
                        placeholder="Kosongkan jika tidak ingin mengubah password"
                    />
                </div>

                <div className="pt-2 flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-3 bg-[#f4f3ea] text-xs font-bold uppercase rounded-xl border border-[#e2e0d4] text-[#121e14] hover:bg-[#e2e0d4] transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        disabled={isUpdating}
                        className="btn-forest flex-1 py-3 text-xs font-bold uppercase tracking-wider justify-center disabled:opacity-50"
                    >
                        <span>{isUpdating ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                    </button>
                </div>
            </form>
        </Modal>
    );
}
