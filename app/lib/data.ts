export type Kuartal = "Q1" | "Q2" | "Q3" | "Q4";

export interface TengkulakRecord {
    id: string;
    nama: string;
    dusun: number; // 1, 2, 3, or 4
    hargaBeras: number;
    hargaGabah: number;
    kuartal: Kuartal;
    timestamp: string;
    totalPanen: number;
}

export interface User {
    id: string;
    username: string;
    name: string;
    password?: string;
    role: "admin" | "tengkulak";
    assignedDusun?: number;
}

// Initial mock state for UI testing
export const INITIAL_USERS: User[] = [
    { id: "admin1", username: "admin1", name: "Admin Dusun 1", password: "123", role: "admin", assignedDusun: 1 },
    { id: "t1", username: "budi", name: "Bapak Budi", role: "tengkulak", assignedDusun: 1 },
    { id: "t2", username: "ani", name: "Ibu Ani", role: "tengkulak", assignedDusun: 1 },
];

export const INITIAL_TENGKULAK_RECORDS: TengkulakRecord[] = [
    { id: "t1", nama: "Bapak Budi", dusun: 1, hargaBeras: 12500, hargaGabah: 6500, kuartal: "Q1", timestamp: new Date().toISOString(), totalPanen: 1500 },
    { id: "t2", nama: "Ibu Ani", dusun: 1, hargaBeras: 12800, hargaGabah: 6700, kuartal: "Q2", timestamp: new Date().toISOString(), totalPanen: 1800 },
    { id: "t3", nama: "Mas Joko", dusun: 2, hargaBeras: 12400, hargaGabah: 6400, kuartal: "Q1", timestamp: new Date().toISOString(), totalPanen: 1200 },
    { id: "t4", nama: "Pak Tono", dusun: 3, hargaBeras: 13000, hargaGabah: 6800, kuartal: "Q1", timestamp: new Date().toISOString(), totalPanen: 2100 },
    { id: "t5", nama: "Siti Rahma", dusun: 4, hargaBeras: 12600, hargaGabah: 6600, kuartal: "Q1", timestamp: new Date().toISOString(), totalPanen: 1750 },
    { id: "t6", nama: "Siti Rahma", dusun: 4, hargaBeras: 12900, hargaGabah: 6700, kuartal: "Q2", timestamp: new Date().toISOString(), totalPanen: 1600 },
];
