import React, { Suspense } from "react";
import { AdminClient } from "./AdminClient";

export default function AdminPage() {
    return (
        <Suspense fallback={
            <div className="flex justify-center items-center min-h-screen bg-[#f4f3ea] text-[#121e14] font-bold animate-pulse text-xs">
                Memuat Portal Admin...
            </div>
        }>
            <AdminClient />
        </Suspense>
    );
}
