import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../lib/auth';
import connectToDatabase from '../../lib/db';
import { TengkulakRecord } from '../../lib/models/TengkulakRecord';
import { User } from '../../lib/models/User';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { ROLES, DUSUN_LIMITS, GOVERNMENT_PRICE_BENCHMARKS } from '../../lib/constants';

const RecordSchema = z.object({
    nama: z.string().min(1),
    dusun: z.number().int().min(DUSUN_LIMITS.MIN).max(DUSUN_LIMITS.MAX),
    hargaBeras: z.number().positive(),
    hargaGabah: z.number().positive(),
    kuartal: z.enum(['Q1', 'Q2', 'Q3', 'Q4']),
    totalPanen: z.number().positive()
});

export async function GET(request: Request) {
    try {
        await connectToDatabase();
        
        const { searchParams } = new URL(request.url);
        
        const page = parseInt(searchParams.get('page') || '1', 10);
        const requestedLimit = parseInt(searchParams.get('limit') || '0', 10);
        const limit = requestedLimit === 0 ? 1000 : Math.min(requestedLimit, 1000);
        const isPaginated = requestedLimit !== 0;
        const dusun = searchParams.get('dusun');

        const query: Record<string, unknown> = {};
        if (dusun) {
            query.dusun = parseInt(dusun, 10);
        }

        const skip = limit > 0 ? (page - 1) * limit : 0;
        
        const [records, total] = await Promise.all([
            limit > 0 ? TengkulakRecord.find(query).sort({ timestamp: -1 }).skip(skip).limit(limit).lean() : TengkulakRecord.find(query).sort({ timestamp: -1 }).lean(),
            TengkulakRecord.countDocuments(query)
        ]);

        // Format data: Sembunyikan authorId internal untuk keamanan
        const formattedRecords = records.map((r) => {
            // Strip authorId to avoid exposing internal DB user IDs
            // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
            const { authorId, _id, ...rest } = r as any;
            return { ...rest, id: _id.toString() };
        });

        if (isPaginated) {
            return NextResponse.json({
                data: formattedRecords,
                meta: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            });
        }

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
        if (role !== ROLES.ADMIN && role !== ROLES.SUPERADMIN && role !== ROLES.USER) {
            return NextResponse.json({ error: 'Forbidden', details: null }, { status: 403 });
        }

        const body = await request.json();
        
        // Validate with Zod
        const parsed = RecordSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: 'Invalid input', details: parsed.error.issues }, { status: 400 });
        }

        const data = parsed.data;

        // RBAC validation
        if (role === ROLES.USER) {
            // Tengkulak submissions are forced to use their verified name and assigned dusun
            if (session.user.name) {
                data.nama = session.user.name;
            }
            if (session.user.assignedDusun) {
                data.dusun = session.user.assignedDusun;
            }
        } else if (role === ROLES.ADMIN) {
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

        // Auto-create user for the tengkulak if not exists (when added by Admin/Superadmin)
        if (role !== ROLES.USER) {
            const generatedUsername = data.nama.toLowerCase().replace(/\s+/g, '');
            const existingUser = await User.findOne({ username: generatedUsername });
            if (!existingUser) {
                const hashedPassword = await bcrypt.hash('tani123', 10);
                await User.create({
                    username: generatedUsername,
                    password: hashedPassword,
                    name: data.nama,
                    role: ROLES.USER,
                    assignedDusun: data.dusun
                });
            }
        }

        const isAboveBenchmark = 
            data.hargaBeras > GOVERNMENT_PRICE_BENCHMARKS.beras.max ||
            data.hargaGabah > GOVERNMENT_PRICE_BENCHMARKS.gabah.max;

        const recordObj = newRecord.toObject();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { _id, ...restObj } = recordObj as any;

        return NextResponse.json({
            ...restObj,
            id: _id.toString(),
            warning: isAboveBenchmark ? 'Harga yang dimasukkan melebihi batas acuan pemerintah (HET/HPP).' : null
        }, { status: 201 });
    } catch (error) {
        console.error('POST /api/records error:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: null }, { status: 500 });
    }
}
