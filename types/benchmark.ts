export interface PriceItem {
    min: number;
    max: number;
    target: number; // Rata-rata / Acuan Harga
    label: string;
    description: string;
    unit: string;
}

export interface PriceBenchmark {
    id?: string;
    beras: PriceItem;
    gabah: PriceItem;
    updatedBy?: string;
    updatedAt?: string | Date;
}

export interface UpdateBenchmarkPayload {
    berasTarget: number;
    berasMin: number;
    berasMax: number;
    gabahTarget: number;
    gabahMin: number;
    gabahMax: number;
}
