/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from '../app/api/records/route';
import { TengkulakRecord } from '../app/lib/models/TengkulakRecord';

// Mock dependencies
vi.mock('next-auth', () => ({
    default: vi.fn(),
    getServerSession: vi.fn()
}));
import { getServerSession } from 'next-auth';

vi.mock('../app/lib/db', () => ({
    default: vi.fn().mockResolvedValue(true)
}));

vi.mock('../app/lib/models/TengkulakRecord', () => ({
    TengkulakRecord: {
        find: vi.fn(),
        create: vi.fn()
    }
}));

// Setup Request helper
const mockRequest = (body: any = null) => {
    return {
        json: async () => body
    } as Request;
};

describe('Records API', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('GET /api/records', () => {
        it('should mask names and hide authorId for unauthenticated users', async () => {
            (getServerSession as any).mockResolvedValue(null); // No session
            const mockData = [{ nama: 'Budi', authorId: 'user123', dusun: 1, hargaBeras: 10000 }];
            
            (TengkulakRecord.find as any).mockReturnValue({
                lean: vi.fn().mockResolvedValue(mockData)
            });

            const res = await GET(mockRequest());
            const data = await res.json();
            
            expect(data[0].nama).toBe('Anonim');
            expect(data[0].authorId).toBeUndefined();
            expect(data[0].hargaBeras).toBe(10000); // other fields retained
        });

        it('should mask names for unknown or undefined roles (fail-safe)', async () => {
            (getServerSession as any).mockResolvedValue({ user: { role: 'hacker_or_unknown' } });
            const mockData = [{ nama: 'Budi', authorId: 'user123', dusun: 1 }];
            
            (TengkulakRecord.find as any).mockReturnValue({
                lean: vi.fn().mockResolvedValue(mockData)
            });

            const res = await GET(mockRequest());
            const data = await res.json();
            
            expect(data[0].nama).toBe('Anonim');
            expect(data[0].authorId).toBeUndefined();
        });

        it('should NOT mask names for admin users', async () => {
            (getServerSession as any).mockResolvedValue({ user: { role: 'admin' } });
            const mockData = [{ nama: 'Budi', authorId: 'user123', dusun: 1 }];
            
            (TengkulakRecord.find as any).mockReturnValue({
                lean: vi.fn().mockResolvedValue(mockData)
            });

            const res = await GET(mockRequest());
            const data = await res.json();
            
            expect(data[0].nama).toBe('Budi');
            expect(data[0].authorId).toBe('user123');
        });
    });

    describe('POST /api/records', () => {
        it('should reject unauthenticated users', async () => {
            (getServerSession as any).mockResolvedValue(null);
            const res = await POST(mockRequest({}));
            expect(res.status).toBe(401);
        });

        it('should reject invalid zod schema (e.g. hargaBeras is string)', async () => {
            (getServerSession as any).mockResolvedValue({ user: { role: 'admin', assignedDusun: 1 } });
            const res = await POST(mockRequest({
                nama: 'Budi',
                dusun: 1,
                hargaBeras: "12000", // invalid type
                hargaGabah: 6000,
                kuartal: 'Q1',
                totalPanen: 1000
            }));
            expect(res.status).toBe(400);
            const data = await res.json();
            expect(data.error).toBe('Invalid input');
        });

        it('should allow admin and automatically override dusun', async () => {
            (getServerSession as any).mockResolvedValue({ user: { id: 'admin1', role: 'admin', assignedDusun: 1 } });
            (TengkulakRecord.create as any).mockResolvedValue({ toObject: () => ({ _id: 'new123' }) });

            // Admin trying to post to dusun 2
            const req = mockRequest({
                nama: 'Budi',
                dusun: 2, // will be overridden
                hargaBeras: 12000,
                hargaGabah: 6000,
                kuartal: 'Q1',
                totalPanen: 1000
            });

            const res = await POST(req);
            expect(res.status).toBe(201);
            
            expect(TengkulakRecord.create).toHaveBeenCalledWith(expect.objectContaining({
                dusun: 1, // forced to 1
                authorId: 'admin1'
            }));
        });
        
        it('should allow superadmin to post to any dusun without overriding', async () => {
            (getServerSession as any).mockResolvedValue({ user: { id: 'super1', role: 'superadmin' } });
            (TengkulakRecord.create as any).mockResolvedValue({ toObject: () => ({ _id: 'new123' }) });

            const req = mockRequest({
                nama: 'Budi',
                dusun: 3, 
                hargaBeras: 12000,
                hargaGabah: 6000,
                kuartal: 'Q1',
                totalPanen: 1000
            });

            const res = await POST(req);
            expect(res.status).toBe(201);
            
            expect(TengkulakRecord.create).toHaveBeenCalledWith(expect.objectContaining({
                dusun: 3, // retains 3
                authorId: 'super1'
            }));
        });
    });
});
