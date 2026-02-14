import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/bookings?propertyId=PROP001&status=Pending
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    const status = searchParams.get('status');

    try {
        const where = {};
        if (propertyId) where.propertyId = propertyId;
        if (status) where.status = status;

        const bookings = await prisma.booking.findMany({
            where,
            orderBy: { bookingDate: 'desc' },
        });
        return NextResponse.json(bookings);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/bookings
export async function POST(request) {
    try {
        const body = await request.json();
        const booking = await prisma.booking.create({
            data: body,
        });
        return NextResponse.json(booking, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
