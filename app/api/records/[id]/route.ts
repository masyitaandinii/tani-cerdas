import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import connectToDatabase from '../../../lib/db';
import { TengkulakRecord } from '../../../lib/models/TengkulakRecord';
import { z } from 'zod';
import { ROLES, DUSUN_LIMITS } from '../../../lib/constants';

const RecordSchema = z.object({
    nama: z.string().min(1).optional(),
    dusun: z.number().int().min(DUSUN_LIMITS.MIN).max(DUSUN_LIMITS.MAX).optional(),
    hargaBeras: z.number().positive().optional(),
    hargaGabah: z.number().positive().optional(),
    kuartal: z.enum(['Q1', 'Q2', 'Q3', 'Q4']).optional(),
    totalPanen: z.number().nonnegative().optional()
});

export async function PATCH(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    return PUT(request, context);
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        const { id } = await params;

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const role = session.user.role;
        if (role !== ROLES.ADMIN && role !== ROLES.SUPERADMIN) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        
        const parsed = RecordSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: 'Invalid input', details: parsed.error.issues }, { status: 400 });
        }

        const data = parsed.data;

        await connectToDatabase();

        const existingRecord = await TengkulakRecord.findById(id);
        if (!existingRecord) {
            return NextResponse.json({ error: 'Record not found' }, { status: 404 });
        }

        if (role === ROLES.ADMIN) {
            if (!session.user.assignedDusun || existingRecord.dusun !== session.user.assignedDusun) {
                return NextResponse.json({ error: 'Forbidden: Admin can only edit records from their assigned dusun' }, { status: 403 });
            }
            if (data.dusun && data.dusun !== session.user.assignedDusun) {
                return NextResponse.json({ error: 'Forbidden: Admin cannot change the dusun to unassigned one' }, { status: 403 });
            }
        }

        const updatedRecord = await TengkulakRecord.findByIdAndUpdate(
            id,
            { $set: data },
            { new: true, runValidators: true }
        ).lean();

        if (!updatedRecord) {
            return NextResponse.json({ error: 'Record not found after update' }, { status: 404 });
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
        const { authorId, _id, ...rest } = updatedRecord as any;

        return NextResponse.json({ ...rest, id: _id.toString() });
    } catch (error) {
        console.error('PUT /api/records/[id] error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        const { id } = await params;

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const role = session.user.role;
        if (role !== ROLES.ADMIN && role !== ROLES.SUPERADMIN) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await connectToDatabase();

        const existingRecord = await TengkulakRecord.findById(id);
        if (!existingRecord) {
            return NextResponse.json({ error: 'Record not found' }, { status: 404 });
        }

        if (role === ROLES.ADMIN) {
            if (!session.user.assignedDusun || existingRecord.dusun !== session.user.assignedDusun) {
                return NextResponse.json({ error: 'Forbidden: Admin can only delete records from their assigned dusun' }, { status: 403 });
            }
        }

        await TengkulakRecord.findByIdAndDelete(id);

        return NextResponse.json({ message: 'Record deleted successfully' });
    } catch (error) {
        console.error('DELETE /api/records/[id] error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
