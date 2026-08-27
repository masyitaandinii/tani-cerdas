export type UserRole = 'superadmin' | 'admin' | 'tengkulak' | 'user';

export interface AppUser {
    id: string;
    username: string;
    name: string;
    role: UserRole | string;
    assignedDusun?: number;
    phone?: string;
    whatsapp?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface UserFormData {
    username: string;
    password?: string;
    name: string;
    role: string;
    assignedDusun: number;
    whatsapp?: string;
}

export interface EditUserFormData {
    name: string;
    password?: string;
    whatsapp?: string;
    role?: string;
    assignedDusun?: number;
}

export interface SessionUser {
    id?: string;
    name?: string | null;
    email?: string | null;
    role?: string;
    assignedDusun?: number;
}