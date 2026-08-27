/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, PUT } from '../app/api/benchmarks/route';
import { PriceBenchmark } from '../app/lib/models/PriceBenchmark';
import { GOVERNMENT_PRICE_BENCHMARKS } from '../app/lib/constants';

// Mock dependencies
vi.mock('next-auth', () => ({
    default: vi.fn(),
    getServerSession: vi.fn(),
}));
import { getServerSession } from 'next-auth';

vi.mock('../app/lib/db', () => ({
    default: vi.fn().mockResolvedValue(true),
}));

vi.mock('../app/lib/models/PriceBenchmark', () => ({
    PriceBenchmark: {
        findOne: vi.fn(),
        create: vi.fn(),
    },
}));

const mockRequest = (body: any = null) => {
    return {
        json: async () => body,
        url: 'http://localhost/api/benchmarks',
    } as any;
};

describe('Benchmarks API (/api/benchmarks)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('GET /api/benchmarks', () => {
        it('should return latest benchmark from database if available', async () => {
            const mockDbBm = {
                beras: { target: 14000, min: 13000, max: 15500 },
                gabah: { target: 7000, min: 6200, max: 7800 },
                updatedBy: 'Admin Dusun 1',
                updatedAt: new Date().toISOString(),
            };

            (PriceBenchmark.findOne as any).mockReturnValue({
                sort: vi.fn().mockReturnValue({
                    lean: vi.fn().mockResolvedValue(mockDbBm),
                }),
            });

            const res = await GET();
            expect(res.status).toBe(200);
            const json = await res.json();
            expect(json.data.beras.target).toBe(14000);
            expect(json.data.updatedBy).toBe('Admin Dusun 1');
        });

        it('should fallback to default government constants if database is empty', async () => {
            (PriceBenchmark.findOne as any).mockReturnValue({
                sort: vi.fn().mockReturnValue({
                    lean: vi.fn().mockResolvedValue(null),
                }),
            });
            (PriceBenchmark.create as any).mockResolvedValue({
                toObject: () => ({
                    beras: GOVERNMENT_PRICE_BENCHMARKS.beras,
                    gabah: GOVERNMENT_PRICE_BENCHMARKS.gabah,
                    updatedBy: 'Sistem Standar (Bapanas)'
                })
            });

            const res = await GET();
            expect(res.status).toBe(200);
            const json = await res.json();
            expect(json.data.beras.target).toBe(GOVERNMENT_PRICE_BENCHMARKS.beras.target);
            expect(json.data.gabah.target).toBe(GOVERNMENT_PRICE_BENCHMARKS.gabah.target);
        });
    });

    describe('PUT /api/benchmarks', () => {
        it('should reject unauthenticated request with 401', async () => {
            (getServerSession as any).mockResolvedValue(null);
            const res = await PUT(mockRequest({ berasTarget: 14000 }));
            expect(res.status).toBe(401);
        });

        it('should reject tengkulak user with 403 Forbidden', async () => {
            (getServerSession as any).mockResolvedValue({
                user: { id: 'u1', role: 'tengkulak', name: 'Tengkulak 1' },
            });
            const res = await PUT(mockRequest({
                berasTarget: 14000,
                berasMin: 13000,
                berasMax: 15000,
                gabahTarget: 6800,
                gabahMin: 6000,
                gabahMax: 7600,
            }));
            expect(res.status).toBe(403);
        });

        it('should allow admin or superadmin to update Bapanas benchmark prices', async () => {
            (getServerSession as any).mockResolvedValue({
                user: { id: 'admin1', role: 'admin', name: 'Admin Dusun 1' },
            });

            const mockSavedDoc = {
                _id: 'bm123',
                beras: { target: 14200, min: 13000, max: 15200 },
                gabah: { target: 6800, min: 6100, max: 7600 },
                updatedBy: 'Admin Dusun 1',
                save: vi.fn().mockImplementation(function() {
                    return Promise.resolve(this);
                }),
                toObject: function() {
                    return {
                        _id: this._id,
                        beras: this.beras,
                        gabah: this.gabah,
                        updatedBy: this.updatedBy
                    };
                }
            };

            (PriceBenchmark.findOne as any).mockReturnValue({
                sort: vi.fn().mockResolvedValue(mockSavedDoc),
            });

            const payload = {
                berasTarget: 14200,
                berasMin: 13000,
                berasMax: 15200,
                gabahTarget: 6800,
                gabahMin: 6100,
                gabahMax: 7600,
            };

            const res = await PUT(mockRequest(payload));
            expect(res.status).toBe(200);
            const json = await res.json();
            expect(json.data.beras.target).toBe(14200);
            expect(mockSavedDoc.save).toHaveBeenCalled();
        });

        it('should reject invalid validation payload (e.g. negative prices)', async () => {
            (getServerSession as any).mockResolvedValue({
                user: { id: 'super1', role: 'superadmin', name: 'Super Admin' },
            });

            const payload = {
                berasTarget: -14000, // Invalid negative
                berasMin: 13000,
                berasMax: 15200,
                gabahTarget: 6800,
                gabahMin: 6100,
                gabahMax: 7600,
            };

            const res = await PUT(mockRequest(payload));
            expect(res.status).toBe(400);
        });
    });
});
