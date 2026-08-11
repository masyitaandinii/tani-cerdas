import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import connectToDatabase from '../../../lib/db';
import { User } from '../../../lib/models/User';
import { ROLES } from '../../../lib/constants';

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || (session.user.role !== ROLES.ADMIN && session.user.role !== ROLES.SUPERADMIN)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q') || '';

        await connectToDatabase();

        // Only return users with role: USER
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const filter: any = { role: ROLES.USER };

        if (session.user.role === ROLES.ADMIN) {
            if (session.user.assignedDusun) {
                filter.assignedDusun = session.user.assignedDusun;
            } else {
                return NextResponse.json({ error: 'Forbidden: Admin missing assignedDusun' }, { status: 403 });
            }
        } else if (session.user.role === ROLES.SUPERADMIN) {
            const dusunParam = searchParams.get('dusun');
            if (dusunParam) {
                filter.assignedDusun = parseInt(dusunParam, 10);
            }
        }

        if (query) {
            const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            filter.name = { $regex: escapedQuery, $options: 'i' };
        }

        // We only need the name
        const users = await User.find(filter).select('name').limit(20).lean();

        return NextResponse.json(users);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
