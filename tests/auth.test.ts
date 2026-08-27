/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcrypt';
import { authOptions } from '../app/lib/auth';
import { User } from '../app/lib/models/User';

// Mock dependencies
vi.mock('../app/lib/db', () => ({
    default: vi.fn().mockResolvedValue(true)
}));

vi.mock('../app/lib/models/User', () => ({
    User: {
        findOne: vi.fn()
    }
}));

vi.mock('bcrypt', () => ({
    default: {
        compare: vi.fn()
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

describe('Auth Credentials Provider - authorize', () => {
    let authorize: any;

    beforeEach(() => {
        vi.clearAllMocks();
        const credentialsProvider: any = authOptions.providers.find(
            (p: any) => p.id === 'credentials'
        );
        authorize = credentialsProvider.options.authorize;
    });

    it('throws error if missing credentials', async () => {
        await expect(authorize(null)).rejects.toThrow('Username and password are required');
    });

    it('throws error if user not found', async () => {
        vi.mocked(User.findOne).mockResolvedValueOnce(null);
        await expect(authorize({ username: 'test', password: '123' })).rejects.toThrow('Invalid username or password');
    });

    it('throws error if password invalid', async () => {
        vi.mocked(User.findOne).mockResolvedValueOnce({
            password: 'hashedpassword',
        });
        vi.mocked(bcrypt.compare).mockResolvedValueOnce(false as never);
        await expect(authorize({ username: 'test', password: 'wrong' })).rejects.toThrow('Invalid username or password');
    });

    it('returns user object if valid', async () => {
        vi.mocked(User.findOne).mockResolvedValueOnce({
            _id: { toString: () => '12345' },
            name: 'Test Admin',
            role: 'admin',
            assignedDusun: 1,
            password: 'hashedpassword',
        });
        vi.mocked(bcrypt.compare).mockResolvedValueOnce(true as never);

        const result = await authorize({ username: 'test', password: 'password' });
        expect(result).toEqual({
            id: '12345',
            name: 'Test Admin',
            role: 'admin',
            assignedDusun: 1,
        });
    });

    it('resolves alias superadmin and trims whitespace', async () => {
        // First findOne (regex username) returns null, second (regex name) returns null, third (alias superadmin) returns user
        vi.mocked(User.findOne)
            .mockResolvedValueOnce(null)
            .mockResolvedValueOnce(null)
            .mockResolvedValueOnce({
                _id: { toString: () => 'super-id' },
                name: 'Desa Kedungrejo',
                role: 'superadmin',
                password: 'hashedpassword',
            } as any);
        vi.mocked(bcrypt.compare).mockResolvedValueOnce(true as never);

        const result = await authorize({ username: '  superadmin  ', password: '123' });
        expect(result).toEqual({
            id: 'super-id',
            name: 'Desa Kedungrejo',
            role: 'superadmin',
            assignedDusun: undefined,
        });
    });

    it('resolves alias admin1 for dusun 1', async () => {
        vi.mocked(User.findOne)
            .mockResolvedValueOnce(null)
            .mockResolvedValueOnce(null)
            .mockResolvedValueOnce({
                _id: { toString: () => 'admin1-id' },
                name: 'Dusun Karangpilang',
                role: 'admin',
                assignedDusun: 1,
                password: 'hashedpassword',
            } as any);
        vi.mocked(bcrypt.compare).mockResolvedValueOnce(true as never);

        const result = await authorize({ username: 'admin1', password: '123' });
        expect(result).toEqual({
            id: 'admin1-id',
            name: 'Dusun Karangpilang',
            role: 'admin',
            assignedDusun: 1,
        });
    });
});
