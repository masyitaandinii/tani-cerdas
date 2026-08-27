import React from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    isDanger?: boolean;
    isLoading?: boolean;
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Ya, Lanjutkan',
    cancelText = 'Batal',
    isDanger = true,
    isLoading = false,
}: ConfirmModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full text-center space-y-4 shadow-2xl border border-[#e2e0d4] animate-in zoom-in-95 duration-200">
                <div
                    className={"w-12 h-12 rounded-full flex items-center justify-center mx-auto text-xl font-bold " + (
                        isDanger ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                    )}
                >
                    {isDanger ? <Trash2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                </div>
                <h3 className="text-lg font-bold text-[#121e14]">{title}</h3>
                <div className="text-xs text-[#121e14]/70 leading-relaxed">{message}</div>
                <div className="flex gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 py-3 bg-[#f4f3ea] text-xs font-bold uppercase rounded-xl border border-[#e2e0d4] text-[#121e14] hover:bg-[#e2e0d4] transition-colors disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={"flex-1 py-3 text-white text-xs font-bold uppercase rounded-xl transition-colors disabled:opacity-50 " + (
                            isDanger ? 'bg-red-600 hover:bg-red-700' : 'btn-forest'
                        )}
                    >
                        {isLoading ? 'Memproses...' : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
