import { PublicTengkulak } from '@/types';

export async function fetchPublicTengkulak(dusun?: number): Promise<PublicTengkulak[]> {
    try {
        const url = dusun ? '/api/tengkulak?dusun=' + dusun : '/api/tengkulak';
        const res = await fetch(url);
        if (!res.ok) return [];
        const result = await res.json();
        return result.data || [];
    } catch (err) {
        console.error('Error fetching tengkulak directory:', err);
        return [];
    }
}

export async function searchTengkulak(q: string, dusun?: number): Promise<string[]> {
    try {
        const params = new URLSearchParams();
        if (q) params.append('q', q);
        if (dusun) params.append('dusun', dusun.toString());
        const res = await fetch('/api/tengkulak/search?' + params.toString());
        if (!res.ok) return [];
        const result = await res.json();
        return result.names || [];
    } catch (err) {
        console.error('Error searching tengkulak names:', err);
        return [];
    }
}
