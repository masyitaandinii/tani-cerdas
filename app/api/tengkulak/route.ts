import { NextResponse } from 'next/server';
import connectToDatabase from '../../lib/db';
import { User } from '../../lib/models/User';
import { ROLES, DUSUN_NAMES } from '../../lib/constants';

export async function GET(request: Request) {
    try {
        await connectToDatabase();

        const { searchParams } = new URL(request.url);
        const dusun = searchParams.get('dusun');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const filter: any = { role: ROLES.USER };
        if (dusun && dusun !== 'ALL') {
            const parsedDusun = parseInt(dusun, 10);
            if (!isNaN(parsedDusun)) {
                filter.assignedDusun = parsedDusun;
            }
        }

        const tengkulaks = await User.find(filter)
            .select('name username assignedDusun whatsapp phone createdAt')
            .sort({ assignedDusun: 1, name: 1 })
            .lean();

        const formatted = tengkulaks.map((t) => {
            const dusunNum = t.assignedDusun || 1;
            return {
                id: String(t._id),
                name: t.name,
                username: t.username,
                assignedDusun: dusunNum,
                dusunName: DUSUN_NAMES[dusunNum] || `Dusun ${dusunNum}`,
                whatsapp: t.whatsapp || t.phone || '',
            };
        });

        return NextResponse.json({ data: formatted });
    } catch (error) {
        console.error('GET /api/tengkulak error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
