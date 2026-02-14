import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/properties/[id]
export async function GET(request, { params }) {
    const { id } = await params;
    try {
        const property = await prisma.property.findUnique({
            where: { id },
            include: {
                rooms: true,
                tenants: true,
            }
        });
        if (!property) return NextResponse.json({ error: 'Property not found' }, { status: 404 });
        return NextResponse.json(property);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT /api/properties/[id]
export async function PUT(request, { params }) {
    const { id } = await params;
    try {
        const body = await request.json();
        const property = await prisma.property.update({
            where: { id },
            data: body,
        });
        return NextResponse.json(property);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

// DELETE /api/properties/[id]
export async function DELETE(request, { params }) {
    const { id } = await params;
    try {
        await prisma.property.delete({
            where: { id },
        });
        return NextResponse.json({ message: 'Property deleted' });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
