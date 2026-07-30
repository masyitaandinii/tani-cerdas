import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcrypt';
import { authOptions } from '../app/lib/auth';

// Mock dependencies
vi.mock('../app/lib/db', () => ({
    default: vi.fn().mockResolvedValue(true)
}));

vi.mock('../app/lib/models/User', () => ({
    User: {
        findOne: vi.fn()
    }
}));

describe('Auth Credentials Logic', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should extract correct roles in jwt and session callbacks', async () => {
        const mockUser = {
            id: '123',
            name: 'Test',
            role: 'admin',
            assignedDusun: 2
        } as any;
        
        // Test JWT Callback
        const jwtCallback = authOptions.callbacks?.jwt as any;
        const token = await jwtCallback({ token: {}, user: mockUser });
        expect(token.role).toBe('admin');
        expect(token.assignedDusun).toBe(2);

        // Test Session Callback
        const sessionCallback = authOptions.callbacks?.session as any;
        const session = await sessionCallback({ session: { user: {} }, token });
        expect(session.user.role).toBe('admin');
        expect(session.user.assignedDusun).toBe(2);
    });
});
