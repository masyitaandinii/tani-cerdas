import { TengkulakRecord, RecordStats } from '@/types';

export async function fetchRecords(params?: { dusun?: number; limit?: number }): Promise<TengkulakRecord[]> {
    try {
        const query = new URLSearchParams();
        if (params?.dusun) query.append('dusun', params.dusun.toString());
        if (params?.limit) query.append('limit', params.limit.toString());
        
        const qs = query.toString();
        const url = '/api/records' + (qs ? '?' + qs : '');
        
        const res = await fetch(url);
        if (!res.ok) {
            console.error('Failed to fetch records:', res.statusText);
            return [];
        }
        const data: TengkulakRecord[] = await res.json();
        return [...data].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (err) {
        console.error('Error in fetchRecords:', err);
        return [];
    }
}

export async function createRecord(payload: {
    nama: string;
    dusun: number;
    hargaBeras: number;
    hargaGabah: number;
    kuartal: string;
    totalPanen: number;
}): Promise<{ success: boolean; data?: TengkulakRecord; warning?: string; error?: string }> {
    try {
        const res = await fetch('/api/records', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        const result = await res.json();
        if (!res.ok) {
            return { success: false, error: result.error || 'Gagal menyimpan data' };
        }
        return { success: true, data: result.data, warning: result.warning };
    } catch (err: any) {
        return { success: false, error: err.message || 'Kesalahan jaringan saat menyimpan data' };
    }
}

export async function updateRecord(
    id: string,
    payload: {
        nama: string;
        dusun: number;
        hargaBeras: number;
        hargaGabah: number;
        kuartal: string;
        totalPanen: number;
    }
): Promise<{ success: boolean; error?: string }> {
    try {
        const res = await fetch('/api/records/' + id, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (!res.ok) {
            const result = await res.json();
            return { success: false, error: result.error || 'Gagal memperbarui data' };
        }
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message || 'Kesalahan jaringan saat memperbarui data' };
    }
}

export async function deleteRecord(id: string): Promise<{ success: boolean; error?: string }> {
    try {
        const res = await fetch('/api/records/' + id, {
            method: 'DELETE',
        });
        if (!res.ok) {
            const result = await res.json();
            return { success: false, error: result.error || 'Gagal menghapus data' };
        }
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message || 'Kesalahan jaringan saat menghapus data' };
    }
}

export async function fetchRecordStats(): Promise<RecordStats | null> {
    try {
        const res = await fetch('/api/records/stats');
        if (!res.ok) return null;
        return await res.json();
    } catch (err) {
        console.error('Error fetching stats:', err);
        return null;
    }
}
