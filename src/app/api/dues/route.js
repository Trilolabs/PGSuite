import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/dues?propertyId=PROP001&tenantId=T001&status=Unpaid
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    const tenantId = searchParams.get('tenantId');
    const status = searchParams.get('status');

    try {
        const where = {};
        if (propertyId) where.propertyId = propertyId;
        if (tenantId) where.tenantId = tenantId;
        if (status) where.status = status;

        const dues = await prisma.due.findMany({
            where,
            orderBy: { dueDate: 'asc' },
            include: {
                tenant: {
                    select: { name: true, room: { select: { number: true } } }
                }
            }
        });
        return NextResponse.json(dues);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/dues
export async function POST(request) {
    try {
        const body = await request.json();
        const due = await prisma.due.create({
            data: body,
        });

        // Update property/tenant statistics? 
        // Usually handled by aggregation queries on demand, 
        // but we might want to update Tenant pendingDues summary if heavily used.
        // For now, keep it simple.

        return NextResponse.json(due, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
