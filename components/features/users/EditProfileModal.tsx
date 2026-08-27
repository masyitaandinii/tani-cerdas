"use client";

import React, { useState, useEffect } from 'react';
import { UserPen, Lock, Phone, User, AlertCircle } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { updateProfile } from '@/services/userService';

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: {
        id: string;
        name: string;
        whatsapp?: string;
        role?: string;
    } | null;
    onProfileUpdated: (updatedUser: { name: string; whatsapp?: string }) => void;
}

export function EditProfileModal({
    isOpen,
    onClose,
    user,
    onProfileUpdated,
}: EditProfileModalProps) {
    const [name, setName] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setWhatsapp(user.whatsapp || '');
            setPassword('');
            setConfirmPassword('');
            setError(null);
        }
    }, [user, isOpen]);

    if (!user) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!name.trim()) {
            setError('Nama lengkap tidak boleh kosong');
            return;
        }

        if (password && password.length < 4) {
            setError('Password minimal 4 karakter');
            return;
        }

        if (password && password !== confirmPassword) {
            setError('Konfirmasi password tidak cocok');
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await updateProfile(user.id, {
                name: name.trim(),
                whatsapp: whatsapp.trim(),
                password: password.trim() ? password.trim() : undefined,
            });

            if (res.success) {
                onProfileUpdated({
                    name: name.trim(),
                    whatsapp: whatsapp.trim(),
                });
                onClose();
            } else {
                setError(res.error || 'Gagal memperbarui profil.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 bg-[#15291b] text-[#d6f837] rounded-2xl flex items-center justify-center font-bold shadow-sm">
                    <UserPen className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                    <h3 className="font-extrabold text-[#121e14] text-lg">Edit Profil Pengguna</h3>
                    <p className="text-xs text-[#121e14]/60">
                        Perbarui informasi nama, nomor WhatsApp, atau kata sandi Anda.
                    </p>
                </div>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#121e14] mb-1.5 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#15291b]" />
                        <span>Nama Lengkap</span>
                    </label>
                    <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-[#e2e0d4] bg-[#f4f3ea] text-xs font-semibold text-[#121e14] focus:outline-none focus:ring-2 focus:ring-[#15291b]"
                        placeholder="Contoh: Budi Santoso"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#121e14] mb-1.5 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#15291b]" />
                        <span>Nomor WhatsApp (Opsional)</span>
                    </label>
                    <input
                        type="tel"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-[#e2e0d4] bg-[#f4f3ea] text-xs font-semibold text-[#121e14] focus:outline-none focus:ring-2 focus:ring-[#15291b]"
                        placeholder="Contoh: 081234567890"
                    />
                </div>

                <div className="pt-2 border-t border-[#e2e0d4] space-y-3">
                    <p className="text-[11px] font-bold text-[#121e14]/60 uppercase tracking-wider flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-[#15291b]" />
                        <span>Ubah Kata Sandi (Opsional)</span>
                    </p>

                    <div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-[#e2e0d4] bg-[#f4f3ea] text-xs font-semibold text-[#121e14] focus:outline-none focus:ring-2 focus:ring-[#15291b]"
                            placeholder="Password baru (kosongkan jika tidak diubah)"
                            autoComplete="new-password"
                        />
                    </div>

                    {password && (
                        <div>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-[#e2e0d4] bg-[#f4f3ea] text-xs font-semibold text-[#121e14] focus:outline-none focus:ring-2 focus:ring-[#15291b]"
                                placeholder="Ulangi password baru"
                                autoComplete="new-password"
                            />
                        </div>
                    )}
                </div>

                <div className="pt-4 flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-3 bg-[#f4f3ea] text-[#121e14] text-xs font-bold uppercase tracking-wider rounded-xl border border-[#e2e0d4] hover:bg-[#e2e0d4] transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-forest flex-1 py-3 text-xs font-bold uppercase tracking-wider justify-center disabled:opacity-50"
                    >
                        <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Profil'}</span>
                    </button>
                </div>
            </form>
        </Modal>
    );
}
