import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import connectToDatabase from '../../../lib/db';
import { User } from '../../../lib/models/User';
import { ROLES } from '../../../lib/constants';

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

        if (session.user.role !== ROLES.SUPERADMIN) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await connectToDatabase();

        const user = await User.findById(id);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        await User.findByIdAndDelete(id);

        return NextResponse.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('DELETE /api/users/[id] error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
