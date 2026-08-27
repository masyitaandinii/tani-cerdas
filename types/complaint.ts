export interface ComplaintFormData {
    name: string;
    dusun: number;
    phone: string;
    category: string;
    content: string;
}

export interface PublicTengkulak {
    id: string;
    name: string;
    username: string;
    assignedDusun: number;
    dusunName: string;
    whatsapp: string;
}