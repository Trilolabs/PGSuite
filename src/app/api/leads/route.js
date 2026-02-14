import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/leads?propertyId=PROP001&status=New
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    const status = searchParams.get('status');

    try {
        const where = {};
        if (propertyId) where.propertyId = propertyId;
        if (status) where.status = status;

        const leads = await prisma.lead.findMany({
            where,
            orderBy: { addedOn: 'desc' },
        });
        return NextResponse.json(leads);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/leads
export async function POST(request) {
    try {
        const body = await request.json();
        const lead = await prisma.lead.create({
            data: body,
        });
        return NextResponse.json(lead, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
