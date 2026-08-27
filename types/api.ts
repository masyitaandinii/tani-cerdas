// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ApiResponse<T = any> {
    data?: T;
    error?: string;
    warning?: string;
    message?: string;
    total?: number;
    page?: number;
    limit?: number;
}