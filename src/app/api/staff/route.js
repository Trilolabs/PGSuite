import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/staff?propertyId=PROP001&role=Manager
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    const role = searchParams.get('role');

    try {
        const where = {};
        if (propertyId) where.propertyId = propertyId;
        if (role) where.role = role;

        const staff = await prisma.staff.findMany({
            where,
            orderBy: { name: 'asc' },
        });
        return NextResponse.json(staff);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/staff
export async function POST(request) {
    try {
        const body = await request.json();
        const staffMember = await prisma.staff.create({
            data: body,
        });
        return NextResponse.json(staffMember, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
