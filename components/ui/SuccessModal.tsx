import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface SuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    message: string;
}

export function SuccessModal({ isOpen, onClose, title = 'Berhasil!', message }: SuccessModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center space-y-4 shadow-2xl border border-[#e2e0d4] animate-in zoom-in-95 duration-200">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
                </div>
                <h3 className="text-xl font-extrabold text-[#121e14]">{title}</h3>
                <p className="text-xs text-[#121e14]/70 leading-relaxed font-medium">{message}</p>
                <button
                    type="button"
                    onClick={onClose}
                    className="w-full py-3 bg-[#15291b] text-[#d6f837] text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#121e14] transition-all shadow-md mt-2"
                >
                    Selesai & Tutup
                </button>
            </div>
        </div>
    );
}
