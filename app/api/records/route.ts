import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../lib/auth';
import connectToDatabase from '../../lib/db';
import { TengkulakRecord } from '../../lib/models/TengkulakRecord';
import { z } from 'zod';
import { ROLES, DUSUN_LIMITS } from '../../lib/constants';

const RecordSchema = z.object({
    nama: z.string().min(1),
    dusun: z.number().int().min(DUSUN_LIMITS.MIN).max(DUSUN_LIMITS.MAX),
    hargaBeras: z.number().positive(),
    hargaGabah: z.number().positive(),
    kuartal: z.enum(['Q1', 'Q2', 'Q3', 'Q4']),
    totalPanen: z.number().positive()
});

export async function GET() {
    try {
        await connectToDatabase();
        
        const records = await TengkulakRecord.find({}).lean();

        const formattedRecords = records.map(r => {
            // Strip authorId to avoid exposing internal DB user IDs, but expose the real 'nama' to everyone
            // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
            const { authorId, _id, ...rest } = r as any;
            return { ...rest, id: _id.toString() };
        });

        return NextResponse.json(formattedRecords);
    } catch (error) {
        console.error('GET /api/records error:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: null }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized', details: null }, { status: 401 });
        }

        const role = session.user.role;
        if (role !== ROLES.ADMIN && role !== ROLES.SUPERADMIN) {
            return NextResponse.json({ error: 'Forbidden', details: null }, { status: 403 });
        }

        const body = await request.json();
        
        // Validate with Zod
        const parsed = RecordSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: 'Invalid input', details: parsed.error.issues }, { status: 400 });
        }

        const data = parsed.data;

        // RBAC validation: Admin can only post to their assignedDusun
        if (role === ROLES.ADMIN) {
            if (!session.user.assignedDusun) {
                return NextResponse.json({ error: 'Forbidden: Admin does not have an assigned dusun', details: null }, { status: 403 });
            }
            // Override dusun payload to prevent injection
            data.dusun = session.user.assignedDusun;
        }

        await connectToDatabase();

        const newRecord = await TengkulakRecord.create({
            ...data,
            authorId: session.user.id
        });

        const recordObj = newRecord.toObject();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { _id, ...restObj } = recordObj as any;

        return NextResponse.json({ ...restObj, id: _id.toString() }, { status: 201 });
    } catch (error) {
        console.error('POST /api/records error:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: null }, { status: 500 });
    }
}
