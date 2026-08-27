"use client";

import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/app/components/Navbar';
import { PageHeader } from '@/components/layout';
import {
    RecordForm,
    RecordTable,
    EditRecordModal,
    DusunFilterBar,
} from '@/components/features/records';
import {
    UserForm,
    UserTable,
    EditUserModal,
} from '@/components/features/users';
import { TengkulakDashboard } from '@/components/features/tengkulak';
import { ConfirmModal, SuccessModal } from '@/components/ui';
import {
    fetchRecords,
    createRecord,
    updateRecord,
    deleteRecord,
} from '@/services/recordService';
import {
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
} from '@/services/userService';
import {
    TengkulakRecord,
    RecordFormData,
    AppUser,
    UserFormData,
    EditUserFormData,
    Kuartal,
} from '@/types';

export default function InputDashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const activeUser = session?.user
        ? {
              id: session.user.id,
              name: session.user.name || 'Pengguna',
              role: session.user.role || 'user',
              assignedDusun: session.user.assignedDusun,
          }
        : null;

    // Tabs & Navigation State
    const [activeTab, setActiveTab] = useState<'data' | 'user'>('data');
    const [selectedDusunFilter, setSelectedDusunFilter] = useState<number | 'ALL'>('ALL');

    // Modals Feedback State
    const [successModal, setSuccessModal] = useState<{ open: boolean; title?: string; message: string }>({
        open: false,
        message: '',
    });

    // Record States
    const [records, setRecords] = useState<TengkulakRecord[]>([]);
    const [loadingRecords, setLoadingRecords] = useState(false);
    const [recordFormData, setRecordFormData] = useState<RecordFormData>({
        nama: '',
        dusun: 1,
        hargaBeras: '',
        hargaGabah: '',
        kuartal: 'Q1',
        totalPanen: '',
    });
    const [isSubmittingRecord, setIsSubmittingRecord] = useState(false);
    const [editingRecord, setEditingRecord] = useState<TengkulakRecord | null>(null);
    const [editRecordFormData, setEditRecordFormData] = useState<RecordFormData>({
        nama: '',
        dusun: 1,
        hargaBeras: '',
        hargaGabah: '',
        kuartal: 'Q1',
        totalPanen: '',
    });
    const [isUpdatingRecord, setIsUpdatingRecord] = useState(false);
    const [deletingRecord, setDeletingRecord] = useState<TengkulakRecord | null>(null);
    const [isDeletingRecord, setIsDeletingRecord] = useState(false);

    // User States
    const [usersList, setUsersList] = useState<AppUser[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [userFormData, setUserFormData] = useState<UserFormData>({
        username: '',
        password: '',
        name: '',
        role: 'tengkulak',
        assignedDusun: 1,
        whatsapp: '',
    });
    const [isSubmittingUser, setIsSubmittingUser] = useState(false);
    const [editingUser, setEditingUser] = useState<AppUser | null>(null);
    const [editUserFormData, setEditUserFormData] = useState<EditUserFormData>({
        name: '',
        password: '',
        whatsapp: '',
    });
    const [isUpdatingUser, setIsUpdatingUser] = useState(false);
    const [deletingUser, setDeletingUser] = useState<AppUser | null>(null);
    const [isDeletingUser, setIsDeletingUser] = useState(false);

    // Redirect to login if unauthenticated
    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/admin');
        }
    }, [status, router]);

    // Data Loaders
    const loadRecords = async () => {
        setLoadingRecords(true);
        const data = await fetchRecords();
        setRecords(data);
        setLoadingRecords(false);
    };

    const loadUsers = async () => {
        if (!activeUser || (activeUser.role !== 'superadmin' && activeUser.role !== 'admin')) return;
        setLoadingUsers(true);
        const data = await fetchUsers({
            dusun: activeUser.role === 'admin' ? activeUser.assignedDusun : undefined,
        });
        setUsersList(data);
        setLoadingUsers(false);
    };

    useEffect(() => {
        if (session?.user) {
            loadRecords();
            if (session.user.role === 'superadmin' || session.user.role === 'admin') {
                loadUsers();
            }
        }
    }, [session?.user]);

    const handleLogout = () => {
        signOut({ callbackUrl: '/admin' });
    };

    // Record Action Handlers
    const handleRecordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeUser) return;
        setIsSubmittingRecord(true);
        const targetDusun = activeUser.role === 'superadmin' ? Number(recordFormData.dusun) : activeUser.assignedDusun || 1;
        const res = await createRecord({
            nama: recordFormData.nama,
            dusun: targetDusun,
            hargaBeras: Number(recordFormData.hargaBeras),
            hargaGabah: Number(recordFormData.hargaGabah),
            kuartal: recordFormData.kuartal,
            totalPanen: Number(recordFormData.totalPanen),
        });
        setIsSubmittingRecord(false);

        if (res.success) {
            setRecordFormData({
                nama: '',
                dusun: activeUser.assignedDusun || 1,
                hargaBeras: '',
                hargaGabah: '',
                kuartal: 'Q1',
                totalPanen: '',
            });
            await loadRecords();
            setSuccessModal({
                open: true,
                title: 'Data Panen Berhasil Ditambahkan!',
                message: res.warning ? res.warning + ' Data tetap tersimpan ke sistem.' : 'Data panen berhasil disimpan.',
            });
        } else {
            alert('Gagal menambah data: ' + (res.error || 'Terjadi kesalahan'));
        }
    };

    const handleOpenEditRecord = (r: TengkulakRecord) => {
        setEditingRecord(r);
        setEditRecordFormData({
            nama: r.nama,
            dusun: r.dusun,
            hargaBeras: r.hargaBeras.toString(),
            hargaGabah: r.hargaGabah.toString(),
            kuartal: r.kuartal,
            totalPanen: (r.totalPanen || 0).toString(),
        });
    };

    const handleEditRecordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingRecord) return;
        setIsUpdatingRecord(true);
        const res = await updateRecord(editingRecord.id, {
            nama: editRecordFormData.nama,
            dusun: Number(editRecordFormData.dusun),
            hargaBeras: Number(editRecordFormData.hargaBeras),
            hargaGabah: Number(editRecordFormData.hargaGabah),
            kuartal: editRecordFormData.kuartal,
            totalPanen: Number(editRecordFormData.totalPanen),
        });
        setIsUpdatingRecord(false);

        if (res.success) {
            setEditingRecord(null);
            await loadRecords();
            setSuccessModal({
                open: true,
                title: 'Data Panen Diperbarui!',
                message: 'Perubahan data berhasil disimpan.',
            });
        } else {
            alert('Gagal memperbarui data: ' + (res.error || 'Terjadi kesalahan'));
        }
    };

    const handleDeleteRecordConfirm = async () => {
        if (!deletingRecord) return;
        setIsDeletingRecord(true);
        const res = await deleteRecord(deletingRecord.id);
        setIsDeletingRecord(false);

        if (res.success) {
            setDeletingRecord(null);
            await loadRecords();
            setSuccessModal({
                open: true,
                title: 'Data Dihapus!',
                message: 'Data panen berhasil dihapus dari sistem.',
            });
        } else {
            alert('Gagal menghapus data: ' + (res.error || 'Terjadi kesalahan'));
        }
    };

    // User Action Handlers
    const handleUserSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeUser || (activeUser.role !== 'superadmin' && activeUser.role !== 'admin')) return;

        setIsSubmittingUser(true);
        const targetDusun = activeUser.role === 'admin' ? activeUser.assignedDusun || 1 : Number(userFormData.assignedDusun);
        const targetRole = activeUser.role === 'admin' ? 'tengkulak' : userFormData.role;

        const res = await createUser({
            username: userFormData.username,
            password: userFormData.password,
            name: userFormData.name,
            role: targetRole,
            assignedDusun: targetDusun,
            whatsapp: userFormData.whatsapp,
        });
        setIsSubmittingUser(false);

        if (res.success) {
            setUserFormData({
                username: '',
                password: '',
                name: '',
                role: 'tengkulak',
                assignedDusun: activeUser.assignedDusun || 1,
                whatsapp: '',
            });
            await loadUsers();
            setSuccessModal({
                open: true,
                title: 'Akun Berhasil Dibuat!',
                message: 'Pengguna baru dapat langsung login menggunakan kredensial yang didaftarkan.',
            });
        } else {
            alert('Gagal menambah pengguna: ' + (res.error || 'Terjadi kesalahan'));
        }
    };

    const handleOpenEditUser = (u: AppUser) => {
        setEditingUser(u);
        setEditUserFormData({
            name: u.name,
            password: '',
            whatsapp: u.whatsapp || '',
        });
    };

    const handleEditUserSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;

        setIsUpdatingUser(true);
        const res = await updateUser(editingUser.id, editUserFormData);
        setIsUpdatingUser(false);

        if (res.success) {
            setEditingUser(null);
            setEditUserFormData({ name: '', password: '', whatsapp: '' });
            await loadUsers();
            setSuccessModal({
                open: true,
                title: 'Akun Berhasil Diperbarui!',
                message: 'Data akun telah diperbarui.',
            });
        } else {
            alert('Gagal memperbarui akun: ' + (res.error || 'Terjadi kesalahan'));
        }
    };

    const handleDeleteUserConfirm = async () => {
        if (!deletingUser) return;
        setIsDeletingUser(true);
        const res = await deleteUser(deletingUser.id);
        setIsDeletingUser(false);

        if (res.success) {
            setDeletingUser(null);
            await loadUsers();
            setSuccessModal({
                open: true,
                title: 'Akun Dihapus!',
                message: 'Akun pengguna telah dihapus dari sistem.',
            });
        } else {
            alert('Gagal menghapus pengguna: ' + (res.error || 'Terjadi kesalahan'));
        }
    };

    if (status === 'loading' || !activeUser) {
        return (
            <div className="min-h-screen bg-[#f4f3ea] text-[#121e14] flex flex-col">
                <Navbar />
                <div className="flex-1 flex justify-center items-center animate-pulse text-sm font-bold text-[#121e14]">
                    Memuat Dashboard...
                </div>
            </div>
        );
    }

    // Role Tengkulak Dedicated Dashboard View
    if (activeUser.role === 'tengkulak') {
        return (
            <div className="min-h-screen bg-[#f4f3ea] text-[#121e14] flex flex-col selection:bg-[#d6f837] selection:text-[#121e14]">
                <Navbar />
                <main className="flex-1 w-full max-w-7xl mx-auto p-6 md:p-10">
                    <TengkulakDashboard
                        activeUser={activeUser}
                        records={records}
                        onLogout={handleLogout}
                        onRefreshRecords={loadRecords}
                        onShowSuccess={(title, msg) => setSuccessModal({ open: true, title, message: msg })}
                    />
                </main>
                <SuccessModal
                    isOpen={successModal.open}
                    onClose={() => setSuccessModal({ open: false, message: '' })}
                    title={successModal.title}
                    message={successModal.message}
                />
            </div>
        );
    }

    // Filter Records for Superadmin / Admin View
    const filteredRecords = records.filter((r) => {
        if (activeUser.role === 'admin') return r.dusun === activeUser.assignedDusun;
        if (selectedDusunFilter === 'ALL') return true;
        return r.dusun === selectedDusunFilter;
    });

    return (
        <div className="min-h-screen bg-[#f4f3ea] text-[#121e14] flex flex-col selection:bg-[#d6f837] selection:text-[#121e14]">
            <Navbar />
            <main className="flex-1 w-full max-w-7xl mx-auto p-6 md:p-10 space-y-8 animate-in fade-in duration-500">
                {/* Header Section */}
                <PageHeader user={activeUser} onLogout={handleLogout} />

                {/* Dusun Filter Bar for Superadmin */}
                {activeUser.role === 'superadmin' && activeTab === 'data' && (
                    <DusunFilterBar
                        selectedDusun={selectedDusunFilter}
                        onSelectDusun={setSelectedDusunFilter}
                        totalRecords={records.length}
                    />
                )}

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* Form Sidebar */}
                    <div className="xl:col-span-1">
                        <div className="bg-white rounded-[1.75rem] border border-[#e2e0d4] shadow-sm overflow-hidden sticky top-24">
                            {/* Tab Switcher */}
                            <div className="flex border-b border-[#e2e0d4]">
                                <button
                                    onClick={() => setActiveTab('data')}
                                    className={"flex-1 py-4 text-xs font-bold uppercase tracking-wider text-center transition-colors " + (
                                        activeTab === 'data'
                                            ? 'bg-[#15291b] text-[#d6f837]'
                                            : 'bg-[#f4f3ea] text-[#121e14]/60 hover:bg-[#e2e0d4]'
                                    )}
                                    type="button"
                                >
                                    Data Panen
                                </button>
                                <button
                                    onClick={() => {
                                        setActiveTab('user');
                                        loadUsers();
                                    }}
                                    className={"flex-1 py-4 text-xs font-bold uppercase tracking-wider text-center transition-colors " + (
                                        activeTab === 'user'
                                            ? 'bg-[#15291b] text-[#d6f837]'
                                            : 'bg-[#f4f3ea] text-[#121e14]/60 hover:bg-[#e2e0d4]'
                                    )}
                                    type="button"
                                >
                                    {activeUser.role === 'admin' ? 'Kelola Tengkulak' : 'Manajemen Akun'}
                                </button>
                            </div>

                            {activeTab === 'data' ? (
                                <RecordForm
                                    formData={recordFormData}
                                    onChange={setRecordFormData}
                                    onSubmit={handleRecordSubmit}
                                    isSubmitting={isSubmittingRecord}
                                    role={activeUser.role}
                                    assignedDusun={activeUser.assignedDusun}
                                />
                            ) : (
                                <UserForm
                                    formData={userFormData}
                                    onChange={setUserFormData}
                                    onSubmit={handleUserSubmit}
                                    isSubmitting={isSubmittingUser}
                                    role={activeUser.role}
                                    assignedDusun={activeUser.assignedDusun}
                                />
                            )}
                        </div>
                    </div>

                    {/* Table Right Area */}
                    <div className="xl:col-span-2 space-y-8">
                        {activeTab === 'data' ? (
                            <RecordTable
                                records={filteredRecords}
                                isLoading={loadingRecords}
                                onEdit={handleOpenEditRecord}
                                onDelete={(r) => setDeletingRecord(r)}
                            />
                        ) : (
                            <UserTable
                                users={usersList}
                                isLoading={loadingUsers}
                                onEdit={handleOpenEditUser}
                                onDelete={(u) => setDeletingUser(u)}
                                role={activeUser.role}
                            />
                        )}
                    </div>
                </div>
            </main>

            {/* Edit Record Modal */}
            <EditRecordModal
                record={editingRecord}
                formData={editRecordFormData}
                onChange={setEditRecordFormData}
                onSubmit={handleEditRecordSubmit}
                onClose={() => setEditingRecord(null)}
                isUpdating={isUpdatingRecord}
                role={activeUser.role}
            />

            {/* Edit User Modal */}
            <EditUserModal
                user={editingUser}
                formData={editUserFormData}
                onChange={setEditUserFormData}
                onSubmit={handleEditUserSubmit}
                onClose={() => setEditingUser(null)}
                isUpdating={isUpdatingUser}
            />

            {/* Delete Record Confirmation Modal */}
            <ConfirmModal
                isOpen={!!deletingRecord}
                onClose={() => setDeletingRecord(null)}
                onConfirm={handleDeleteRecordConfirm}
                title="Konfirmasi Hapus Data"
                message={
                    <>
                        Apakah Anda yakin ingin menghapus data panen atas nama <strong>{deletingRecord?.nama}</strong>? Tindakan ini tidak dapat dibatalkan.
                    </>
                }
                confirmText="Ya, Hapus"
                isLoading={isDeletingRecord}
            />

            {/* Delete User Confirmation Modal */}
            <ConfirmModal
                isOpen={!!deletingUser}
                onClose={() => setDeletingUser(null)}
                onConfirm={handleDeleteUserConfirm}
                title="Hapus Akun Pengguna"
                message={
                    <>
                        Apakah Anda yakin ingin menghapus akun <strong>{deletingUser?.name} ({deletingUser?.username})</strong>? Pengguna ini tidak akan dapat login lagi.
                    </>
                }
                confirmText="Ya, Hapus Akun"
                isLoading={isDeletingUser}
            />

            {/* Success Feedback Modal */}
            <SuccessModal
                isOpen={successModal.open}
                onClose={() => setSuccessModal({ open: false, message: '' })}
                title={successModal.title}
                message={successModal.message}
            />
        </div>
    );
}
