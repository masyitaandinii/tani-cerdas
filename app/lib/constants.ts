export const ROLES = {
    ADMIN: 'admin',
    SUPERADMIN: 'superadmin',
    USER: 'tengkulak',
} as const;

export const DUSUN_LIMITS = {
    MIN: 1,
    MAX: 4,
};

export const DUSUN_NAMES: Record<number, string> = {
    1: 'Karangpilang',
    2: 'Dopok Sambi',
    3: 'Topang',
    4: 'Gabang',
};

export const CHAT_LIMITS = {
    MAX_MESSAGE_LENGTH: 500,
};

export const GOVERNMENT_PRICE_BENCHMARKS = {
    gabah: {
        min: 6000,
        max: 7500,
        target: 6500,
        label: "HPP Gabah Kering Panen (Bapanas)",
        description: "Batas acuan Harga Pembelian Pemerintah (HPP)",
        unit: "Rp/kg"
    },
    beras: {
        min: 12500,
        max: 14900,
        target: 13500,
        label: "HET Beras Medium / Premium (Bapanas)",
        description: "Batas acuan Harga Eceran Tertinggi (HET)",
        unit: "Rp/kg"
    }
};

export const VILLAGE_INFO = {
    name: "Desa Kedungrejo",
    subdistrict: "Modo",
    regency: "Lamongan",
    province: "Jawa Timur",
    websiteUrl: "https://website-desa-lamongan.vercel.app/",
    whatsappPengaduan: "6281234567890", // Ganti dengan No WA Hotline Layanan Pengaduan Warga
    email: "pemdes@kedungrejo.desa.id",
    address: "Jl. Raya Kedungrejo No. 01, Kedungrejo, Modo, Lamongan, Jawa Timur",
};

