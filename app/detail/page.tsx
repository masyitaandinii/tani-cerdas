"use client";

import React, { useState, useEffect } from "react";
import { TengkulakRecord, Kuartal } from "../lib/data";
import {
    PlusCircle,
    LogOut,
    User as UserIcon,
    Pencil,
    Trash2,
    CheckCircle2,
    Filter,
    Lock,
    LogIn,
} from "lucide-react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "../components/Navbar";
import { DUSUN_NAMES } from "../lib/constants";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

interface AppUser {
    id: string;
    username: string;
    name: string;
    role: string;
    assignedDusun?: number;
    createdAt?: string;
}

export default function InputDashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const activeUser = session?.user
        ? {
            name: session.user.name || "Pengguna",
            role: session.user.role,
            assignedDusun: session.user.assignedDusun,
        }
        : null;

    // Success Modal State
    const [successModal, setSuccessModal] = useState<{
        open: boolean;
        title?: string;
        message: string;
    }>({ open: false, message: "" });

    // Data Panen Form & Records State
    const [formData, setFormData] = useState({
        nama: "",
        dusun: 1,
        hargaBeras: "",
        hargaGabah: "",
        kuartal: "Q1" as Kuartal,
        totalPanen: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [records, setRecords] = useState<TengkulakRecord[]>([]);

    const [addSuggestions, setAddSuggestions] = useState<string[]>([]);
    const [editSuggestions, setEditSuggestions] = useState<string[]>([]);
    const [showAddSuggestions, setShowAddSuggestions] = useState(false);
    const [showEditSuggestions, setShowEditSuggestions] = useState(false);

    const searchTengkulak = async (query: string, isEdit: boolean, dusun: number, controller?: AbortController) => {
        if (!query.trim()) {
            if (isEdit) setEditSuggestions([]);
            else setAddSuggestions([]);
            return;
        }

        try {
            const res = await fetch(`/api/tengkulak/search?q=${encodeURIComponent(query)}&dusun=${dusun}`, {
                signal: controller?.signal
            });
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const names = data.map((u: any) => u.name);
                    if (isEdit) setEditSuggestions(names);
                    else setAddSuggestions(names);
                }
            }
        } catch (error) {
            console.error("Failed to search tengkulak names:", error);
        }
    };

    // Edit & Delete Record States
    const [editingRecord, setEditingRecord] = useState<TengkulakRecord | null>(null);
    const [editFormData, setEditFormData] = useState({
        nama: "",
        dusun: 1,
        hargaBeras: "",
        hargaGabah: "",
        kuartal: "Q1" as Kuartal,
        totalPanen: "",
    });
    const [isUpdatingRecord, setIsUpdatingRecord] = useState(false);
    const [deletingRecord, setDeletingRecord] = useState<TengkulakRecord | null>(null);

    useEffect(() => {
        if (showAddSuggestions) {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => searchTengkulak(formData.nama, false, formData.dusun, controller), 300);
            return () => {
                clearTimeout(timeoutId);
                controller.abort();
            };
        }
    }, [formData.nama, formData.dusun, showAddSuggestions]);

    useEffect(() => {
        if (showEditSuggestions) {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => searchTengkulak(editFormData.nama, true, editFormData.dusun, controller), 300);
            return () => {
                clearTimeout(timeoutId);
                controller.abort();
            };
        }
    }, [editFormData.nama, editFormData.dusun, showEditSuggestions]);

    // Superadmin Dusun Filter State
    const [selectedDusunFilter, setSelectedDusunFilter] = useState<number | "ALL">("ALL");

    // Superadmin User Management States
    const [userFormData, setUserFormData] = useState({
        username: "",
        password: "",
        name: "",
        role: "admin",
        assignedDusun: 1,
    });
    const [isSubmittingUser, setIsSubmittingUser] = useState(false);
    const [activeTab, setActiveTab] = useState<"data" | "user">("data");
    const [usersList, setUsersList] = useState<AppUser[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [deletingUser, setDeletingUser] = useState<AppUser | null>(null);

    // Redirect to login page if unauthenticated
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/admin");
        }
    }, [status, router]);

    const fetchRecords = async () => {
        try {
            const res = await fetch("/api/records");
            if (res.ok) {
                const data: TengkulakRecord[] = await res.json();
                // Ensure records are sorted by timestamp descending (newest first)
                const sorted = [...data].sort(
                    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                );
                setRecords(sorted);
            }
        } catch (error) {
            console.error("Failed to fetch records:", error);
        }
    };

    const fetchUsers = async () => {
        if (activeUser?.role !== "superadmin") return;
        setLoadingUsers(true);
        try {
            const res = await fetch("/api/users?limit=100");
            if (res.ok) {
                const resData = await res.json();
                const uList: AppUser[] = resData.data || [];
                // Ensure users are sorted by createdAt descending (newest first)
                const sorted = [...uList].sort((a, b) => {
                    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                    return timeB - timeA;
                });
                setUsersList(sorted);
            }
        } catch (error) {
            console.error("Failed to fetch users:", error);
        } finally {
            setLoadingUsers(false);
        }
    };

    useEffect(() => {
        if (session?.user) {
            fetchRecords();
            if (session.user.role === "superadmin") {
                fetchUsers();
            }
        }
    }, [session?.user]);

    const handleLogout = () => {
        signOut({ callbackUrl: "/admin" });
    };

    const handleAdminSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (
            !activeUser ||
            (activeUser.role !== "admin" && activeUser.role !== "superadmin")
        )
            return;

        const b = Number(formData.hargaBeras);
        const g = Number(formData.hargaGabah);
        const p = Number(formData.totalPanen);

        if (b <= 0 || g <= 0 || p <= 0) {
            alert(
                "Harga beras, harga gabah, dan total panen harus berupa angka lebih dari 0."
            );
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch("/api/records", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nama: formData.nama,
                    dusun:
                        activeUser.role === "superadmin"
                            ? Number(formData.dusun)
                            : activeUser.assignedDusun || 1,
                    hargaBeras: Number(formData.hargaBeras),
                    hargaGabah: Number(formData.hargaGabah),
                    kuartal: formData.kuartal,
                    totalPanen: Number(formData.totalPanen),
                }),
            });

            if (res.ok) {
                setFormData({
                    nama: "",
                    dusun: 1,
                    hargaBeras: "",
                    hargaGabah: "",
                    kuartal: "Q1",
                    totalPanen: "",
                });
                await fetchRecords();
                setSuccessModal({
                    open: true,
                    title: "Input Data Berhasil!",
                    message: "Data panen tengkulak baru telah berhasil ditambahkan ke database.",
                });
            } else {
                const err = await res.json();
                alert(`Gagal menyimpan data: ${err.error || "Unknown error"}`);
            }
        } catch (error) {
            console.error("Failed to submit record:", error);
            alert("Terjadi kesalahan koneksi saat menyimpan data.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Open Edit Modal
    const handleOpenEdit = (rec: TengkulakRecord) => {
        setEditingRecord(rec);
        setEditFormData({
            nama: rec.nama,
            dusun: rec.dusun,
            hargaBeras: String(rec.hargaBeras),
            hargaGabah: String(rec.hargaGabah),
            kuartal: rec.kuartal,
            totalPanen: String(rec.totalPanen),
        });
    };

    // Submit Edit Record
    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingRecord) return;

        setIsUpdatingRecord(true);
        try {
            const res = await fetch(`/api/records/${editingRecord.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nama: editFormData.nama,
                    dusun: Number(editFormData.dusun),
                    hargaBeras: Number(editFormData.hargaBeras),
                    hargaGabah: Number(editFormData.hargaGabah),
                    kuartal: editFormData.kuartal,
                    totalPanen: Number(editFormData.totalPanen),
                }),
            });

            if (res.ok) {
                setEditingRecord(null);
                await fetchRecords();
                setSuccessModal({
                    open: true,
                    title: "Perubahan Disimpan!",
                    message: "Data panen berhasil diperbarui.",
                });
            } else {
                const err = await res.json();
                alert(`Gagal memperbarui data: ${err.error || "Unknown error"}`);
            }
        } catch (err) {
            console.error("Failed to update record:", err);
            alert("Terjadi kesalahan saat memperbarui data.");
        } finally {
            setIsUpdatingRecord(false);
        }
    };

    // Confirm Delete Record
    const handleDeleteRecordConfirm = async () => {
        if (!deletingRecord) return;
        try {
            const res = await fetch(`/api/records/${deletingRecord.id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                setDeletingRecord(null);
                await fetchRecords();
                setSuccessModal({
                    open: true,
                    title: "Data Dihapus!",
                    message: "Data panen berhasil dihapus dari sistem.",
                });
            } else {
                const err = await res.json();
                alert(`Gagal menghapus data: ${err.error || "Unknown error"}`);
            }
        } catch (err) {
            console.error("Failed to delete record:", err);
            alert("Terjadi kesalahan saat menghapus data.");
        }
    };

    // Submit User Creation
    const handleUserSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeUser || activeUser.role !== "superadmin") return;

        setIsSubmittingUser(true);
        try {
            const res = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: userFormData.username,
                    password: userFormData.password,
                    name: userFormData.name,
                    role: userFormData.role,
                    assignedDusun: Number(userFormData.assignedDusun),
                }),
            });

            if (res.ok) {
                setUserFormData({
                    username: "",
                    password: "",
                    name: "",
                    role: "admin",
                    assignedDusun: 1,
                });
                await fetchUsers();
                setSuccessModal({
                    open: true,
                    title: "Akun Berhasil Dibuat!",
                    message: "Pengguna baru dapat langsung login menggunakan username dan password yang didaftarkan.",
                });
            } else {
                const err = await res.json();
                alert(`Gagal menambah pengguna: ${err.error || "Unknown error"}`);
            }
        } catch (error) {
            console.error("Failed to add user:", error);
            alert("Terjadi kesalahan koneksi saat menyimpan pengguna.");
        } finally {
            setIsSubmittingUser(false);
        }
    };

    // Confirm Delete User
    const handleDeleteUserConfirm = async () => {
        if (!deletingUser) return;
        try {
            const res = await fetch(`/api/users/${deletingUser.id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                setDeletingUser(null);
                await fetchUsers();
                setSuccessModal({
                    open: true,
                    title: "Akun Dihapus!",
                    message: `Akun pengguna ${deletingUser.username} telah dihapus dari sistem.`,
                });
            } else {
                const err = await res.json();
                alert(`Gagal menghapus pengguna: ${err.error || "Unknown error"}`);
            }
        } catch (err) {
            console.error("Failed to delete user:", err);
            alert("Terjadi kesalahan saat menghapus pengguna.");
        }
    };

    if (status === "loading") {
        return (
            <div className="min-h-screen bg-[#f4f3ea] text-[#121e14] flex flex-col">
                <Navbar />
                <div className="flex-1 flex justify-center items-center animate-pulse text-sm font-bold text-[#121e14]">
                    Memuat Halaman Inputan...
                </div>
            </div>
        );
    }

    // Protected Route: Require Authentication
    if (!session?.user || !activeUser) {
        return (
            <div className="min-h-screen bg-[#f4f3ea] text-[#121e14] flex flex-col selection:bg-[#d6f837] selection:text-[#121e14]">
                <Navbar />
                <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-10 flex flex-col items-center justify-center animate-in fade-in duration-500">
                    <div className="bg-white p-8 sm:p-10 rounded-[2rem] border border-[#e2e0d4] shadow-xl max-w-md w-full text-center space-y-6">
                        <div className="w-16 h-16 bg-[#15291b] text-[#d6f837] rounded-2xl flex items-center justify-center mx-auto shadow-md">
                            <Lock className="w-8 h-8 stroke-[2.5]" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-extrabold text-[#121e14]">
                                Akses Terbatas
                            </h2>
                            <p className="text-xs text-[#121e14]/70 leading-relaxed font-medium">
                                Halaman <strong>Input Data Panen & Manajemen Akun</strong> hanya dapat diakses oleh pengguna yang telah login. Silakan masuk terlebih dahulu.
                            </p>
                        </div>
                        <div className="pt-2 space-y-3">
                            <Link
                                href="/admin"
                                className="btn-forest w-full py-3.5 text-xs font-bold uppercase tracking-wider justify-center"
                            >
                                <LogIn className="w-4 h-4 stroke-[2.5]" />
                                <span>Masuk ke Portal Login</span>
                            </Link>
                            <Link
                                href="/"
                                className="inline-block text-xs font-bold text-[#121e14]/60 hover:text-[#121e14] transition-colors"
                            >
                                Kembali ke Beranda
                            </Link>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    // Role Tengkulak Dashboard View
    if (activeUser.role === "tengkulak") {
        const myRecords = records.filter(
            (r) => r.nama.toLowerCase() === activeUser.name.toLowerCase()
        ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        
        const totalPanenKu = myRecords.reduce(
            (acc, r) => acc + (r.totalPanen || 0),
            0
        );

        // Chart Data for Tengkulak
        const tengkulakChartData = ["Q1", "Q2", "Q3", "Q4"].map((k) => {
            const kRecs = myRecords.filter((r) => r.kuartal === k);
            const totalP = kRecs.reduce((acc, r) => acc + (r.totalPanen || 0), 0);
            const avgBeras = kRecs.length > 0 ? kRecs.reduce((acc, r) => acc + r.hargaBeras, 0) / kRecs.length : 0;
            return {
                kuartal: k.replace("Q", "Periode "),
                "Total Panen (Kg)": totalP,
                "Harga Beras": Math.round(avgBeras),
            };
        });

        return (
            <div className="min-h-screen bg-[#f4f3ea] text-[#121e14] flex flex-col selection:bg-[#d6f837] selection:text-[#121e14]">
                <Navbar />
                <main className="flex-1 w-full max-w-7xl mx-auto p-6 md:p-10 space-y-8 animate-in fade-in duration-500">
                    <div className="flex justify-between items-center bg-white p-6 rounded-[1.75rem] border border-[#e2e0d4] shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[#15291b] text-[#d6f837] rounded-2xl flex items-center justify-center font-bold">
                                <UserIcon className="w-6 h-6 stroke-[2.2]" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-extrabold text-[#121e14]">
                                    Halo, {activeUser.name}
                                </h1>
                                <p className="text-[#121e14]/70 text-xs font-semibold mt-0.5">
                                    Dusun {DUSUN_NAMES[activeUser.assignedDusun || 1] || activeUser.assignedDusun} • Tengkulak Partner
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold bg-[#f4f3ea] border border-[#e2e0d4] rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all text-[#121e14]"
                        >
                            <LogOut className="w-4 h-4 stroke-[2.2]" /> Keluar
                        </button>
                    </div>

                    {/* Stats cards for Tengkulak */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-[#15291b] p-6 rounded-[1.75rem] text-white shadow-lg md:col-span-1 border border-white/10 relative overflow-hidden flex flex-col justify-between">
                            <div>
                                <span className="badge-pill-dark text-[10px] mb-3">
                                    <span className="badge-bullet"></span> AKUMULASI PANEN
                                </span>
                                <h3 className="text-4xl font-extrabold text-[#d6f837] mt-2">
                                    {(totalPanenKu / 1000).toLocaleString("id-ID", {
                                        maximumFractionDigits: 1,
                                    })}{" "}
                                    <span className="text-lg text-white/80">Ton</span>
                                </h3>
                                <p className="text-xs text-white/60 mt-1">
                                    Total: {totalPanenKu.toLocaleString("id-ID")} Kg
                                </p>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-[1.75rem] border border-[#e2e0d4] shadow-sm md:col-span-2 flex flex-col justify-between">
                            <div>
                                <h3 className="font-bold text-lg text-[#121e14] mb-1">
                                    Ringkasan Setoran & Kemitraan
                                </h3>
                                <p className="text-xs text-[#121e14]/70 leading-relaxed">
                                    Anda tercatat memiliki <strong>{myRecords.length} transaksi setoran</strong> di Dusun {DUSUN_NAMES[activeUser.assignedDusun || 1] || activeUser.assignedDusun}. Jika ada ketidaksesuaian data, hubungi Admin Dusun setempat.
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#e2e0d4]">
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#121e14]/50">Total Setoran</span>
                                    <p className="text-base font-extrabold text-[#15291b]">{myRecords.length} Kali</p>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#121e14]/50">Dusun Mitra</span>
                                    <p className="text-base font-extrabold text-[#15291b]">Dusun {DUSUN_NAMES[activeUser.assignedDusun || 1] || activeUser.assignedDusun}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Grafik Track Record Tengkulak */}
                    <div className="bg-white p-6 sm:p-8 rounded-[1.75rem] border border-[#e2e0d4] shadow-sm">
                        <div className="mb-6">
                            <span className="badge-pill-light mb-2">
                                <span className="badge-bullet-dark"></span>
                                TRACK RECORD PANEN
                            </span>
                            <h3 className="text-xl font-bold text-[#121e14]">
                                Grafik Setoran Hasil Panen Anda per Periode
                            </h3>
                            <p className="text-xs text-[#121e14]/60 mt-1">
                                Visualisasi akumulasi panen (Kg) yang telah disetorkan.
                            </p>
                        </div>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={tengkulakChartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e0d4" />
                                    <XAxis dataKey="kuartal" tick={{ fill: "#121e14", fontSize: 11, fontWeight: 700 }} />
                                    <YAxis tickFormatter={(val) => `${val / 1000} Ton`} tick={{ fill: "#121e14", fontSize: 11 }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: "14px", border: "1px solid #e2e0d4" }}
                                        formatter={(val: unknown) => [`${Number(val).toLocaleString("id-ID")} Kg`, "Total Panen"]}
                                    />
                                    <Bar dataKey="Total Panen (Kg)" fill="#15291b" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Table for Tengkulak */}
                    <div className="bg-white rounded-[1.75rem] border border-[#e2e0d4] shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-[#e2e0d4] bg-[#f4f3ea]">
                            <h3 className="font-bold text-base text-[#121e14]">
                                Detail Riwayat Input Data Anda (Terbaru)
                            </h3>
                        </div>
                        {myRecords.length === 0 ? (
                            <div className="p-12 text-center text-[#121e14]/50 text-sm">
                                Belum ada riwayat data yang tercatat atas nama Anda.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left whitespace-nowrap">
                                    <thead>
                                        <tr className="text-[11px] uppercase tracking-wider text-[#121e14]/60 bg-[#f4f3ea]">
                                            <th className="px-6 py-4 font-bold">Tanggal</th>
                                            <th className="px-6 py-4 font-bold">Periode</th>
                                            <th className="px-6 py-4 font-bold">Harga Beras</th>
                                            <th className="px-6 py-4 font-bold">Harga Gabah</th>
                                            <th className="px-6 py-4 font-bold">Total Panen (Kg)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#e2e0d4]">
                                        {myRecords.map((r) => (
                                            <tr
                                                key={r.id}
                                                className="hover:bg-[#f4f3ea]/60 transition-colors text-xs font-semibold"
                                            >
                                                <td className="px-6 py-4 text-[#121e14]">
                                                    {new Date(r.timestamp).toLocaleDateString("id-ID")}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="bg-[#15291b] text-[#d6f837] px-2.5 py-1 rounded-md text-[10px] font-bold">
                                                        {r.kuartal ? r.kuartal.replace('Q', 'Periode ') : ''}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-[#121e14]">
                                                    Rp {r.hargaBeras.toLocaleString("id-ID")}
                                                </td>
                                                <td className="px-6 py-4 text-[#121e14]">
                                                    Rp {r.hargaGabah.toLocaleString("id-ID")}
                                                </td>
                                                <td className="px-6 py-4 font-bold text-[#15291b]">
                                                    {(r.totalPanen || 0).toLocaleString("id-ID")} Kg
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        );
    }

    // Filter active records for Admin / Superadmin (Sorted Newest First)
    const filteredRawRecords =
        activeUser.role === "superadmin"
            ? selectedDusunFilter === "ALL"
                ? records
                : records.filter((r) => r.dusun === Number(selectedDusunFilter))
            : records.filter((r) => r.dusun === activeUser.assignedDusun);

    const activeRecords = [...filteredRawRecords].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return (
        <div className="min-h-screen bg-[#f4f3ea] text-[#121e14] flex flex-col selection:bg-[#d6f837] selection:text-[#121e14]">
            <Navbar />
            <main className="flex-1 w-full max-w-7xl mx-auto p-6 md:p-10 space-y-8 animate-in fade-in duration-500">
                {/* Success Popup Modal */}
                {successModal.open && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in p-4">
                        <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center space-y-4 shadow-2xl border border-[#e2e0d4]">
                            <div className="w-16 h-16 bg-[#d6f837] text-[#15291b] rounded-full flex items-center justify-center mx-auto text-2xl font-bold shadow-md">
                                <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
                            </div>
                            <h3 className="text-xl font-extrabold text-[#121e14]">
                                {successModal.title || "Berhasil!"}
                            </h3>
                            <p className="text-sm text-[#121e14]/70 font-medium leading-relaxed">
                                {successModal.message}
                            </p>
                            <button
                                onClick={() => setSuccessModal({ open: false, message: "" })}
                                className="btn-forest w-full py-3 text-xs uppercase tracking-wider justify-center"
                            >
                                Selesai / Tutup
                            </button>
                        </div>
                    </div>
                )}

                {/* Edit Record Modal */}
                {editingRecord && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in p-4">
                        <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl border border-[#e2e0d4]">
                            <div className="flex justify-between items-center border-b border-[#e2e0d4] pb-4">
                                <h3 className="text-lg font-bold text-[#121e14] flex items-center gap-2">
                                    <Pencil className="w-5 h-5 text-[#15291b]" /> Edit Data Panen Tengkulak
                                </h3>
                                <button
                                    onClick={() => setEditingRecord(null)}
                                    className="text-gray-400 hover:text-gray-600 font-bold text-lg"
                                >
                                    ✕
                                </button>
                            </div>
                            <form onSubmit={handleEditSubmit} className="space-y-4">
                                <div className="relative">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-[#121e14] mb-1.5">
                                        Nama Tengkulak
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={editFormData.nama}
                                        onFocus={() => setShowEditSuggestions(true)}
                                        onBlur={() => setTimeout(() => setShowEditSuggestions(false), 200)}
                                        onChange={(e) => {
                                            setEditFormData({ ...editFormData, nama: e.target.value });
                                            setShowEditSuggestions(true);
                                        }}
                                        className="w-full px-4 py-2.5 rounded-xl border border-[#e2e0d4] bg-[#f4f3ea] text-xs font-medium text-[#121e14] focus:outline-none focus:ring-2 focus:ring-[#15291b]"
                                    />
                                    {showEditSuggestions && editSuggestions.length > 0 && (
                                        <ul className="absolute z-10 w-full mt-1 bg-white border border-[#e2e0d4] rounded-xl shadow-lg max-h-48 overflow-y-auto">
                                            {editSuggestions.map((name, idx) => (
                                                <li 
                                                    key={idx} 
                                                    onMouseDown={() => {
                                                        setEditFormData({ ...editFormData, nama: name });
                                                        setShowEditSuggestions(false);
                                                    }}
                                                    className="px-4 py-2 text-sm text-[#121e14] cursor-pointer hover:bg-[#f4f3ea] transition-colors"
                                                >
                                                    {name}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>

                                {activeUser.role === "superadmin" && (
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-[#121e14] mb-1.5">
                                            Dusun Target
                                        </label>
                                        <select
                                            value={editFormData.dusun}
                                            onChange={(e) =>
                                                setEditFormData({
                                                    ...editFormData,
                                                    dusun: Number(e.target.value),
                                                })
                                            }
                                            className="w-full px-4 py-2.5 rounded-xl border border-[#e2e0d4] bg-[#f4f3ea] text-xs font-medium text-[#121e14] focus:outline-none focus:ring-2 focus:ring-[#15291b]"
                                        >
                                            <option value={1}>Dusun 1</option>
                                            <option value={2}>Dusun 2</option>
                                            <option value={3}>Dusun 3</option>
                                            <option value={4}>Dusun 4</option>
                                        </select>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-[#121e14] mb-1.5">
                                            Harga Beras (Rp)
                                        </label>
                                        <input
                                            type="number"
                                            required
                                            value={editFormData.hargaBeras}
                                            onChange={(e) =>
                                                setEditFormData({
                                                    ...editFormData,
                                                    hargaBeras: e.target.value,
                                                })
                                            }
                                            className="w-full px-4 py-2.5 rounded-xl border border-[#e2e0d4] bg-[#f4f3ea] text-xs font-medium text-[#121e14] focus:outline-none focus:ring-2 focus:ring-[#15291b]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-[#121e14] mb-1.5">
                                            Harga Gabah (Rp)
                                        </label>
                                        <input
                                            type="number"
                                            required
                                            value={editFormData.hargaGabah}
                                            onChange={(e) =>
                                                setEditFormData({
                                                    ...editFormData,
                                                    hargaGabah: e.target.value,
                                                })
                                            }
                                            className="w-full px-4 py-2.5 rounded-xl border border-[#e2e0d4] bg-[#f4f3ea] text-xs font-medium text-[#121e14] focus:outline-none focus:ring-2 focus:ring-[#15291b]"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-[#121e14] mb-1.5">
                                            Periode Kuartal
                                        </label>
                                        <select
                                            value={editFormData.kuartal}
                                            onChange={(e) =>
                                                setEditFormData({
                                                    ...editFormData,
                                                    kuartal: e.target.value as Kuartal,
                                                })
                                            }
                                            className="w-full px-4 py-2.5 rounded-xl border border-[#e2e0d4] bg-[#f4f3ea] text-xs font-medium text-[#121e14] focus:outline-none focus:ring-2 focus:ring-[#15291b]"
                                        >
                                            <option value="Q1">Periode 1 (Jan-Mar)</option>
                                            <option value="Q2">Periode 2 (Apr-Jun)</option>
                                            <option value="Q3">Periode 3 (Jul-Sep)</option>
                                            <option value="Q4">Periode 4 (Okt-Des)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-[#121e14] mb-1.5">
                                            Total Panen (Kg)
                                        </label>
                                        <input
                                            type="number"
                                            required
                                            value={editFormData.totalPanen}
                                            onChange={(e) =>
                                                setEditFormData({
                                                    ...editFormData,
                                                    totalPanen: e.target.value,
                                                })
                                            }
                                            className="w-full px-4 py-2.5 rounded-xl border border-[#e2e0d4] bg-[#f4f3ea] text-xs font-medium text-[#121e14] focus:outline-none focus:ring-2 focus:ring-[#15291b]"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setEditingRecord(null)}
                                        className="flex-1 py-3 bg-[#f4f3ea] text-[#121e14] text-xs font-bold uppercase tracking-wider rounded-xl border border-[#e2e0d4]"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isUpdatingRecord}
                                        className="btn-forest flex-1 py-3 text-xs font-bold uppercase tracking-wider justify-center disabled:opacity-50"
                                    >
                                        <span>{isUpdatingRecord ? "Menyimpan..." : "Simpan Perubahan"}</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Delete Record Modal */}
                {deletingRecord && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in p-4">
                        <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full text-center space-y-4 shadow-2xl border border-[#e2e0d4]">
                            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                                <Trash2 className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-[#121e14]">Konfirmasi Hapus Data</h3>
                            <p className="text-xs text-[#121e14]/70 leading-relaxed">
                                Apakah Anda yakin ingin menghapus data panen atas nama <strong>{deletingRecord.nama}</strong>? Tindakan ini tidak dapat dibatalkan.
                            </p>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setDeletingRecord(null)}
                                    className="flex-1 py-3 bg-[#f4f3ea] text-xs font-bold uppercase rounded-xl border border-[#e2e0d4] text-[#121e14]"
                                >
                                    Batal
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDeleteRecordConfirm}
                                    className="flex-1 py-3 bg-red-600 text-white text-xs font-bold uppercase rounded-xl hover:bg-red-700 transition-colors"
                                >
                                    Ya, Hapus
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete User Modal */}
                {deletingUser && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in p-4">
                        <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full text-center space-y-4 shadow-2xl border border-[#e2e0d4]">
                            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                                <Trash2 className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-[#121e14]">Hapus Akun Pengguna</h3>
                            <p className="text-xs text-[#121e14]/70 leading-relaxed">
                                Apakah Anda yakin ingin menghapus akun <strong>{deletingUser.name} ({deletingUser.username})</strong>? Pengguna ini tidak akan dapat login lagi.
                            </p>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setDeletingUser(null)}
                                    className="flex-1 py-3 bg-[#f4f3ea] text-xs font-bold uppercase rounded-xl border border-[#e2e0d4] text-[#121e14]"
                                >
                                    Batal
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDeleteUserConfirm}
                                    className="flex-1 py-3 bg-red-600 text-white text-xs font-bold uppercase rounded-xl hover:bg-red-700 transition-colors"
                                >
                                    Ya, Hapus Akun
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Top Admin Header Bar */}
                <div className="flex justify-between items-center bg-white p-6 rounded-[1.75rem] border border-[#e2e0d4] shadow-sm">
                    <div>
                        <h1 className="text-2xl font-extrabold text-[#121e14] flex items-center gap-2">
                            Halo, {activeUser.name}
                            {activeUser.role === "superadmin" && (
                                <span className="text-xs bg-amber-100 text-amber-800 font-extrabold px-2.5 py-0.5 rounded-full border border-amber-300">
                                    Superadmin
                                </span>
                            )}
                        </h1>
                        <p className="text-[#121e14]/70 text-xs font-semibold mt-0.5">
                            {activeUser.role === "superadmin"
                                ? "Akses Pengelolaan Seluruh Dusun & Akses Pengguna"
                                : `Anda mengelola data untuk Dusun ${DUSUN_NAMES[activeUser.assignedDusun || 1] || activeUser.assignedDusun}.`}
                        </p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold bg-[#f4f3ea] border border-[#e2e0d4] rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all text-[#121e14]"
                    >
                        <LogOut className="w-4 h-4 stroke-[2.2]" /> Keluar
                    </button>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* Form Sidebar Section */}
                    <div className="xl:col-span-1">
                        <div className="bg-white rounded-[1.75rem] border border-[#e2e0d4] shadow-sm overflow-hidden sticky top-24">
                            {activeUser.role === "superadmin" && (
                                <div className="flex border-b border-[#e2e0d4]">
                                    <button
                                        onClick={() => setActiveTab("data")}
                                        className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider text-center transition-colors ${
                                            activeTab === "data"
                                                ? "bg-[#15291b] text-[#d6f837]"
                                                : "bg-[#f4f3ea] text-[#121e14]/60 hover:bg-[#e2e0d4]"
                                        }`}
                                        type="button"
                                    >
                                        Data Panen
                                    </button>
                                    <button
                                        onClick={() => {
                                            setActiveTab("user");
                                            fetchUsers();
                                        }}
                                        className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider text-center transition-colors ${
                                            activeTab === "user"
                                                ? "bg-[#15291b] text-[#d6f837]"
                                                : "bg-[#f4f3ea] text-[#121e14]/60 hover:bg-[#e2e0d4]"
                                        }`}
                                        type="button"
                                    >
                                        Manajemen Akun
                                    </button>
                                </div>
                            )}

                            {(activeTab === "data" || activeUser.role !== "superadmin") && (
                                <>
                                    <div className="bg-[#15291b] p-5 border-b border-white/10 text-white">
                                        <h3 className="font-bold flex items-center text-[#d6f837] text-base">
                                            <PlusCircle className="w-5 h-5 mr-2 stroke-[2.5]" />
                                            {"Tambah Data Tengkulak"}
                                        </h3>
                                        <p className="text-[11px] text-white/70 mt-1 ml-7">
                                            Menambah data ini otomatis mengupdate setoran Tengkulak tersebut.
                                        </p>
                                    </div>
                                    <form onSubmit={handleAdminSubmit} className="p-6 space-y-4">
                                        <div className="relative">
                                            <label className="block text-xs font-bold uppercase tracking-wider text-[#121e14] mb-1.5">
                                                Nama Tengkulak
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.nama}
                                                onFocus={() => setShowAddSuggestions(true)}
                                                onBlur={() => setTimeout(() => setShowAddSuggestions(false), 200)}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, nama: e.target.value });
                                                    setShowAddSuggestions(true);
                                                }}
                                                className="w-full px-4 py-2.5 rounded-xl border border-[#e2e0d4] bg-[#f4f3ea] text-xs font-medium text-[#121e14] focus:outline-none focus:ring-2 focus:ring-[#15291b]"
                                                placeholder="Masukkan nama lengkap"
                                            />
                                            {showAddSuggestions && addSuggestions.length > 0 && (
                                                <ul className="absolute z-10 w-full mt-1 bg-white border border-[#e2e0d4] rounded-xl shadow-lg max-h-48 overflow-y-auto">
                                                    {addSuggestions.map((name, idx) => (
                                                        <li 
                                                            key={idx} 
                                                            onMouseDown={() => {
                                                                setFormData({ ...formData, nama: name });
                                                                setShowAddSuggestions(false);
                                                            }}
                                                            className="px-4 py-2 text-sm text-[#121e14] cursor-pointer hover:bg-[#f4f3ea] transition-colors"
                                                        >
                                                            {name}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>

                                        {activeUser.role === "superadmin" && (
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-wider text-[#121e14] mb-1.5">
                                                    Dusun Target (Superadmin)
                                                </label>
                                                <select
                                                    value={formData.dusun}
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            dusun: Number(e.target.value),
                                                        })
                                                    }
                                                    className="w-full px-4 py-2.5 rounded-xl border border-[#e2e0d4] bg-[#f4f3ea] text-xs font-medium text-[#121e14] focus:outline-none focus:ring-2 focus:ring-[#15291b]"
                                                >
                                                    <option value={1}>Dusun 1</option>
                                                    <option value={2}>Dusun 2</option>
                                                    <option value={3}>Dusun 3</option>
                                                    <option value={4}>Dusun 4</option>
                                                </select>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-wider text-[#121e14] mb-1.5">
                                                    Harga Beras
                                                </label>
                                                <input
                                                    type="number"
                                                    required
                                                    value={formData.hargaBeras}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, hargaBeras: e.target.value })
                                                    }
                                                    className="w-full px-4 py-2.5 rounded-xl border border-[#e2e0d4] bg-[#f4f3ea] text-xs font-medium text-[#121e14] focus:outline-none focus:ring-2 focus:ring-[#15291b]"
                                                    placeholder="Rp / Kg"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-wider text-[#121e14] mb-1.5">
                                                    Harga Gabah
                                                </label>
                                                <input
                                                    type="number"
                                                    required
                                                    value={formData.hargaGabah}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, hargaGabah: e.target.value })
                                                    }
                                                    className="w-full px-4 py-2.5 rounded-xl border border-[#e2e0d4] bg-[#f4f3ea] text-xs font-medium text-[#121e14] focus:outline-none focus:ring-2 focus:ring-[#15291b]"
                                                    placeholder="Rp / Kg"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-wider text-[#121e14] mb-1.5">
                                                    Periode
                                                </label>
                                                <select
                                                    value={formData.kuartal}
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            kuartal: e.target.value as Kuartal,
                                                        })
                                                    }
                                                    className="w-full px-4 py-2.5 rounded-xl border border-[#e2e0d4] bg-[#f4f3ea] text-xs font-medium text-[#121e14] focus:outline-none focus:ring-2 focus:ring-[#15291b]"
                                                >
                                                    <option value="Q1">Periode 1 (Jan-Mar)</option>
                                                    <option value="Q2">Periode 2 (Apr-Jun)</option>
                                                    <option value="Q3">Periode 3 (Jul-Sep)</option>
                                                    <option value="Q4">Periode 4 (Okt-Des)</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-wider text-[#121e14] mb-1.5">
                                                    Total Panen
                                                </label>
                                                <input
                                                    type="number"
                                                    required
                                                    value={formData.totalPanen}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, totalPanen: e.target.value })
                                                    }
                                                    className="w-full px-4 py-2.5 rounded-xl border border-[#e2e0d4] bg-[#f4f3ea] text-xs font-medium text-[#121e14] focus:outline-none focus:ring-2 focus:ring-[#15291b]"
                                                    placeholder="Kg"
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-4 flex gap-3">
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="btn-forest flex-1 py-3 text-xs font-bold uppercase tracking-wider justify-center disabled:opacity-50"
                                            >
                                                <span>{isSubmitting ? "Menyimpan..." : "Simpan Data"}</span>
                                            </button>
                                        </div>
                                    </form>
                                </>
                            )}

                            {activeUser.role === "superadmin" && activeTab === "user" && (
                                <>
                                    <div className="bg-[#121e14] p-5 border-b border-white/10 text-white">
                                        <h3 className="font-bold flex items-center text-white text-base">
                                            <UserIcon className="w-5 h-5 mr-2 stroke-[2.5]" />
                                            {"Tambah Pengguna"}
                                        </h3>
                                        <p className="text-[11px] text-white/70 mt-1 ml-7">
                                            Buat akun Admin Dusun atau Tengkulak baru.
                                        </p>
                                    </div>
                                    <form onSubmit={handleUserSubmit} className="p-6 space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-[#121e14] mb-1.5">
                                                Username
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={userFormData.username}
                                                onChange={(e) =>
                                                    setUserFormData({
                                                        ...userFormData,
                                                        username: e.target.value,
                                                    })
                                                }
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
                                                value={userFormData.password}
                                                onChange={(e) =>
                                                    setUserFormData({
                                                        ...userFormData,
                                                        password: e.target.value,
                                                    })
                                                }
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
                                                value={userFormData.name}
                                                onChange={(e) =>
                                                    setUserFormData({ ...userFormData, name: e.target.value })
                                                }
                                                className="w-full px-4 py-2.5 rounded-xl border border-[#e2e0d4] bg-[#f4f3ea] text-xs font-medium text-[#121e14] focus:outline-none focus:ring-2 focus:ring-[#15291b]"
                                                placeholder="Nama Pengguna"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-wider text-[#121e14] mb-1.5">
                                                    Peran / Role
                                                </label>
                                                <select
                                                    value={userFormData.role}
                                                    onChange={(e) =>
                                                        setUserFormData({
                                                            ...userFormData,
                                                            role: e.target.value,
                                                        })
                                                    }
                                                    className="w-full px-4 py-2.5 rounded-xl border border-[#e2e0d4] bg-[#f4f3ea] text-xs font-medium text-[#121e14] focus:outline-none focus:ring-2 focus:ring-[#15291b]"
                                                >
                                                    <option value="admin">Admin Dusun</option>
                                                    <option value="tengkulak">Tengkulak</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-wider text-[#121e14] mb-1.5">
                                                    Dusun
                                                </label>
                                                <select
                                                    value={userFormData.assignedDusun}
                                                    onChange={(e) =>
                                                        setUserFormData({
                                                            ...userFormData,
                                                            assignedDusun: Number(e.target.value),
                                                        })
                                                    }
                                                    className="w-full px-4 py-2.5 rounded-xl border border-[#e2e0d4] bg-[#f4f3ea] text-xs font-medium text-[#121e14] focus:outline-none focus:ring-2 focus:ring-[#15291b]"
                                                >
                                                    <option value={1}>Dusun 1</option>
                                                    <option value={2}>Dusun 2</option>
                                                    <option value={3}>Dusun 3</option>
                                                    <option value={4}>Dusun 4</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="pt-4 flex gap-3">
                                            <button
                                                type="submit"
                                                disabled={isSubmittingUser}
                                                className="btn-forest flex-1 py-3 text-xs font-bold uppercase tracking-wider justify-center disabled:opacity-50"
                                            >
                                                <span>{isSubmittingUser ? "Menyimpan..." : "Buat Akun"}</span>
                                            </button>
                                        </div>
                                    </form>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Right Main Table Content Section */}
                    <div className="xl:col-span-2 space-y-8">
                        {/* View for Data Panen Tab */}
                        {(activeTab === "data" || activeUser.role !== "superadmin") && (
                            <div className="bg-white rounded-[1.75rem] border border-[#e2e0d4] shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-[#e2e0d4] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#f4f3ea]">
                                    <div>
                                        <h3 className="font-bold text-base text-[#121e14]">
                                            {activeUser.role === "superadmin"
                                                ? "Data Panen Seluruh Dusun (Terbaru)"
                                                : `Data Tengkulak Dusun ${activeUser.assignedDusun} (Terbaru)`}
                                        </h3>
                                        <p className="text-xs text-[#121e14]/60">
                                            Daftar riwayat yang terdaftar dalam sistem (diurutkan paling baru di atas).
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                                        {/* Option Filter by Dusun for Superadmin */}
                                        {activeUser.role === "superadmin" && (
                                            <div className="flex items-center gap-2">
                                                <Filter className="w-4 h-4 text-[#15291b]" />
                                                <select
                                                    value={selectedDusunFilter}
                                                    onChange={(e) =>
                                                        setSelectedDusunFilter(
                                                            e.target.value === "ALL"
                                                                ? "ALL"
                                                                : Number(e.target.value)
                                                        )
                                                    }
                                                    className="px-3 py-1.5 rounded-xl border border-[#e2e0d4] bg-white text-xs font-bold text-[#121e14] focus:outline-none focus:ring-2 focus:ring-[#15291b]"
                                                >
                                                    <option value="ALL">Semua Dusun</option>
                                                    <option value={1}>Dusun 1</option>
                                                    <option value={2}>Dusun 2</option>
                                                    <option value={3}>Dusun 3</option>
                                                    <option value={4}>Dusun 4</option>
                                                </select>
                                            </div>
                                        )}

                                        <div className="bg-[#15291b] text-[#d6f837] px-3.5 py-1 rounded-full text-xs font-bold shrink-0">
                                            {activeRecords.length} Data
                                        </div>
                                    </div>
                                </div>

                                {activeRecords.length === 0 ? (
                                    <div className="p-12 text-center text-[#121e14]/50 text-sm">
                                        <p>Belum ada data tengkulak di dusun ini.</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left whitespace-nowrap">
                                            <thead>
                                                <tr className="text-[11px] uppercase tracking-wider text-[#121e14]/60 bg-[#f4f3ea]">
                                                    <th className="px-6 py-4 font-bold">Nama & Dusun</th>
                                                    <th className="px-6 py-4 font-bold">Periode</th>
                                                    <th className="px-6 py-4 font-bold">
                                                        Beras & Gabah / Kg
                                                    </th>
                                                    <th className="px-6 py-4 font-bold">Total Panen (Kg)</th>
                                                    <th className="px-6 py-4 font-bold text-center">Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[#e2e0d4]">
                                                {activeRecords.map((r) => (
                                                    <tr
                                                        key={r.id}
                                                        className="hover:bg-[#f4f3ea]/60 transition-colors text-xs font-semibold"
                                                    >
                                                        <td className="px-6 py-4">
                                                            <div className="font-bold text-sm text-[#121e14]">
                                                                {r.nama}
                                                            </div>
                                                            <div className="text-[11px] text-[#121e14]/60 mt-0.5 flex items-center gap-2">
                                                                <span>Dusun {DUSUN_NAMES[r.dusun] || r.dusun}</span>
                                                                <span>•</span>
                                                                <span>
                                                                    {new Date(r.timestamp).toLocaleDateString("id-ID")}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="bg-[#15291b] text-[#d6f837] px-2.5 py-1 rounded-md text-[10px] font-bold">
                                                                {r.kuartal ? r.kuartal.replace("Q", "Periode ") : ""}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="text-xs text-[#121e14]">
                                                                Beras: Rp {r.hargaBeras.toLocaleString("id-ID")}
                                                            </div>
                                                            <div className="text-xs text-[#121e14]/70 mt-0.5">
                                                                Gabah: Rp {r.hargaGabah.toLocaleString("id-ID")}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="font-bold text-[#15291b] text-xs">
                                                                {(r.totalPanen || 0).toLocaleString("id-ID")} Kg
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center justify-center gap-2">
                                                                <button
                                                                    onClick={() => handleOpenEdit(r)}
                                                                    className="p-2 rounded-lg bg-[#f4f3ea] text-[#15291b] hover:bg-[#15291b] hover:text-[#d6f837] transition-all"
                                                                    title="Edit Data Field"
                                                                >
                                                                    <Pencil className="w-3.5 h-3.5" />
                                                                </button>
                                                                <button
                                                                    onClick={() => setDeletingRecord(r)}
                                                                    className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all"
                                                                    title="Hapus Data Field"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* View for Superadmin User Management Tab */}
                        {activeUser.role === "superadmin" && activeTab === "user" && (
                            <div className="bg-white rounded-[1.75rem] border border-[#e2e0d4] shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-[#e2e0d4] flex justify-between items-center bg-[#f4f3ea]">
                                    <div>
                                        <h3 className="font-bold text-base text-[#121e14]">
                                            Tabel Seluruh Pengguna Sistem (Terbaru)
                                        </h3>
                                        <p className="text-xs text-[#121e14]/60">
                                            Daftar akun Admin Dusun dan Tengkulak terdaftar.
                                        </p>
                                    </div>
                                    <div className="bg-[#15291b] text-[#d6f837] px-3.5 py-1 rounded-full text-xs font-bold">
                                        {usersList.length} Akun
                                    </div>
                                </div>

                                {loadingUsers ? (
                                    <div className="p-12 text-center text-[#121e14]/50 animate-pulse text-xs font-bold">
                                        Memuat daftar pengguna...
                                    </div>
                                ) : usersList.length === 0 ? (
                                    <div className="p-12 text-center text-[#121e14]/50 text-sm">
                                        Belum ada akun terdaftar.
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left whitespace-nowrap">
                                            <thead>
                                                <tr className="text-[11px] uppercase tracking-wider text-[#121e14]/60 bg-[#f4f3ea]">
                                                    <th className="px-6 py-4 font-bold">Username & Nama</th>
                                                    <th className="px-6 py-4 font-bold">Peran / Role</th>
                                                    <th className="px-6 py-4 font-bold">Dusun</th>
                                                    <th className="px-6 py-4 font-bold text-center">Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[#e2e0d4]">
                                                {usersList.map((u) => (
                                                    <tr
                                                        key={u.id}
                                                        className="hover:bg-[#f4f3ea]/60 transition-colors text-xs font-semibold"
                                                    >
                                                        <td className="px-6 py-4">
                                                            <div className="font-bold text-sm text-[#121e14]">
                                                                {u.name}
                                                            </div>
                                                            <div className="text-[11px] text-[#121e14]/60 mt-0.5">
                                                                @{u.username}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span
                                                                className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${
                                                                    u.role === "superadmin"
                                                                        ? "bg-amber-100 text-amber-800"
                                                                        : u.role === "admin"
                                                                        ? "bg-[#15291b] text-[#d6f837]"
                                                                        : "bg-blue-100 text-blue-800"
                                                                }`}
                                                            >
                                                                {u.role}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-[#121e14]">
                                                            {u.assignedDusun ? `Dusun ${u.assignedDusun}` : "-"}
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            {u.role !== "superadmin" ? (
                                                                <button
                                                                    onClick={() => setDeletingUser(u)}
                                                                    className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all text-xs font-bold inline-flex items-center gap-1.5"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                    <span>Hapus</span>
                                                                </button>
                                                            ) : (
                                                                <span className="text-[10px] text-gray-400 font-bold">
                                                                    Utama
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
