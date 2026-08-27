import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import connectToDatabase from '../../../lib/db';
import { User } from '../../../lib/models/User';
import { ROLES } from '../../../lib/constants';
import bcrypt from 'bcrypt';
import { z } from 'zod';

const UpdateUserSchema = z.object({
    name: z.string().min(1).optional(),
    password: z.string().optional(),
    whatsapp: z.string().optional(),
});

function hasPermission(sessionUser: any, targetUser: any) {
    if (sessionUser.role === ROLES.SUPERADMIN) return true;
    // User can edit their own profile
    if (sessionUser.id === targetUser.id?.toString() || sessionUser.id === targetUser._id?.toString()) return true;
    if (sessionUser.role === ROLES.ADMIN) {
        // Admin can only manage non-admins and non-superadmins in their assigned dusun
        return targetUser.role !== ROLES.SUPERADMIN && 
               targetUser.role !== ROLES.ADMIN && 
               targetUser.assignedDusun === sessionUser.assignedDusun;
    }
    return false;
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

        if (session.user.role !== ROLES.SUPERADMIN && session.user.role !== ROLES.ADMIN) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await connectToDatabase();

        const user = await User.findById(id);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (!hasPermission(session.user, user)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await User.findByIdAndDelete(id);

        return NextResponse.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('DELETE /api/users/[id] error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        const { id } = await params;

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const parsed = UpdateUserSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: 'Invalid input', details: parsed.error.issues }, { status: 400 });
        }

        await connectToDatabase();

        const user = await User.findById(id);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (!hasPermission(session.user, user)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        if (parsed.data.name) {
            user.name = parsed.data.name;
        }
        if (parsed.data.whatsapp !== undefined) {
            user.whatsapp = parsed.data.whatsapp;
        }
        if (parsed.data.password && parsed.data.password.trim() !== '') {
            user.password = await bcrypt.hash(parsed.data.password, 10);
        }

        await user.save();

        return NextResponse.json({
            message: 'User updated successfully',
            data: {
                id: user._id.toString(),
                name: user.name,
                username: user.username,
                role: user.role,
                assignedDusun: user.assignedDusun,
                whatsapp: user.whatsapp
            }
        });
    } catch (error) {
        console.error('PATCH /api/users/[id] error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
