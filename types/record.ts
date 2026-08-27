export type Kuartal = 'Q1' | 'Q2' | 'Q3' | 'Q4';

export interface TengkulakRecord {
    id: string;
    nama: string;
    dusun: number;
    hargaBeras: number;
    hargaGabah: number;
    kuartal: Kuartal;
    totalPanen?: number;
    authorId?: string;
    timestamp: string | Date;
    warning?: string;
}

export interface RecordFormData {
    nama: string;
    dusun: number;
    hargaBeras: string | number;
    hargaGabah: string | number;
    kuartal: Kuartal;
    totalPanen: string | number;
}

export interface RecordFilter {
    dusun?: number | 'ALL';
    kuartal?: Kuartal | 'ALL';
    search?: string;
}

export interface RecordStats {
    totalPanen: number;
    avgHargaBeras: number;
    avgHargaGabah: number;
    totalTransactions: number;
}