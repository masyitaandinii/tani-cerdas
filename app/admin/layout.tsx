"use client";

import React from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-[#f4f3ea] text-[#121e14] flex flex-col selection:bg-[#d6f837] selection:text-[#121e14]">
            {children}
        </div>
    );
}
