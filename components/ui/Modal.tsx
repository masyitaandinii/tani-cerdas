import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    children: React.ReactNode;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({ isOpen, onClose, title, description, children, maxWidth = 'md' }: ModalProps) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const maxWidthClass = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
    }[maxWidth];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in p-4 overflow-y-auto">
            <div
                role="dialog"
                aria-modal="true"
                className={"bg-white rounded-3xl p-6 sm:p-8 w-full " + maxWidthClass + " shadow-2xl border border-[#e2e0d4] relative animate-in zoom-in-95 duration-200 my-8"}
            >
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 p-2 rounded-full text-[#121e14]/50 hover:text-[#121e14] hover:bg-[#f4f3ea] transition-all"
                    aria-label="Tutup modal"
                >
                    <X className="w-4 h-4" />
                </button>
                {title && (
                    <div className="mb-6">
                        <h3 className="font-bold text-[#121e14] text-lg">{title}</h3>
                        {description && <p className="text-xs text-[#121e14]/60 mt-1">{description}</p>}
                    </div>
                )}
                {children}
            </div>
        </div>
    );
}
