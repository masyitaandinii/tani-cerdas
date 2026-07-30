import { describe, it, expect } from 'vitest';
import { User } from '../app/lib/models/User';
import { TengkulakRecord } from '../app/lib/models/TengkulakRecord';

describe('Mongoose Models Validation', () => {
    it('should validate User model properly', () => {
        // Valid superadmin
        const superadmin = new User({
            username: 'admin_super',
            name: 'Super Admin',
            role: 'superadmin'
        });
        const err1 = superadmin.validateSync();
        expect(err1).toBeUndefined();

        // Valid admin with assignedDusun
        const admin = new User({
            username: 'admin1',
            name: 'Admin Dusun 1',
            role: 'admin',
            assignedDusun: 1
        });
        const err2 = admin.validateSync();
        expect(err2).toBeUndefined();

        // Invalid role
        const invalidUser = new User({
            username: 'hacker',
            name: 'Hacker',
            role: 'unknown_role'
        });
        const err3 = invalidUser.validateSync();
        expect(err3).toBeDefined();
        expect(err3?.errors['role']).toBeDefined();
    });

    it('should validate TengkulakRecord model properly', () => {
        const validRecord = new TengkulakRecord({
            nama: 'Budi',
            dusun: 1,
            hargaBeras: 12000,
            hargaGabah: 6000,
            kuartal: 'Q1',
            totalPanen: 1500
        });
        const err1 = validRecord.validateSync();
        expect(err1).toBeUndefined();

        const invalidRecord = new TengkulakRecord({
            nama: 'Ani',
            dusun: 5, // Invalid dusun (must be 1-4)
            hargaBeras: 12000,
            hargaGabah: 6000,
            kuartal: 'Q5', // Invalid kuartal
            totalPanen: 1500
        });
        const err2 = invalidRecord.validateSync();
        expect(err2).toBeDefined();
        expect(err2?.errors['dusun']).toBeDefined();
        expect(err2?.errors['kuartal']).toBeDefined();
    });
});
