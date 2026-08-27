import { PriceBenchmark, UpdateBenchmarkPayload } from '@/types';
import { GOVERNMENT_PRICE_BENCHMARKS } from '@/app/lib/constants';

export async function fetchBenchmarkPrices(): Promise<PriceBenchmark> {
    try {
        const res = await fetch('/api/benchmarks', {
            cache: 'no-store'
        });
        if (!res.ok) {
            console.error('Failed to fetch benchmark prices, using constants');
            return {
                beras: GOVERNMENT_PRICE_BENCHMARKS.beras,
                gabah: GOVERNMENT_PRICE_BENCHMARKS.gabah,
                updatedBy: 'Bapanas (Standar)'
            };
        }
        return await res.json();
    } catch (err) {
        console.error('Error fetching benchmark prices:', err);
        return {
            beras: GOVERNMENT_PRICE_BENCHMARKS.beras,
            gabah: GOVERNMENT_PRICE_BENCHMARKS.gabah,
            updatedBy: 'Bapanas (Standar)'
        };
    }
}

export async function updateBenchmarkPrices(
    payload: UpdateBenchmarkPayload
): Promise<{ success: boolean; data?: PriceBenchmark; error?: string }> {
    try {
        const res = await fetch('/api/benchmarks', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        const result = await res.json();
        if (!res.ok) {
            return {
                success: false,
                error: result.error || (result.details && result.details[0]?.message) || 'Gagal memperbarui acuan harga Bapanas'
            };
        }

        return { success: true, data: result.data };
    } catch (err: any) {
        return {
            success: false,
            error: err.message || 'Kesalahan jaringan saat memperbarui acuan harga Bapanas'
        };
    }
}
