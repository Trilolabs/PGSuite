import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/rooms?propertyId=PROP001
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');

    try {
        const where = propertyId ? { propertyId } : {};
        const rooms = await prisma.room.findMany({
            where,
            orderBy: { number: 'asc' },
            include: {
                tenants: {
                    select: { id: true, name: true }
                }
            }
        });
        return NextResponse.json(rooms);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/rooms
export async function POST(request) {
    try {
        const body = await request.json();
        // Use amenities as JSON string if not already
        if (body.amenities && Array.isArray(body.amenities)) {
            body.amenities = JSON.stringify(body.amenities);
        }
        const room = await prisma.room.create({
            data: body,
        });
        return NextResponse.json(room, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
