import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/properties
export async function GET() {
    try {
        const properties = await prisma.property.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { rooms: true, tenants: true }
                }
            }
        });
        return NextResponse.json(properties);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/properties
export async function POST(request) {
    try {
        const body = await request.json();
        const property = await prisma.property.create({
            data: body,
        });
        return NextResponse.json(property, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
