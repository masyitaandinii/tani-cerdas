import { AppUser, UserFormData, EditUserFormData } from '@/types';

export async function fetchUsers(params?: { dusun?: number; limit?: number }): Promise<AppUser[]> {
    try {
        const query = new URLSearchParams();
        if (params?.dusun) query.append('dusun', params.dusun.toString());
        if (params?.limit) query.append('limit', params.limit.toString());
        else query.append('limit', '100');

        const qs = query.toString();
        const url = '/api/users' + (qs ? '?' + qs : '');

        const res = await fetch(url);
        if (!res.ok) {
            console.error('Failed to fetch users:', res.statusText);
            return [];
        }
        const resData = await res.json();
        const uList: AppUser[] = resData.data || [];
        return [...uList].sort((a, b) => {
            const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return timeB - timeA;
        });
    } catch (err) {
        console.error('Error in fetchUsers:', err);
        return [];
    }
}

export async function createUser(payload: UserFormData): Promise<{ success: boolean; data?: AppUser; error?: string }> {
    try {
        const res = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        const result = await res.json();
        if (!res.ok) {
            return { success: false, error: result.error || 'Gagal membuat pengguna' };
        }
        return { success: true, data: result.data };
    } catch (err: any) {
        return { success: false, error: err.message || 'Kesalahan jaringan saat membuat pengguna' };
    }
}

export async function updateUser(
    id: string,
    payload: EditUserFormData
): Promise<{ success: boolean; data?: AppUser; error?: string }> {
    try {
        const res = await fetch('/api/users/' + id, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        const result = await res.json();
        if (!res.ok) {
            return { success: false, error: result.error || 'Gagal memperbarui pengguna' };
        }
        return { success: true, data: result.data };
    } catch (err: any) {
        return { success: false, error: err.message || 'Kesalahan jaringan saat memperbarui pengguna' };
    }
}

export async function updateProfile(
    userId: string,
    payload: { name: string; whatsapp?: string; password?: string }
): Promise<{ success: boolean; data?: AppUser; error?: string }> {
    return updateUser(userId, payload);
}

export async function deleteUser(id: string): Promise<{ success: boolean; error?: string }> {
    try {
        const res = await fetch('/api/users/' + id, {
            method: 'DELETE',
        });
        if (!res.ok) {
            const result = await res.json();
            return { success: false, error: result.error || 'Gagal menghapus pengguna' };
        }
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message || 'Kesalahan jaringan saat menghapus pengguna' };
    }
}
