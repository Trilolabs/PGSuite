import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/rooms/[id]
export async function GET(request, { params }) {
    const { id } = await params;
    try {
        const room = await prisma.room.findUnique({
            where: { id },
            include: {
                tenants: true,
                property: {
                    select: { name: true }
                }
            }
        });
        if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 });
        return NextResponse.json(room);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT /api/rooms/[id]
export async function PUT(request, { params }) {
    const { id } = await params;
    try {
        const body = await request.json();
        if (body.amenities && Array.isArray(body.amenities)) {
            body.amenities = JSON.stringify(body.amenities);
        }
        const room = await prisma.room.update({
            where: { id },
            data: body,
        });
        return NextResponse.json(room);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

// DELETE /api/rooms/[id]
export async function DELETE(request, { params }) {
    const { id } = await params;
    try {
        await prisma.room.delete({
            where: { id },
        });
        return NextResponse.json({ message: 'Room deleted' });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
