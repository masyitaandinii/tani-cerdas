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
        countDocuments: vi.fn().mockResolvedValue(10),
        create: vi.fn()
    }
}));

vi.mock('../app/lib/models/User', () => ({
    User: {
        findOne: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({ _id: 'newuser123' })
    }
}));

vi.mock('../app/lib/models/PriceBenchmark', () => ({
    PriceBenchmark: {
        findOne: vi.fn().mockReturnValue({
            sort: vi.fn().mockReturnValue({
                lean: vi.fn().mockResolvedValue({
                    beras: { target: 13500, min: 12500, max: 14900 },
                    gabah: { target: 6500, min: 6000, max: 7500 }
                })
            })
        })
    }
}));

// Setup Request helper
const mockRequest = (body: any = null) => {
    return {
        json: async () => body,
        url: 'http://localhost/api/records'
    } as any;
};

describe('Records API', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('GET /api/records', () => {
        it('should return tengkulak names and hide authorId for unauthenticated users', async () => {
            (getServerSession as any).mockResolvedValue(null); // No session
            const mockData = [{ _id: 'id1', nama: 'Budi', authorId: 'user123', dusun: 1, hargaBeras: 10000 }];
            
            (TengkulakRecord.find as any).mockReturnValue({
                sort: vi.fn().mockReturnValue({
                    skip: vi.fn().mockReturnValue({
                        limit: vi.fn().mockReturnValue({
                            lean: vi.fn().mockResolvedValue(mockData)
                        })
                    }),
                    lean: vi.fn().mockResolvedValue(mockData)
                })
            });

            const res = await GET(mockRequest());
            const data = await res.json();
            
            expect(data[0].nama).toBe('Budi');
            expect(data[0].authorId).toBeUndefined();
            expect(data[0].hargaBeras).toBe(10000); // other fields retained
        });

        it('should NOT mask names for admin users', async () => {
            (getServerSession as any).mockResolvedValue({ user: { role: 'admin' } });
            const mockData = [{ _id: 'id3', nama: 'Budi', authorId: 'user123', dusun: 1 }];
            
            (TengkulakRecord.find as any).mockReturnValue({
                sort: vi.fn().mockReturnValue({
                    skip: vi.fn().mockReturnValue({
                        limit: vi.fn().mockReturnValue({
                            lean: vi.fn().mockResolvedValue(mockData)
                        })
                    }),
                    lean: vi.fn().mockResolvedValue(mockData)
                })
            });

            const res = await GET(mockRequest());
            const data = await res.json();
            
            expect(data[0].nama).toBe('Budi');
            expect(data[0].authorId).toBeUndefined();
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
                authorId: 'admin1',
                totalPanen: 1000
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
                authorId: 'super1',
                totalPanen: 1000
            }));
        });

        it('should allow tengkulak role to post and force totalPanen = 0 and auto-fill verified name/dusun', async () => {
            (getServerSession as any).mockResolvedValue({
                user: { id: 'tengkulak1', name: 'Pak Haji Ahmad', role: 'tengkulak', assignedDusun: 2 }
            });
            (TengkulakRecord.create as any).mockResolvedValue({ toObject: () => ({ _id: 'rec999' }) });

            const req = mockRequest({
                nama: 'Custom Name Attempt',
                dusun: 4, // Attempt different dusun
                hargaBeras: 13000,
                hargaGabah: 6500,
                kuartal: 'Q2'
            });

            const res = await POST(req);
            expect(res.status).toBe(201);

            expect(TengkulakRecord.create).toHaveBeenCalledWith(expect.objectContaining({
                nama: 'Pak Haji Ahmad',
                dusun: 2,
                hargaBeras: 13000,
                hargaGabah: 6500,
                totalPanen: 0,
                authorId: 'tengkulak1'
            }));
        });

        it('should return non-blocking warning when price exceeds government benchmark', async () => {
            (getServerSession as any).mockResolvedValue({
                user: { id: 'tengkulak2', name: 'Tengkulak Mahal', role: 'tengkulak', assignedDusun: 1 }
            });
            (TengkulakRecord.create as any).mockResolvedValue({ toObject: () => ({ _id: 'recOver' }) });

            const req = mockRequest({
                nama: 'Tengkulak Mahal',
                dusun: 1,
                hargaBeras: 25000, // Exceeds HET 14900
                hargaGabah: 12000, // Exceeds HPP 7500
                kuartal: 'Q1'
            });

            const res = await POST(req);
            expect(res.status).toBe(201);
            const data = await res.json();
            expect(data.warning).toBeDefined();
            expect(data.warning).toContain('melebihi batas acuan pemerintah');
        });
    });
});
