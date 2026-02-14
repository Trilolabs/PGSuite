import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/collections?propertyId=PROP001&tenantId=T001&from=2026-02-01&to=2026-02-28
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    const tenantId = searchParams.get('tenantId');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    try {
        const where = {};
        if (propertyId) where.propertyId = propertyId;
        if (tenantId) where.tenantId = tenantId;
        if (from || to) {
            where.date = {};
            if (from) where.date.gte = from;
            if (to) where.date.lte = to;
        }

        const collections = await prisma.collection.findMany({
            where,
            orderBy: { date: 'desc' },
            include: {
                tenant: {
                    select: { name: true, room: { select: { number: true } } }
                }
            }
        });
        return NextResponse.json(collections);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/collections
export async function POST(request) {
    try {
        const body = await request.json();
        const { dueIds, tenantId, propertyId, date, amount, mode, receipt, receivedBy } = body;

        const result = await prisma.$transaction(async (prisma) => {
            // 1. Create Collection
            const collection = await prisma.collection.create({
                data: {
                    tenantId,
                    propertyId,
                    date,
                    amount,
                    mode,
                    receipt,
                    receivedBy: receivedBy || 'Admin',
                },
            });

            // 2. If blocked against dues, update them
            if (dueIds && dueIds.length > 0) {
                await prisma.due.updateMany({
                    where: { id: { in: dueIds } },
                    data: { status: 'Paid' },
                });
            }

            return collection;
        });

        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
