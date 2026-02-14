import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/bookings/[id]
export async function GET(request, { params }) {
    const { id } = await params;
    try {
        const booking = await prisma.booking.findUnique({
            where: { id },
        });
        if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        return NextResponse.json(booking);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT /api/bookings/[id]
export async function PUT(request, { params }) {
    const { id } = await params;
    try {
        const body = await request.json();
        const booking = await prisma.booking.update({
            where: { id },
            data: body,
        });
        return NextResponse.json(booking);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

// DELETE /api/bookings/[id]
export async function DELETE(request, { params }) {
    const { id } = await params;
    try {
        await prisma.booking.delete({
            where: { id },
        });
        return NextResponse.json({ message: 'Booking deleted' });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
