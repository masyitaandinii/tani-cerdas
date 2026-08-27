import React from 'react';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'warning' | 'danger' | 'info' | 'superadmin' | 'admin' | 'tengkulak';
    size?: 'sm' | 'md';
    className?: string;
}

export function Badge({ children, variant = 'primary', size = 'sm', className = '' }: BadgeProps) {
    const variantStyles: Record<string, string> = {
        primary: 'bg-[#15291b] text-[#d6f837]',
        secondary: 'bg-[#f4f3ea] text-[#121e14]/80 border border-[#e2e0d4]',
        warning: 'bg-amber-100 text-amber-900 border border-amber-300',
        danger: 'bg-red-100 text-red-800 border border-red-200',
        info: 'bg-blue-100 text-blue-800 border border-blue-200',
        superadmin: 'bg-amber-100 text-amber-800 font-bold uppercase',
        admin: 'bg-[#15291b] text-[#d6f837] font-bold uppercase',
        tengkulak: 'bg-blue-100 text-blue-800 font-bold uppercase',
    };

    const sizeStyles = {
        sm: 'px-2.5 py-0.5 text-[10px]',
        md: 'px-3 py-1 text-xs',
    }[size];

    return (
        <span className={"inline-flex items-center gap-1 rounded-md font-bold tracking-wide " + variantStyles[variant] + " " + sizeStyles + " " + className}>
            {children}
        </span>
    );
}
