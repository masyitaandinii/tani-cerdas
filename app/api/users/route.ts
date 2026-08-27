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

        // Both superadmin and admin can create users
        if (session.user.role !== ROLES.SUPERADMIN && session.user.role !== ROLES.ADMIN) {
            return NextResponse.json({ error: 'Forbidden. Only Superadmin or Admin can manage users.', details: null }, { status: 403 });
        }

        const body = await request.json();
        const parsed = UserInputSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: 'Invalid input', details: parsed.error.issues }, { status: 400 });
        }

        if (session.user.role === ROLES.ADMIN) {
            if (parsed.data.assignedDusun !== session.user.assignedDusun) {
                return NextResponse.json({ error: 'Admin only can create users for their assigned dusun', details: null }, { status: 403 });
            }
            if (parsed.data.role === 'superadmin' || parsed.data.role === 'admin') {
                return NextResponse.json({ error: 'Admin cannot create superadmin or admin', details: null }, { status: 403 });
            }
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

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (session.user.role !== ROLES.SUPERADMIN && session.user.role !== ROLES.ADMIN) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '10', 10);
        const dusun = searchParams.get('dusun');

        const query: Record<string, unknown> = {};
        if (session.user.role === ROLES.ADMIN) {
            query.assignedDusun = session.user.assignedDusun;
        } else if (dusun) {
            query.assignedDusun = parseInt(dusun, 10);
        }

        await connectToDatabase();

        const skip = (page - 1) * limit;
        const [users, total] = await Promise.all([
            User.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            User.countDocuments(query)
        ]);

        const formattedUsers = users.map((u) => {
            const { _id, ...rest } = u as unknown as Record<string, unknown>;
            return { ...rest, id: String(_id) };
        });

        return NextResponse.json({
            data: formattedUsers,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('GET /api/users error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
