import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import connectToDatabase from '../../../lib/db';
import { TengkulakRecord } from '../../../lib/models/TengkulakRecord';

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const dusun = searchParams.get('dusun');

        const query: Record<string, unknown> = {};
        if (dusun) {
            query.dusun = parseInt(dusun, 10);
        }

        // If user is admin, enforce their dusun
        if (session.user.role === 'admin') {
            if (!session.user.assignedDusun) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
            query.dusun = session.user.assignedDusun;
        }

        await connectToDatabase();

        // Calculate summary and graph data
        const stats = await TengkulakRecord.aggregate([
            { $match: query },
            {
                $group: {
                    _id: "$kuartal",
                    avgHargaBeras: { $avg: "$hargaBeras" },
                    avgHargaGabah: { $avg: "$hargaGabah" },
                    totalPanen: { $sum: "$totalPanen" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } } // Sort by kuartal (Q1, Q2, etc.)
        ]);

        const summary = await TengkulakRecord.aggregate([
            { $match: query },
            {
                $group: {
                    _id: null,
                    totalPanenSemua: { $sum: "$totalPanen" },
                    avgHargaBerasKeseluruhan: { $avg: "$hargaBeras" },
                    avgHargaGabahKeseluruhan: { $avg: "$hargaGabah" },
                    totalRecords: { $sum: 1 }
                }
            }
        ]);

        return NextResponse.json({
            graphData: stats.map(s => ({
                kuartal: s._id,
                avgHargaBeras: s.avgHargaBeras,
                avgHargaGabah: s.avgHargaGabah,
                totalPanen: s.totalPanen,
                count: s.count
            })),
            summary: summary.length > 0 ? {
                totalPanen: summary[0].totalPanenSemua,
                avgHargaBeras: summary[0].avgHargaBerasKeseluruhan,
                avgHargaGabah: summary[0].avgHargaGabahKeseluruhan,
                totalRecords: summary[0].totalRecords
            } : {
                totalPanen: 0,
                avgHargaBeras: 0,
                avgHargaGabah: 0,
                totalRecords: 0
            }
        });

    } catch (error) {
        console.error('GET /api/records/stats error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
