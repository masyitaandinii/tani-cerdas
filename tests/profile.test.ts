/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PATCH } from '../app/api/users/[id]/route';
import { User } from '../app/lib/models/User';

// Mock dependencies
vi.mock('next-auth', () => ({
    default: vi.fn(),
    getServerSession: vi.fn(),
}));
import { getServerSession } from 'next-auth';

vi.mock('../app/lib/db', () => ({
    default: vi.fn().mockResolvedValue(true),
}));

vi.mock('../app/lib/models/User', () => ({
    User: {
        findById: vi.fn(),
    },
}));

vi.mock('bcrypt', () => ({
    default: {
        hash: vi.fn().mockResolvedValue('hashedPassword123'),
    },
}));

const mockRequest = (body: any = null) => {
    return {
        json: async () => body,
    } as any;
};

describe('User Profile Update API (/api/users/[id])', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should reject unauthenticated requests', async () => {
        (getServerSession as any).mockResolvedValue(null);
        const res = await PATCH(mockRequest({ name: 'New Name' }), {
            params: Promise.resolve({ id: 'user123' }),
        });
        expect(res.status).toBe(401);
    });

    it('should allow a Tengkulak user to update their own profile (name, whatsapp, password)', async () => {
        (getServerSession as any).mockResolvedValue({
            user: { id: 'tengkulak123', role: 'tengkulak', name: 'Old Tengkulak' },
        });

        const mockUserDoc = {
            _id: 'tengkulak123',
            name: 'Old Tengkulak',
            username: 'oldtengkulak',
            role: 'tengkulak',
            assignedDusun: 2,
            whatsapp: '081111111',
            save: vi.fn().mockResolvedValue(true),
        };

        (User.findById as any).mockResolvedValue(mockUserDoc);

        const res = await PATCH(
            mockRequest({
                name: 'Budi Santoso Baru',
                whatsapp: '0899999999',
                password: 'newsecretpassword',
            }),
            {
                params: Promise.resolve({ id: 'tengkulak123' }),
            }
        );

        expect(res.status).toBe(200);
        expect(mockUserDoc.name).toBe('Budi Santoso Baru');
        expect(mockUserDoc.whatsapp).toBe('0899999999');
        expect(mockUserDoc.save).toHaveBeenCalled();
    });

    it('should allow an Admin to update their own profile', async () => {
        (getServerSession as any).mockResolvedValue({
            user: { id: 'admin123', role: 'admin', name: 'Admin Dusun 1' },
        });

        const mockAdminDoc = {
            _id: 'admin123',
            name: 'Admin Dusun 1',
            username: 'admin1',
            role: 'admin',
            assignedDusun: 1,
            whatsapp: '',
            save: vi.fn().mockResolvedValue(true),
        };

        (User.findById as any).mockResolvedValue(mockAdminDoc);

        const res = await PATCH(
            mockRequest({
                name: 'Admin Utama Dusun 1',
                whatsapp: '08123456789',
            }),
            {
                params: Promise.resolve({ id: 'admin123' }),
            }
        );

        expect(res.status).toBe(200);
        expect(mockAdminDoc.name).toBe('Admin Utama Dusun 1');
        expect(mockAdminDoc.whatsapp).toBe('08123456789');
        expect(mockAdminDoc.save).toHaveBeenCalled();
    });

    it('should reject a Tengkulak trying to edit another user profile', async () => {
        (getServerSession as any).mockResolvedValue({
            user: { id: 'tengkulak123', role: 'tengkulak', name: 'Tengkulak 1' },
        });

        const otherUserDoc = {
            _id: 'other456',
            id: 'other456',
            name: 'Other User',
            role: 'tengkulak',
        };

        (User.findById as any).mockResolvedValue(otherUserDoc);

        const res = await PATCH(
            mockRequest({ name: 'Hacked Name' }),
            {
                params: Promise.resolve({ id: 'other456' }),
            }
        );

        expect(res.status).toBe(403);
    });
});
