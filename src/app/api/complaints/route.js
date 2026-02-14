import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/complaints?propertyId=PROP001&status=Open
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    const status = searchParams.get('status');

    try {
        const where = {};
        if (propertyId) where.propertyId = propertyId;
        if (status) where.status = status;

        const complaints = await prisma.complaint.findMany({
            where,
            orderBy: { date: 'desc' },
            include: {
                tenant: {
                    select: { name: true, room: { select: { number: true } } }
                }
            }
        });
        return NextResponse.json(complaints);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/complaints
export async function POST(request) {
    try {
        const body = await request.json();
        const complaint = await prisma.complaint.create({
            data: body,
        });
        return NextResponse.json(complaint, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
