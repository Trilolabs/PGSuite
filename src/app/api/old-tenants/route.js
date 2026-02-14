import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/old-tenants?propertyId=PROP001
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');

    try {
        const where = {};
        if (propertyId) where.propertyId = propertyId;

        const oldTenants = await prisma.oldTenant.findMany({
            where,
            orderBy: { moveOut: 'desc' },
        });
        return NextResponse.json(oldTenants);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/old-tenants - Usually created via Tenant delete, but can be manual
export async function POST(request) {
    try {
        const body = await request.json();
        const oldTenant = await prisma.oldTenant.create({
            data: body,
        });
        return NextResponse.json(oldTenant, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
