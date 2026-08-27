import React from 'react';
import { Pencil } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { TengkulakRecord, RecordFormData, Kuartal } from '@/types';
import { DUSUN_NAMES } from '@/app/lib/constants';

interface EditRecordModalProps {
    record: TengkulakRecord | null;
    formData: RecordFormData;
    onChange: (data: RecordFormData) => void;
    onSubmit: (e: React.FormEvent) => void;
    onClose: () => void;
    isUpdating: boolean;
    role: string;
}

export function EditRecordModal({
    record,
    formData,
    onChange,
    onSubmit,
    onClose,
    isUpdating,
    role,
}: EditRecordModalProps) {
    if (!record) return null;

    return (
        <Modal isOpen={!!record} onClose={onClose}>
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#15291b] text-[#d6f837] rounded-full flex items-center justify-center font-bold">
                    <Pencil className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-bold text-[#121e14] text-lg">Edit Data Panen</h3>
                    <p className="text-xs text-[#121e14]/60">Atas Nama: {record.nama}</p>
                </div>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#121e14] mb-1.5">
                        Nama Tengkulak
                    </label>
                    <input
                        type="text"
                        required
                        value={formData.nama}
                        onChange={(e) => onChange({ ...formData, nama: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-[#e2e0d4] bg-[#f4f3ea] text-xs font-medium text-[#121e14] focus:outline-none focus:ring-2 focus:ring-[#15291b]"
                    />
                </div>

                {role === 'superadmin' && (
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#121e14] mb-1.5">
                            Dusun
                        </label>
                        <select
                            value={formData.dusun}
                            onChange={(e) => onChange({ ...formData, dusun: Number(e.target.value) })}
                            className="w-full px-4 py-2.5 rounded-xl border border-[#e2e0d4] bg-[#f4f3ea] text-xs font-medium text-[#121e14] focus:outline-none focus:ring-2 focus:ring-[#15291b]"
                        >
                            <option value={1}>Dusun {DUSUN_NAMES[1]}</option>
                            <option value={2}>Dusun {DUSUN_NAMES[2]}</option>
                            <option value={3}>Dusun {DUSUN_NAMES[3]}</option>
                            <option value={4}>Dusun {DUSUN_NAMES[4]}</option>
                        </select>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#121e14] mb-1.5">
                            Harga Beras (Rp/Kg)
                        </label>
                        <input
                            type="number"
                            required
                            value={formData.hargaBeras}
                            onChange={(e) => onChange({ ...formData, hargaBeras: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl border border-[#e2e0d4] bg-[#f4f3ea] text-xs font-medium text-[#121e14] focus:outline-none focus:ring-2 focus:ring-[#15291b]"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#121e14] mb-1.5">
                            Harga Gabah (Rp/Kg)
                        </label>
                        <input
                            type="number"
                            required
                            value={formData.hargaGabah}
                            onChange={(e) => onChange({ ...formData, hargaGabah: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl border border-[#e2e0d4] bg-[#f4f3ea] text-xs font-medium text-[#121e14] focus:outline-none focus:ring-2 focus:ring-[#15291b]"
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
                            onChange={(e) => onChange({ ...formData, kuartal: e.target.value as Kuartal })}
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
                            value={formData.totalPanen}
                            onChange={(e) => onChange({ ...formData, totalPanen: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl border border-[#e2e0d4] bg-[#f4f3ea] text-xs font-medium text-[#121e14] focus:outline-none focus:ring-2 focus:ring-[#15291b]"
                            placeholder="Kg (Opsional)"
                        />
                    </div>
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
