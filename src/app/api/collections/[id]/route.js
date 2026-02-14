import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/collections/[id]
export async function GET(request, { params }) {
    const { id } = await params;
    try {
        const collection = await prisma.collection.findUnique({
            where: { id },
            include: {
                tenant: true
            }
        });
        if (!collection) return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
        return NextResponse.json(collection);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT /api/collections/[id]
export async function PUT(request, { params }) {
    const { id } = await params;
    try {
        const body = await request.json();
        const collection = await prisma.collection.update({
            where: { id },
            data: body,
        });
        return NextResponse.json(collection);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

// DELETE /api/collections/[id]
export async function DELETE(request, { params }) {
    const { id } = await params;
    try {
        await prisma.collection.delete({
            where: { id },
        });
        return NextResponse.json({ message: 'Collection deleted' });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
