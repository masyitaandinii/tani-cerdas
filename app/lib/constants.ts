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
