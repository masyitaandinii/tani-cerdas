import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../lib/auth';
import connectToDatabase from '../../lib/db';
import { PriceBenchmark } from '../../lib/models/PriceBenchmark';
import { GOVERNMENT_PRICE_BENCHMARKS, ROLES } from '../../lib/constants';
import { z } from 'zod';

const UpdateBenchmarkSchema = z.object({
    berasTarget: z.number().positive({ message: "Harga acuan beras harus positif" }),
    berasMin: z.number().positive({ message: "HET beras minimal harus positif" }),
    berasMax: z.number().positive({ message: "HET beras maksimal harus positif" }),
    gabahTarget: z.number().positive({ message: "Harga acuan gabah harus positif" }),
    gabahMin: z.number().positive({ message: "HPP gabah minimal harus positif" }),
    gabahMax: z.number().positive({ message: "HPP gabah maksimal harus positif" }),
}).refine((data) => data.berasMin <= data.berasMax, {
    message: "HET Beras Minimal tidak boleh lebih besar dari Maksimal",
    path: ["berasMin"],
}).refine((data) => data.gabahMin <= data.gabahMax, {
    message: "HPP Gabah Minimal tidak boleh lebih besar dari Maksimal",
    path: ["gabahMin"],
});

export async function GET() {
    try {
        await connectToDatabase();

        let benchmark = await PriceBenchmark.findOne().sort({ updatedAt: -1 }).lean();

        if (!benchmark) {
            // Inisialisasi default dari constants jika belum ada data di DB
            const created = await PriceBenchmark.create({
                beras: GOVERNMENT_PRICE_BENCHMARKS.beras,
                gabah: GOVERNMENT_PRICE_BENCHMARKS.gabah,
                updatedBy: 'Sistem Standar (Bapanas)'
            });
            benchmark = created && typeof (created as any).toObject === 'function' ? (created as any).toObject() : created;
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
        const { _id, __v, ...rest } = (benchmark || {}) as any;

        return NextResponse.json({
            data: {
                id: _id ? _id.toString() : undefined,
                ...rest
            }
        });
    } catch (error) {
        console.error('GET /api/benchmarks error:', error);
        // Fallback gracefully to constants if database is unreachable
        return NextResponse.json({
            data: {
                beras: GOVERNMENT_PRICE_BENCHMARKS.beras,
                gabah: GOVERNMENT_PRICE_BENCHMARKS.gabah,
                updatedBy: 'Sistem Default (Bapanas)',
                updatedAt: new Date().toISOString()
            }
        });
    }
}

export async function PUT(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const role = session.user.role;
        if (role !== ROLES.ADMIN && role !== ROLES.SUPERADMIN) {
            return NextResponse.json({ error: 'Forbidden: Hanya Admin atau Superadmin yang dapat memperbarui acuan harga Bapanas' }, { status: 403 });
        }

        const body = await request.json();
        const parsed = UpdateBenchmarkSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({
                error: 'Validasi gagal',
                details: parsed.error.issues
            }, { status: 400 });
        }

        await connectToDatabase();

        const data = parsed.data;
        const updatedData = {
            beras: {
                min: data.berasMin,
                max: data.berasMax,
                target: data.berasTarget,
                label: GOVERNMENT_PRICE_BENCHMARKS.beras.label,
                description: GOVERNMENT_PRICE_BENCHMARKS.beras.description,
                unit: "Rp/kg"
            },
            gabah: {
                min: data.gabahMin,
                max: data.gabahMax,
                target: data.gabahTarget,
                label: GOVERNMENT_PRICE_BENCHMARKS.gabah.label,
                description: GOVERNMENT_PRICE_BENCHMARKS.gabah.description,
                unit: "Rp/kg"
            },
            updatedBy: session.user.name || (role === ROLES.SUPERADMIN ? 'Superadmin' : 'Admin Desa')
        };

        const existing = await PriceBenchmark.findOne().sort({ updatedAt: -1 });

        let resultDoc;
        if (existing) {
            existing.beras = updatedData.beras;
            existing.gabah = updatedData.gabah;
            existing.updatedBy = updatedData.updatedBy;
            resultDoc = await existing.save();
        } else {
            resultDoc = await PriceBenchmark.create(updatedData);
        }

        const resObj = resultDoc.toObject();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
        const { _id, __v, ...rest } = resObj as any;

        return NextResponse.json({
            message: 'Acuan harga Bapanas berhasil diperbarui',
            data: {
                id: _id ? _id.toString() : undefined,
                ...rest
            }
        });
    } catch (error) {
        console.error('PUT /api/benchmarks error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
