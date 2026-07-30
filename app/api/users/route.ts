import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../lib/auth';
import connectToDatabase from '../../lib/db';
import { User } from '../../lib/models/User';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { ROLES, DUSUN_LIMITS } from '../../lib/constants';

const UserInputSchema = z.object({
    username: z.string().min(3),
    password: z.string().min(1),
    name: z.string().min(1),
    role: z.enum(['admin', 'tengkulak']),
    assignedDusun: z.number().int().min(DUSUN_LIMITS.MIN).max(DUSUN_LIMITS.MAX)
});

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized', details: null }, { status: 401 });
        }

        // Only superadmin can create users
        if (session.user.role !== ROLES.SUPERADMIN) {
            return NextResponse.json({ error: 'Forbidden. Only Superadmin can manage users.', details: null }, { status: 403 });
        }

        const body = await request.json();
        const parsed = UserInputSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: 'Invalid input', details: parsed.error.issues }, { status: 400 });
        }

        await connectToDatabase();

        const { username, password, name, role, assignedDusun } = parsed.data;

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return NextResponse.json({ error: 'Username sudah digunakan', details: null }, { status: 409 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            username,
            password: hashedPassword,
            name,
            role,
            assignedDusun
        });

        return NextResponse.json({ message: 'User berhasil dibuat', id: newUser._id.toString() }, { status: 201 });
    } catch (error) {
        console.error('POST /api/users error:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: null }, { status: 500 });
    }
}
